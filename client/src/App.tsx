import { Client } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import SockJS from 'sockjs-client';

import './App.css';

import { persistor } from './index.js';

import { RootState } from './redux/Store.tsx';
import { changeLogin } from './redux/UserSlice.tsx';

import axios from 'axios';
import Admin from './admin/Admin.tsx';
import Board from './board/Board.tsx';
import ControlPanel from './controlPanel/ControlPanel.tsx';
import CreateModal from './createModal/CreateModal.tsx';
import actionReceiver from './dataReceiver/actionReceiver.tsx';
import gameReceiver, { SlimeData } from './dataReceiver/gameReceiver.tsx';
import playerReceiver, { Player } from './dataReceiver/playerReceiver.tsx';
import GameField from './gamefield/GameField.tsx';
import Slime from './gamefield/slimeset/Slime.tsx';
import Login from './login/Login.tsx';
import ObserverInfo from './observer/ObserverInfo.tsx';
import RealtimeRanking from './observer/RealtimeRanking.tsx';
import PlayerInfo from './player/PlayerInfo.tsx';
import PlayResultModal from './playResultModal/PlayResultModal.tsx';
import RankingBoard from './ranker/RankingBoard.tsx';
import { ActionType, AttributeType, ObjectProps } from './redux/GameSlice.tsx';


function App() {

  const wsTarget = process.env.REACT_APP_WS_TARGET || 'http://localhost:8080'

  const [isConn, setIsConn] = useState<boolean>(false)

  const ws = useRef<Client | undefined>()
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

  const [player, setPlayer] = useState<Player>()

  const navSlimeProps: ObjectProps = {
    position: 'relative',
    width: "100%",
    height: "100%",
    className: 'Slime'
  }

  const navSlimeData: SlimeData = {
    username: 'navSlime',
    attr: AttributeType.NORMAL,
    actionType: ActionType.IDLE,
    direction: 'down',
    duration: 300,
    position: '',
    locktime: 0,
    nickname: '',
    createdTime: 0,
    removedTime: 0,
    buffCount: 0,
    nuffCount: 0
  }

  // 모달 관리 메소드들
  const showCreateModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCreateModal(true)
    e.currentTarget.blur()
  }

  const showRankingModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setRankingModal(true)
    e.currentTarget.blur()
  }

  const showBoardModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setBoardModal(true)
    e.currentTarget.blur()
  }

  const showPlayerModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPlayerModal(true)
    e.currentTarget.blur()
  }

  const showPlayResultModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPlayResultModal(true)
    e.currentTarget.blur()
  }

  const showAdminModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAdminModal(true)
    e.currentTarget.blur()
  }

  const handleLogout = () => {

    axios.get('/api/logout')
      .then((res) => {

        setIsConn(false)
        ws.current?.deactivate()
        persistor.purge()

      })
      .catch((err) => {
        console.log(err)
      })
  }



  useEffect(() => {

    if (isLogin) {

      const client = new Client({
        webSocketFactory: () => new SockJS(wsTarget + '/ws'),
        onConnect: () => {
          setIsConn(true)
        },
        onStompError: (error) => {
          console.log("stomp error : " + error)
        },
        onDisconnect: (error) => {
          setIsConn(false)
          console.log("disconnet :" + error)
        },
        onWebSocketClose: (close) => {
          dispatch(changeLogin({ isLogin: false }))
          setIsConn(false)
          persistor.purge()
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
        if (client.connected) {
          client.deactivate();
        }
      };
    }


  }, [isLogin])

  useEffect(() => {

    if (isDead) {
      setPlayResultModal(true)
    }

  }, [isDead])

  useEffect(() => {

    if (ws.current?.connected) {

      gameReceiver.initReceiver(ws.current)
      actionReceiver.initReceiver(ws.current)
      playerReceiver.initReceiver(ws.current)

      playerReceiver.subscribe((data: Player) => {
        setPlayer(data)
      })
    }


  }, [ws.current])


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
                    <Slime key={"navbarSlime"} objectProps={navSlimeProps} slimeData={navSlimeData}></Slime>
                    <svg className="title-svg" width="100%" height="100%" viewBox="-5 -30 200 50">
                      <text
                        x="0" y="0" fill="#3678ce"
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
                    <RealtimeRanking client={ws.current} />
                    {(auth === 'ADMIN' || auth === 'MANAGER') && <Button className="Admin-Btn" variant="outline-light" onClick={showAdminModal}>관리모드</Button>}
                  </Col>
                  <Col xs={12} sm={9}>
                    <Stack gap={4} style={{ alignItems: "center" }}>
                      <GameField client={ws.current}></GameField>
                      {player?.state === 'IN_GAME' && <ControlPanel client={ws.current}></ControlPanel>}
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
