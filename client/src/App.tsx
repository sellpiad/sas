import { Client, IMessage } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Navbar, Row, Stack } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import SockJS from 'sockjs-client';
import './App.css';
import Intro from './introduction/Intro.tsx';
import PlayBody from './playboard/PlayBody.tsx';
import { RootState } from './redux/store.tsx';
import CreateModal from './createModal/CreateModal.tsx';
import Chat from './Chat/Chat.tsx';
import Slime from './slime/Slime.tsx';
import { resize } from './redux/gameSlice.tsx';
import { changeLogin } from './redux/userSlice.tsx';

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
          <Navbar.Brand>
            <Slime move="down" width={"5vw"} height={"5vw"} isAbsolute={false}></Slime>
            <svg width="100%" height="100%" viewBox="-5 -30 200 50">
              <text
                x="0" y="0" fill="#3678ce"
                fontFamily="SBAggroB"
                fontSize="1.2rem"
                rotate="4, 8, -8, -4, -20, -24, 48, 0, 0">
                슬라임으로 살아남기
              </text>
            </svg>
          </Navbar.Brand>

          <Row>
            <Col xs={12}>

              <Button onClick={showModal}>슬라임 생성</Button>
            </Col>
          </Row>

        </Container>

      </Navbar>
      <Container>
        <Row>
          {
            isConn &&
            <>
              <Col sm={9} xxl={{span:6, offset:3}} style={{ overflow: "hidden" }}>
                <PlayBody client={ws.current}></PlayBody>
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
