import { Client, IMessage } from "@stomp/stompjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Form, InputGroup, Row, Spinner } from "react-bootstrap";
import { SlimeData } from "../dataReceiver/gameReceiver.tsx";
import Slime from "../gamefield/slimeset/Slime.tsx";
import { ActionType, AttributeType, ObjectProps } from "../redux/GameSlice.tsx";
import './GamePanel.css';
import React from "react";

interface Props {
    client: Client | undefined
}

interface AdminLog {
    time: string
    username: string
    activityType: string
}

interface DeployStat {
    period: number
    goal: number
    totalPlayer: number
    totalCube: number
    isProcessing: boolean
}

interface ScanQueueStat {
    period: number
    max: number
    isProcessing: boolean
}

export default function GamePanel({ client }: Props) {

    return (
        <div className='Game-Panel'>
            <Col xs={4}>
                <DeployAIAuto client={client} />
                <ScanQueue client={client} />
                <DeployObject client={client} />
                {/*<DeployItemAuto client={client} />
                */}
            </Col>
            <Col xs={8} className="game-status">
                <GameLog client={client} />
            </Col>
        </div >
    )
}

function DeployAIAuto({ client }: Props) {

    const [aiDeployOn, setAiDeploy] = useState<boolean>(false)
    const [aiDeployStat, setAiDeployStat] = useState<DeployStat>({ period: 0, goal: 0, totalPlayer: 0, totalCube: 0, isProcessing: false })

    const [isLoading, setLoading] = useState<boolean>(false)

    const handleDeploy = (e: React.FormEvent) => {

        setLoading(true)
        e.preventDefault()

        if (!aiDeployOn) {
            deploymentAIRun(e)
        } else {
            deploymentAIStop()
        }

    }

    const deploymentAIRun = (e: React.FormEvent) => {

        const formData = new FormData(e.target as HTMLFormElement)

        axios.post('/api/admin/deployment/ai/run', formData).then((res) => {
            setAiDeploy(true)
        }).catch((err) => {
            console.log(err)
            setAiDeploy(false)
        }).finally(() => {

            if (client) client.publish({ destination: '/app/admin/getAdminLog' })
            setLoading(false)
        })
    }

    const deploymentAIStop = () => {

        axios.get('/api/admin/deployment/ai/stop')
            .then((res) => {
                setAiDeploy(false)
            }).catch((err) => {
                console.log(err)
            }).finally(() => {

                if (client) client.publish({ destination: '/app/admin/getAdminLog' })
                setLoading(false)
            })
    }


    useEffect(() => {

        if (client) {
            client.subscribe("/user/queue/admin/deployAiState", (msg: IMessage) => {

                const parser = JSON.parse(msg.body) as DeployStat

                setAiDeployStat(parser)

            })

            axios.get('/api/admin/deployment/ai/state')
                .then((res) => {
                    setAiDeploy(res.data)
                }).catch((err) =>
                    console.log(err))
        }

    }, [])

    return (
        <Row className="deployment">
            <Col xs={6}>
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} onSubmit={(e) => handleDeploy(e)}>
                    <Form.Label>인공지능 자동 생성</Form.Label>
                    <Form.Floating>
                        <Form.Control name="Period" size="sm" type="number" step={1000} min={0} max={1000000} defaultValue={1000} />
                        <label htmlFor="floatingInputCustom">실행 간격(ms)</label>
                    </Form.Floating>
                    <Form.Floating>
                        <Form.Control name="Goal" size="sm" type="number" step={1} min={1} max={100} defaultValue={1} />
                        <label htmlFor="floatingInputCustom"> 게임 인원 제한(%)</label>
                    </Form.Floating>
                    <Button style={{ display: 'flex', justifyContent: 'center', height: '30px' }} type="submit" size="sm">
                        {(aiDeployOn && !isLoading) && "인공지능 배치 중.."}
                        {(!aiDeployOn && !isLoading) && "배치 시작"}
                        {isLoading && <Spinner animation="border" style={{ width: '18px', height: '18px' }} />}
                    </Button>
                </Form>
            </Col>
            <Col xs={6} className="desc">
                <p>배치 간격</p>
                <span>{aiDeployStat.period}ms</span>
                <p>현재 플레이어 수치</p>
                <span>{((aiDeployStat.totalPlayer / aiDeployStat.totalCube) * 100).toFixed(2)}%({aiDeployStat.totalPlayer}명)</span>
                <p>최대 참여 설정값</p>
                <span>{aiDeployStat.goal}%({aiDeployStat.totalCube * aiDeployStat.goal / 100}명)</span>

                {aiDeployStat.isProcessing && <p className='stat' style={{ color: 'blue' }}>배치 중..</p>}
                {!aiDeployStat.isProcessing && <p className='stat' style={{ color: 'green' }}>배치 중단</p>}
            </Col>
        </Row>
    )
}

function ScanQueue({ client }: Props) {

    const [queueOn, setQueue] = useState<boolean>(false)
    const [queueStat, setQueueStat] = useState<ScanQueueStat>({ period: 0, max: 0, isProcessing: false })

    const [isLoading, setLoading] = useState<boolean>(false)

    const handleQueue = (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)

        if (!queueOn) {
            queueRun(e)
        } else {
            queueStop()
        }
    }

    const queueRun = (e: React.FormEvent) => {

        const formData = new FormData(e.target as HTMLFormElement)

        axios.post('/api/admin/queue/run', formData)
            .then((res) => {
                setQueue(true)
            }).catch((err) => {
                console.log(err)
                setQueue(false)
            }).finally(() => {
                if (client) client.publish({ destination: '/app/admin/getAdminLog' })
                setLoading(false)
            })
    }

    const queueStop = () => {
        axios.get('/api/admin/queue/stop')
            .then((res) => {
                setQueue(false)
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
                if (client) client.publish({ destination: '/app/admin/getAdminLog' })
                setLoading(false)
            })
    }

    useEffect(() => {
        if (client) {
            client.subscribe("/user/queue/admin/scanningPlayerState", (msg: IMessage) => {
                const parser = JSON.parse(msg.body) as ScanQueueStat

                setQueueStat(parser)
            })

        }

        axios.get('/api/admin/queue/state')
            .then((res) => {
                setQueue(res.data)
            }).catch((err) =>
                console.log(err))
    }, [])

    return (
        <Row className="deployment">
            <Col xs={6}>
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '3px' }} onSubmit={(e) => handleQueue(e)}>
                    <Form.Label>플레이어 큐</Form.Label>
                    <Form.Floating>
                        <Form.Control name="Period" size="sm" type="number" step={1000} min={0} max={1000000} defaultValue={1000} />
                        <label>실행 간격(ms)</label>
                    </Form.Floating>
                    <Form.Floating>
                        <Form.Control name="Max" size="sm" type="number" step={1} min={1} max={10} defaultValue={1} />
                        <label>회당 투입 인원</label>
                    </Form.Floating>
                    <Button style={{ display: 'flex', justifyContent: 'center', height: '30px' }} type="submit" size="sm">
                        {(queueOn && !isLoading) && "플레이어 배치 중..."}
                        {(!queueOn && !isLoading) && "큐 가동"}
                        {isLoading && <Spinner animation="border" style={{ width: '18px', height: '18px' }} />}
                    </Button>
                </Form>
            </Col>
            <Col xs={6} className="desc">
                <p>스캔 간격</p>
                <span>{queueStat.period}ms</span>
                <p>스캔 당 투입 플레이어 수</p>
                <span>{queueStat.max}명</span>

                {queueStat.isProcessing && <p className='stat' style={{ color: 'blue' }}>스캔 중..</p>}
                {!queueStat.isProcessing && <p className='stat' style={{ color: 'green' }}>스캔 중단</p>}
            </Col>
        </Row>

    )
}

function DeployObject({ client }: Props) {


    const [itemDeploy, setItemDeploy] = useState<boolean>(false)
    const [itemDeployPeriod, setItemDeployPeriod] = useState<number>(0)


    const handleItemDeploy = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {

        } else {
            deploymentItemStop()
        }
    }


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

    const addAI = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()

        axios.get('/api/admin/addAI')
            .then((res) => {
                console.log(res)
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


    return (
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
        </Row>)
}

function GameLog({ client }: Props) {

    const [adminLog, setAdminLog] = useState<AdminLog[]>([])

    useEffect(() => {
        if (client) {
            client.subscribe('/user/queue/admin/getAdminLog', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                setAdminLog(parser)
            })

            client.publish({ destination: '/app/admin/getAdminLog' })
        }
    }, [])

    return (
        <Row className="deployment game-log">
            <span>게임 로그</span>
            <div>
                {adminLog.map((value, index, array) => {
                    return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''} style={{ display: "flex" }}>
                        <span className="time-tr">{value.time}</span>
                        <span className="username-tr">{value.username}</span>
                        <span className="activityType-tr">{value.activityType}</span>
                    </li>
                })}
            </div>
        </Row>
    )
}

