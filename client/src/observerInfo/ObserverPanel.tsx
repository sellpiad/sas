import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import Slime from "../gamefield/slimeset/Slime.tsx";
import './ObserverPanel.css';


interface CardData {
    ranking: number
    username: string
    attr: string
    nickname: string
    kill: number
}

interface PlayerCard {
    ranking: number
    attr: string
    nickname: string
    kill: number
    onClick: () => void
    selected: boolean
}

interface Props {
    client: Client | undefined
}

export default function ObserverPanel({ client }: Props) {

    const [list, setList] = useState<CardData[]>()
    const [selectedCard, setSelectedCard] = useState<string>('')

    const dispatch = useDispatch()

    const getObserver = (nickname: string) => {
        setSelectedCard(nickname)
        client?.publish({ destination: '/app/player/findObserverByNickname', body: nickname })
    }

    useEffect(() => {

        if (client?.connected) {

            client.subscribe('/topic/game/realtimeRanker', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                setList(parser)
            })

            client.subscribe('/user/queue/game/realtimeRanker', (msg: IMessage) => {

                const parser = JSON.parse(msg.body)

                setList(parser)
            })


            client.publish({ destination: '/app/game/realtimeRanker' })
        }

    }, [client])

    return (
        <Row className="observerPanel d-none d-md-block" style={{ height: "60vh" }}>
            <Row className="observerPanel-title">
                <span>플레이어 실시간 현황</span>
            </Row>
            <Row id="observerPanel-body" className="observerPanel-body">
                {
                    list?.map((value, index, arr) => {
                        return (
                            <PlayerCard
                                key={'playercard-' + value.username}
                                ranking={index + 1}
                                attr={value.attr}
                                nickname={value.nickname}
                                kill={value.kill}
                                onClick={() => getObserver(value.nickname)}
                                selected={selectedCard === value.nickname}
                            />
                        )
                    })
                }
                {list === undefined && Array.from({ length: 10 }, (_, index) => {
                    return <EmptyCard key={'emptycard-' + index + 1} />
                })
                }
            </Row>

        </Row>
    )
}

function PlayerCard({ ranking, attr, nickname, kill, onClick, selected }: PlayerCard) {


    return (
        <div className={`observerPanel-card player-card ${selected ? 'selected' : ''}`} onClick={onClick}>
            <span className="observerPanel-ranking-col">{ranking}</span>
            <span className="observerPanel-slime-col"><Slime playerId={nickname + '-card'} direction={"down"} width={"100%"} height={"100%"} isAbsolute={false} fill={attr} /></span>
            <span className="observerPanel-nickname-col">{nickname}</span>
            <span className="observerPanel-kill-col">{kill}</span>
        </div>
    )
}

function EmptyCard() {
    return (
        <div className="observerPanel-card">
            <span className="observerPanel-ranking-col skeleton" />
            <span className="observerPanel-slime-col skeleton" />
            <span className="observerPanel-nickname-col skeleton" />
            <span className="observerPanel-kill-col skeleton" />
        </div>
    )
}

