import { Client, IMessage } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import './App.css';
import CreateModal from './createModal/CreateModal.tsx';
import PlayBody from './playboard/PlayBody.tsx';
import { resize } from './redux/gameSlice.tsx';
import { RootState } from './redux/store.tsx';
import { changeLogin } from './redux/userSlice.tsx';
import Slime from './slime/Slime.tsx';
import RankingBoard from './Ranker/RankingBoard.tsx';
import ControlPanel from './ControlPanel/ControlPanel.tsx';

function App() {

  const [isConn, setIsConn] = useState<boolean>(false)
  const [text, setText] = useState<string>()

  const ws = useRef<Client>()
  const app = useRef<HTMLDivElement>(null)


  const dispatch = useDispatch()

  const isLogined = useSelector((state: RootState) => state.user.isLogined)

  const [modal, setModal] = useState(false)

  const showModal = () => {
    setModal(true)
  }

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
        console.log(error)
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
        console.log("등록")
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
        <Container>
          <Row className='w-100 justify-content-between'>
            <Col xs={12} sm={6}>
              <Navbar.Brand>
                <Slime direction="down" width={"96"} height={"96"} isAbsolute={false}></Slime>
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
            <Col className="d-flex flex-column justify-content-lg-center" xs={12} sm={6}>
              <Row className="justify-content-end justify-content-lg-end">
                <Col xs={3} sm={2}>
                  <Button variant="outline-light" onClick={showModal} style={{ fontFamily: "Dotfont", fontSize: "1.2rem", width: "100%" }}>PLAY</Button>
                </Col>
                <Col xs={3} sm={2}>
                  <Button variant="outline-light" onClick={showModal} style={{ fontFamily: "Dotfont", fontSize: "1.2rem", width: "100%" }}>CHAT</Button>
                </Col>
                <Col xs={3} sm={2}>
                  <Button variant="outline-light" onClick={showModal} style={{ fontFamily: "Dotfont", fontSize: "1.2rem", width: "100%" }}>RANK</Button>
                </Col>
                <Col xs={3} sm={2}>
                  <Button variant="outline-light" onClick={showModal} style={{ fontFamily: "Dotfont", fontSize: "1.2rem", width: "100%" }}>BOARD</Button>
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
            <>
              <Col xs={12} sm={9} xxl={{ span: 6, offset: 3 }}>
                <Stack gap={2}>
                  <PlayBody client={ws.current}></PlayBody>
                  <ControlPanel></ControlPanel>
                </Stack>
              </Col>
              <Col sm={3}>
                <RankingBoard client={ws.current}></RankingBoard>
              </Col>
            </>
          }
        </Row>

      </Container>
      <CreateModal show={modal} onHide={() => setModal(false)} client={ws.current}></CreateModal>
    </div>
  );
}

export default App;
