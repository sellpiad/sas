import { Client, IMessage } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import './App.css';
import Board from './board/Board.tsx';
import ControlPanel from './controlPanel/ControlPanel.tsx';
import CreateModal from './createModal/CreateModal.tsx';
import PlayBody from './playboard/PlayBoard.tsx';
import RankingBoard from './ranker/RankingBoard.tsx';
import { resize } from './redux/GameSlice.tsx';
import { RootState } from './redux/Store.tsx';
import { changeLogin } from './redux/UserSlice.tsx';
import Slime from './slime/Slime.tsx';
import PlayerInfo from './player/PlayerInfo.tsx';
import Login from './login/Login.tsx';

function App() {

  const [isConn, setIsConn] = useState<boolean>(false)
  const [text, setText] = useState<string>()

  const ws = useRef<Client>()
  const app = useRef<HTMLDivElement>(null)


  const dispatch = useDispatch()

  const isLogined = useSelector((state: RootState) => state.user.isLogined)

  const [createModal, setCreateModal] = useState(false)
  const [rankingModal, setRankingModal] = useState(false)
  const [boardModal, setBoardModal] = useState(false)
  const [playerModal, setPlayerModal] = useState(false)

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

  // 윈도우 사이즈 변할때
  const windowResize = () => {
    dispatch(resize({ width: app.current?.offsetWidth, height: app.current?.offsetHeight }))
  }

  const enterBtnHandler = () => {
    ws.current?.publish({ destination: "/app/user/newbie" })
  }


  useEffect(() => {

    dispatch(resize({ width: app.current?.offsetWidth, height: app.current?.offsetHeight }))

    const client = new Client({
      webSocketFactory: () => new SockJS('http://192.168.0.47:8080/ws'),
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
      }
    })

    ws.current = client

    if (!ws.current.connected) {
      ws.current.activate()
    }

  }, [])

  useEffect(() => {

    window.addEventListener('resize', windowResize)

  }, [app])

  useEffect(() => {

    if (ws.current?.connected) {

      ws.current.subscribe("/user/queue/user/newbie", (msg: IMessage) => {
        dispatch(changeLogin({ isLogined: msg.body }))
      })

      ws.current.publish({ destination: "/app/user/newbie" })

    }

    return () => {
      ws.current?.unsubscribe("/user/queue/user/newbie")
    }

  }, [ws.current])




  return (
    <div className="App" ref={app}>
      <Navbar>
        <Container style={{ justifyContent: "center" }}>
          <Row className='w-100 justify-content-between'>
            <Col xs={12} sm={6} style={{ paddingLeft: 0 }}>
              <Navbar.Brand>
                <Slime playerId={"navbarSlime"} direction="down" width={"96"} height={"96"} isAbsolute={false}></Slime>
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
            <Col xs={12} sm={6} style={{alignContent:"center"}}>
              <Row>
                <Col style={{width:"25%"}}>
                  <Button className="Menu-Btn" variant="outline-light" onClick={showCreateModal}>플레이</Button>
                </Col>

                <Col style={{width:"25%"}}>
                  <Button className="Menu-Btn" variant="outline-light" onClick={showRankingModal}>랭킹</Button>
                </Col>

                <Col style={{width:"25%"}}>
                  <Button className="Menu-Btn" variant="outline-light" onClick={showBoardModal}>게시판</Button>
                </Col>

                <Col style={{width:"25%"}}>
                  <Button className="Menu-Btn" variant="outline-light" onClick={showPlayerModal}>플레이어</Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>

      </Navbar>
      <Container>
        <Row >
          {
            isConn &&
            <Col xs={12} sm={9} xxl={{ span: 6, offset: 3 }}>
              <Stack gap={4} style={{ alignItems: "center" }}>
                <PlayBody client={ws.current}></PlayBody>
                <ControlPanel client={ws.current}></ControlPanel>
              </Stack>
            </Col>
          }
        </Row>

      </Container>

      <CreateModal show={createModal} onHide={() => setCreateModal(false)} client={ws.current}></CreateModal>
      <RankingBoard show={rankingModal} onHide={() => setRankingModal(false)} client={ws.current}></RankingBoard>
      <Board show={boardModal} onHide={() => setBoardModal(false)}></Board>
      <PlayerInfo show={playerModal} onHide={() => setPlayerModal(false)}></PlayerInfo>

      <Login></Login>
    </div>
  );
}

export default App;
