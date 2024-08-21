import { Client } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import SockJS from 'sockjs-client';

import './App.css';

import { persistor } from './index.js';

import { RootState } from './redux/Store.tsx';
import { changeLogin } from './redux/UserSlice.tsx';

import Admin from './admin/Admin.tsx';
import Board from './board/Board.tsx';
import ControlPanel from './controlPanel/ControlPanel.tsx';
import CreateModal from './createModal/CreateModal.tsx';
import GameField from './gamefield/GameField.tsx';
import Slime from './gamefield/slimeset/Slime.tsx';
import Login from './login/Login.tsx';
import ObserverInfo from './observerInfo/ObserverInfo.tsx';
import PlayerInfo from './player/PlayerInfo.tsx';
import PlayResultModal from './playResultModal/PlayResultModal.tsx';
import RankingBoard from './ranker/RankingBoard.tsx';
import axios from 'axios';
import ObserverPanel from './observerInfo/ObserverPanel.tsx';


function App() {

  const wsTarget = process.env.REACT_APP_WS_TARGET || 'http://localhost:8080'

  const [isConn, setIsConn] = useState<boolean>(false)

  const ws = useRef<Client>()
  // Redux state 업데이트용
  const dispatch = useDispatch()

  const [createModal, setCreateModal] = useState(false)
  const [rankingModal, setRankingModal] = useState(false)
  const [boardModal, setBoardModal] = useState(false)
  const [playerModal, setPlayerModal] = useState(false)
  const [playResultModal, setPlayResultModal] = useState(false)
  const [adminModal, setAdminModal] = useState(false)

  const isLogin = useSelector((state: RootState) => state.user.isLogin)
  const isReady = useSelector((state: RootState) => state.game.isReady)
  const isPlaying = useSelector((state: RootState) => state.user.isPlaying)
  const isDead = useSelector((state: RootState) => state.user.isDead)
  const auth = useSelector((state: RootState) => state.user.auth)

  // 모달 관리 메소드들
  const showCreateModal = () => {
    setCreateModal(true)
  }

  const showRankingModal = () => {
    setRankingModal(true)
  }

  const showBoardModal = () => {
    setBoardModal(true)
  }

  const showPlayerModal = () => {
    setPlayerModal(true)
  }

  const showPlayResultModal = () => {
    setPlayResultModal(true)
  }

  const showAdminModal = () => {
    setAdminModal(true)
  }

  const handleLogout = () => {
    axios.get('/api/logout')
      .then((res) => {
        persistor.purge()
      })
      .catch((err) => { })
  }



  useEffect(() => {

    if (isLogin) {
      const client = new Client({
        webSocketFactory: () => new SockJS(wsTarget + '/ws'),
        onConnect: () => {
          console.log("Conneted!")
          setIsConn(true)
        },
        onStompError: (error) => {
          console.log("Address Error " + error)
        },
        onDisconnect: (error) => {
          console.log("Disconnetd! " + error)
          setIsConn(false)
        },
        onWebSocketClose: (error) => {
          console.log("WebSocketError! ")
          console.dir(error)
          dispatch(changeLogin({ isLogin: false }))
        },
        reconnectDelay: 15000, // 재연결 딜레이 (밀리초)
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      ws.current = client

      if (!ws.current.connected) {
        ws.current.activate()
      }

      return () => {
        if (client) {
          client.deactivate();
        }
      };
    }


  }, [isLogin])

  useEffect(() => {

    if (isDead) {
      showPlayResultModal()
    }

  }, [isDead])


  return (
    <div className="App">

      <Login client={ws.current}></Login>

      {isReady &&
        <>
          <Navbar>
            <Container style={{ justifyContent: "center" }}>
              <Row className='w-100 justify-content-between '>
                <Col xs={12} sm={6} style={{ paddingLeft: 0 }}>
                  <Navbar.Brand>
                    <Slime playerId={"navbarSlime"} direction={"down"} width={"96"} height={"96"} isAbsolute={false}></Slime>
                    <svg width="100%" height="100%" viewBox="-5 -30 200 50">
                      <text
                        x="0" y="0" fill="#3678ce"
                        fontFamily="SBAggroB"
                        fontSize="1rem"
                        rotate="4, 8, -8, -4, -20, -24, 48, 0, 0">
                        슬라임으로 살아남기
                      </text>
                    </svg>
                  </Navbar.Brand>
                </Col>
                <Col xs={12} sm={6} style={{ alignContent: "center" }}>
                  <Row className='Btn-Container'>
                    <Button className="Menu-Btn" variant="outline-light" onClick={showCreateModal}>플레이</Button>
                    <Button className="Menu-Btn" variant="outline-light" onClick={showRankingModal}>역대 랭킹</Button>
                    <Button className="Menu-Btn" variant="outline-light" onClick={showBoardModal}>게시판</Button>
                    <Button className="Menu-Btn" variant="outline-light" onClick={showPlayerModal}>플레이어</Button>
                    {isLogin && <Button className="Menu-Btn" variant="outline-light" onClick={handleLogout}>로그아웃</Button>}
                  </Row>
                </Col>
              </Row>
            </Container>
          </Navbar>

          <Container>
            <Row >
              {
                isConn && <>
                  <Col xs={12} sm={3}>
                    <ObserverInfo client={ws.current}/>
                    <ObserverPanel client={ws.current}/>
                    {(auth === 'ADMIN' || auth === 'MANAGER') && <Button className="Admin-Btn" variant="outline-light" onClick={showAdminModal}>관리모드</Button>}
                  </Col>
                  <Col xs={12} sm={9}>
                    <Stack gap={4} style={{ alignItems: "center" }}>
                      <GameField client={ws.current}></GameField>
                      {isPlaying && <ControlPanel client={ws.current}></ControlPanel>}
                    </Stack>
                  </Col>
                </>
              }
            </Row>
          </Container>

          <CreateModal show={createModal} onHide={() => setCreateModal(false)} client={ws.current}></CreateModal>
          <RankingBoard show={rankingModal} onHide={() => setRankingModal(false)} client={ws.current}></RankingBoard>
          <Board show={boardModal} onHide={() => setBoardModal(false)}></Board>
          <PlayerInfo show={playerModal} onHide={() => setPlayerModal(false)}></PlayerInfo>
          <PlayResultModal show={playResultModal} onHide={() => setPlayResultModal(false)} client={ws.current}></PlayResultModal>
          <Admin show={adminModal} onHide={() => setAdminModal(false)} client={ws.current}></Admin>
        </>
      }


    </div>
  );
}

export default App;
