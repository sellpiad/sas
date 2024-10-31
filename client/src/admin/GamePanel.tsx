import { Client } from "@stomp/stompjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Modal, ModalProps, Row } from "react-bootstrap";
import { SlimeData } from "../dataReceiver/gameReceiver.tsx";
import AttrSymbol from "../gamefield/cubeset/AttrSymbol.tsx";
import CubeSet from "../gamefield/cubeset/CubeSet.tsx";
import Slime from "../gamefield/slimeset/Slime.tsx";
import SlimeSet from "../gamefield/slimeset/SlimeSet.tsx";
import { ActionType, AttributeType, ObjectProps } from "../redux/GameSlice.tsx";
import './GamePanel.css';

interface Props {
    client: Client | undefined
}

export default function GamePanel({ client }: Props) {

    const [aiDeploy, setAiDeploy] = useState<boolean>(false)
    const [aiDeployPeriod, setAiDeployPeriod] = useState<number>(0)

    const [itemDeploy, setItemDeploy] = useState<boolean>(false)
    const [itemDeployPeriod, setItemDeployPeriod] = useState<number>(0)

    const [queue, setQueue] = useState<boolean>(false)
    const [queuePeriod, setQueuePeriod] = useState<number>(0)

    const [modal, setModal] = useState<boolean>(false)
    const [modalText, setModalText] = useState<string>('')
    const [modalRun, setModalRun] = useState<(period: number) => void>(() => { })

    const [slime, setSlime] = useState<SlimeData>({
        username: 'createSlime',
        attr: AttributeType.NORMAL,
        actionType: ActionType.IDLE,
        direction: 'down',
        duration: 300,
        position: '',
        locktime: 0
    } as SlimeData)


    const createObjectProps: ObjectProps = {
        position: 'relative',
        width: '100%',
        height: '100%'
    }

    enum ModalProps {
        AI = 'AI 자동 배치 간격',
        ITEM = '아이템 자동 배치 간격',
        QUEUE = '플레이어 투입 간격'
    }

    const handleModal = (prop: ModalProps) => {
        setModal(true)

        switch (prop) {
            case ModalProps.AI:
                setModalText(ModalProps.AI)
                setModalRun(() => deploymentAIRun)
                break;
            case ModalProps.ITEM:
                setModalText(ModalProps.ITEM)
                setModalRun(() => deploymentItemRun)
                break;
            case ModalProps.QUEUE:
                setModalText(ModalProps.QUEUE)
                setModalRun(() => queueRun)
                break;
        }
    }


    const addAI = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        axios.get('/api/admin/addAI')
            .then((res) => {
                console.log(res)
            }).catch((err) => {
                console.log(err)
            })
    }

    const deploymentAIRun = (period: number) => {
        axios.post('/api/admin/deployment/ai/run', { period: period }).then((res) => {
            setAiDeploy(true)
            setAiDeployPeriod(res.data)
            console.log(aiDeploy)
        }).catch((err) => {
            console.log(err)
            setAiDeploy(false)
        })
    }

    const deploymentAIStop = () => {
        axios.get('/api/admin/deployment/ai/stop')
            .then((res) => {
                setAiDeploy(false)
            }).catch((err) => {
                console.log(err)
            })
    }

    const deploymentItemRun = (period: number) => {
        axios.post('/api/admin/deployment/item/run', { period: period })
            .then((res) => {
                setItemDeploy(true)
            }).catch((err) => {
                console.log(err)
                setItemDeploy(false)
            })
    }

    const deploymentItemStop = () => {
        axios.get('/api/admin/deployment/item/stop')
            .then((res) => {
                setItemDeploy(false)
            }).catch((err) => {
                console.log(err)
            })
    }

    const queueRun = (period: number) => {
        axios.post('/api/admin/queue/run', { period: period })
            .then((res) => {
                setQueue(true)
            }).catch((err) => {
                console.log(err)
                setQueue(false)
            })
    }

    const queueStop = () => {
        axios.get('/api/admin/queue/stop')
            .then((res) => {
                setQueue(false)
            }).catch((err) => {
                console.log(err)
            })
    }

    const handleAiDeploy = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.checked) {
            handleModal(ModalProps.AI)
        } else {
            deploymentAIStop()
        }

    }

    const handleItemDeploy = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            handleModal(ModalProps.ITEM)
        } else {
            deploymentItemStop()
        }
    }

    const handleQueue = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            handleModal(ModalProps.QUEUE)
        } else {
            queueStop()
        }
    }


    useEffect(() => {

        axios.get('/api/admin/deployment/ai/state')
            .then((res) => {
                setAiDeploy(res.data)
            }).catch((err) =>
                console.log(err))

    }, [])


    return (
        <div className='Game-Panel'>
            <Col xs={3}>
                <Row className="deployment">
                    <Form>
                        <Form.Label>게임 현황</Form.Label>
                        <Form.Check type="switch" checked={aiDeploy} label="인공지능 자동 생성" onChange={handleAiDeploy} />
                        <Form.Check type="switch" checked={itemDeploy} label="아이템 자동 생성" onChange={handleItemDeploy} />
                        <Form.Check type="switch" checked={queue} label="플레이어큐" onChange={handleQueue} />
                    </Form>
                </Row>
                <Row className="deployment">
                    <Form onSubmit={addAI}>
                        <div className='submit-bar'>
                            <Form.Label>오브젝트 생성</Form.Label>
                            <Button variant='outline-primary' type="submit">투입</Button>
                        </div>
                        <Form.Group as={Row}>
                            <Col sm={{ span: 3, offset: 1 }} style={{ padding: 0 }}>
                                <Slime objectProps={createObjectProps} slimeData={slime}></Slime>
                                {/*<AttrSymbol width={"100%"} height={"100%"} attr={"GRASS"} opacity={100} />*/}
                            </Col>
                            <Col sm={8}>
                                <InputGroup>
                                    <InputGroup.Text>종류</InputGroup.Text>
                                    <Form.Select defaultValue={1} size="sm">
                                        <option value={1}>슬라임</option>
                                        <option value={2}>속성석</option>
                                    </Form.Select>
                                </InputGroup>
                                <InputGroup>
                                    <InputGroup.Text>속성</InputGroup.Text>
                                    <Form.Select defaultValue={1} size="sm">
                                        <option value={1}>GRASS</option>
                                        <option value={2}>WATER</option>
                                        <option value={3}>FIRE</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>
                        </Form.Group>
                    </Form>
                </Row>

            </Col>
            <Col xs={8} className="game-status">
                <Row className="deployment game-log">
                    <span>게임 로그</span>
                </Row>
            </Col>

            <CustomModal show={modal} onHide={() => setModal(false)} text={modalText} run={modalRun} />
        </div >
    )
}

function CustomModal({ show, onHide, text, run }) {

    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const PeriodValue = parseInt(formData.get('Period') as string, 10)
        onHide()
        run(PeriodValue)
    }

    return (
        <Modal
            centered
            show={show}
            onHide={onHide}
            keyboard={false}
        >
            <Modal.Body>
                <Form className='custom-request-modal' onSubmit={handleSubmit}>
                    <InputGroup>
                        <InputGroup.Text>{text} 실행 간격(ms)</InputGroup.Text>
                        <Form.Control name="Period" size="sm" type="number" step={1000} min={0} max={1000000} defaultValue={1000} />
                    </InputGroup>
                    <Button type="submit">서버로 요청 보내기</Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}