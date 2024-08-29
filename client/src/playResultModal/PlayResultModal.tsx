import React, { useEffect } from "react";
import { Button, Container, Modal, ModalBody, ModalFooter, Row, Stack } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/Store";
import './PlayResultModal.css'
import { Client, IMessage } from "@stomp/stompjs";
import { updateDead } from "../redux/UserSlice.tsx";
import axios from "axios";
import { updateRanking } from "../redux/ObserverSlice.tsx";

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function PlayResultModal({ client, show, onHide }: Props) {

    const observer = useSelector((state: RootState) => state.observer.observer)

    const dispatch = useDispatch()

    const handleObserveBtn = () => {

        dispatch(updateDead({ isDead: false }))
        onHide()
    }

    useEffect(() => {

        if (!show && client?.connected) {
            client?.publish({ destination: '/app/player/anyObserver' })
            handleObserveBtn()
        }  
        
        if (show) {
            axios.get('/api/game/alltimeRanking')
            .then((res)=>{
                dispatch(updateRanking({ranking: parseInt(res.data)}))
            }).catch((err)=>{})
        }

    }, [show])


    return (
        <Modal show={show} onHide={onHide} centered size="sm" style={{ fontFamily: "DNFBitBitv2" }}>
            <ModalBody>
                <Container>
                    <Row style={{ textAlign: "center" }}>
                        <p>YOUR SLIME HAS DIED... </p>
                        <p>RIP :(</p>
                        <svg width="128" height="150" viewBox="0 0 128 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="death" clipPath="url(#clip0_70_2)">
                                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 12H39V21H19V40H10V85H24V94H39H97H107V85H117V40H110V21H97V12Z" fill="#D9D9D9" />
                                <path id="Eyes" fillRule="evenodd" clipRule="evenodd" d="M41.2262 33L37 42.0631L51.9398 49.0296L41 54.1309L45.2262 63.194L63.7708 54.5465L82.3154 63.194L86.5416 54.1309L75.6018 49.0296L90.5416 42.0631L86.3154 33L63.7708 43.5127L41.2262 33Z" fill="black" />
                                <path id="Mouse" d="M44 79V69H84V79H44Z" fill="black" />
                                <path id="Mouse_2" d="M52 69H77V89H52V69Z" fill="black" />
                                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 3H39V12H19V21H10V40H0V85H10V94H29V103H99V94H117V85H98V94H29V85H10V40H20V21H39V12H87V21H108V40H118V85H128V40H118V21H108V12H88V3Z" fill="#020202" />
                            </g>
                        </svg>
                    </Row>
                    <Row>
                        <p className="rs-text">닉네임</p>
                        <p className="rs-text">{observer?.nickname}</p>
                    </Row>
                    <Row>
                        <p className="rs-text">속성</p>
                        <p className="rs-text">{observer?.attr}</p>
                    </Row>
                    <Row>
                        <p className="rs-text">킬</p>
                        <p className="rs-text">{observer?.kill}</p>
                    </Row>
                    <Row>
                        <p className="rs-text">정복횟수</p>
                        <p className="rs-text">{observer?.conquer}</p>
                    </Row>
                    <Row>
                        <p className="rs-text">랭크</p>
                        <p className="rs-text">{observer?.ranking !== undefined || observer?.ranking !== -1 ? observer?.ranking : 'OUT OF RANK'}</p>
                    </Row>
                </Container>
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleObserveBtn}>관전모드로 돌아가기</Button>
            </ModalFooter>
        </Modal>
    )
}