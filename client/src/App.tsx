import { Client } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import SockJS from 'sockjs-client';

import './App.css';

import { persistor } from './index.js';

import { RootState } from './redux/Store.tsx';
import { changeLogin } from './redux/UserSlice.tsx';

import CreateModal from './createModal/CreateModal.tsx';
import GameField from './gamefield/GameField.tsx';
import Slime from './gamefield/slimeset/Slime.tsx';
import Login from './login/Login.tsx';
import ObserverInfo from './observerInfo/ObserverInfo.tsx';
import PlayerInfo from './player/PlayerInfo.tsx';
import PlayResultModal from './playResultModal/PlayResultModal.tsx';
import Board from './board/Board.tsx';
import RankingBoard from './ranker/RankingBoard.tsx';
import ControlPanel from './controlPanel/ControlPanel.tsx';


function App() {

  const apiTarget = process.env.REACT_APP_API_TARGET || 'http://127.0.0.1:8080'; // 기본값으로 로컬 호스트 설정
  const wsTarget= process.env.REACT_APP_WS_TARGET 

  const [isConn, setIsConn] = useState<boolean>(false)

  const ws = useRef<Client>()
  // Redux state 업데이트용
  const dispatch = useDispatch()

  const [createModal, setCreateModal] = useState(false)
  const [rankingModal, setRankingModal] = useState(false)
  const [boardModal, setBoardModal] = useState(false)
  const [playerModal, setPlayerModal] = useState(false)
  const [playResultModal, setPlayResultModal] = useState(false)

  const isLogin = useSelector((state: RootState) => state.user.isLogin)
  const isReady = useSelector((state: RootState) => state.game.isReady)
  const isDead = useSelector((state: RootState) => state.user.isDead)

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

  const handleLogout = () => {
    persistor.purge()
  }



  useEffect(() => {

    if (isLogin) {
      const client = new Client({
        webSocketFactory: () => new SockJS(wsTarget+'/ws'),
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
                    <Button className="Menu-Btn" variant="outline-light" onClick={showRankingModal}>랭킹</Button>
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
                    <ObserverInfo client={ws.current}></ObserverInfo>
                  </Col>
                  <Col xs={12} sm={9}>
                    <Stack gap={4} style={{ alignItems: "center" }}>
                      <GameField client={ws.current}></GameField>
                      <ControlPanel client={ws.current}></ControlPanel>
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
        </>
      }


    </div>
  );
}

export default App;
