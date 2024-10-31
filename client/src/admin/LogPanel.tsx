import React, { SyntheticEvent, useEffect, useState } from "react";
import './LogPanel.css'
import axios from "axios";
import { Col, Form, Row } from "react-bootstrap";

interface log {
    time: string
    username: string
    activityType: string
}

export default function LogPanel() {

    const [log, setLog] = useState<log[]>([])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.value.length > 0) {
            const formData = new FormData()

            formData.append('keyword', e.target.value)

            axios.post('/api/admin/searchLog', formData)
                .then((res) => setLog(res.data))
                .catch((err) => console.log(err))
        } else {
            getLog()
        }
    }

    const getLog = () => {
        axios.get('/api/admin/getLog')
            .then((res) => {
                setLog(res.data)
            })
            .catch((err) => { })
    }

    useEffect(() => {
        getLog()
    }, [])

    return (
        <div className='Log-panel'>
            <div>
                <Form>
                    <Form.Control placeholder="검색" type="text" onChange={handleSearch}></Form.Control>
                </Form>
            </div>
            <div className='header'>
                <span className="time-th">시간</span>
                <span className="username-th">아이디</span>
                <span className="activityType-th">활동유형</span>
            </div>

            <ul className="log-list">
                {
                    log.map((value, index, array) => {
                        return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''} style={{ display: "flex" }}>
                            <span className="time-tr">{value.time}</span>
                            <span className="username-tr">{value.username}</span>
                            <span className="activityType-tr">{value.activityType}</span>
                        </li>
                    })
                }
            </ul>

        </div>

    )
}