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
        <>
            <div>
                <Form as={Row}>
                    <Form.Label column sm="1">검색</Form.Label>
                    <Col sm="5">
                        <Form.Control type="text" onChange={handleSearch}></Form.Control>
                    </Col>
                </Form>
            </div>

            <div style={{ display: "flex", padding: "0 3px" }}>
                <span className="time-col">시간</span>
                <span className="username-col">아이디</span>
                <span className="activityType-col">활동유형</span>
            </div>
            <div className="scroll-container">
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    {
                        log.map((value, index, array) => {
                            return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''} style={{ display: "flex", justifyContent: "space-between", padding: "3px" }}>
                                <span className="time-col">{value.time}</span>
                                <span className="username-col">{value.username}</span>
                                <span className="activityType-col">{value.activityType}</span>
                            </li>
                        })
                    }
                </ul>
            </div>

        </>

    )
}