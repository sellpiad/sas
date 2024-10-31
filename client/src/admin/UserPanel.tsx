import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, FormCheck, Modal, ModalBody } from "react-bootstrap";
import './UserPanel.css'

interface user {
    memberNumber: number
    username: string
    isConnected: boolean
    isPlaying: boolean
}

export default function UserPanel() {

    const [userList, setUserList] = useState<user[]>([])

    const [editModal, setEditModal] = useState<boolean>(false)
    const [seletedUser, setSelectedUser] = useState<string>('')

    const [isConn, setIsConn] = useState<boolean>(false)
    const [isPlaying,setIsPlaying] = useState<boolean>(false)


    const handleEditBtn = (username: string) => {
        setEditModal(true)
        setSelectedUser(username)
    }

    const handleDeleteBtn = (username: string) => {
        axios.delete('/api/admin/deleteUser')
            .then((res) => { })
            .catch((err) => { })
    }


    useEffect(() => {
        axios.get('/api/admin/getUserList')
            .then((res) => {
                setUserList(res.data)
            }).catch((err) => console.log(err))
    }, [])


    return (
        <div>
            <div style={{ display: "flex", padding: "0 3px" }}>
                <span className="memberNumber-col">번호</span>
                <span className="username-col">아이디</span>
                <span className="isConnected-col">접속중</span>
                <span className="isPlaying-col">게임중</span>
                <span className="btnMenu-col">관리</span>
            </div>
            <div className="scroll-container">
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    {
                        userList.map((value, index, array) => {
                            return <li key={"ranker" + index} className={value['isMe'] ? 'myRank' : ''} style={{ display: "flex", justifyContent: "space-between", padding: "3px" }}>
                                <span className="memberNumber-col">{value.memberNumber}</span>
                                <span className="username-col">{value.username}</span>
                                <span className="isConnected-col">
                                    <Form>
                                        <FormCheck type="switch" checked={value.isConnected} onChange={()=>{}}></FormCheck>
                                    </Form>
                                </span>
                                <span className="isPlaying-col">
                                    <Form>
                                        <FormCheck type="switch" checked={value.isPlaying} onChange={()=>{}}></FormCheck>
                                    </Form>
                                </span>
                                <span className="editBtn-col"><Button onClick={() => handleEditBtn(value.username)}>수정</Button></span>
                                <span className="deleteBtn-col"><Button onClick={() => handleDeleteBtn(value.username)}>삭제</Button></span>
                            </li>
                        })
                    }
                </ul>
            </div>
            <EditUser show={editModal} onHide={() => setEditModal(false)} username={seletedUser} />
        </div>
    )

}

interface Props {
    show: boolean
    onHide: () => void
    username: string
}

function EditUser({ show, onHide, username }: Props) {

    return (
        <Modal show={show} onHide={onHide} centered>
            <ModalBody>
                test
            </ModalBody>
        </Modal>
    )
}