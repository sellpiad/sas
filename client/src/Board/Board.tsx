import { Client, IMessage } from '@stomp/stompjs';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, ModalBody, Modal, ModalHeader } from 'react-bootstrap';
import './Board.css'
import Post from './Post.tsx';
import axios from 'axios'

interface Props {
    client: Client | undefined
    show: boolean
    onHide: () => void
}

export default function Board({ client, show, onHide }: Props) {

    const [posts, setPosts] = useState([]);
    const [form, setForm] = useState({ title: '', content: '', author: '' });
    const [editIndex, setEditIndex] = useState(null);

    const handleEdit = (index) => {
        setForm(posts[index]);
        setEditIndex(index);
    };

    const handleDelete = (index) => {
        const updatedPosts = posts.filter((_, i) => i !== index);
        setPosts(updatedPosts);
    };

    useEffect(() => {

        axios.get('/getList')
        .then((res) => {})
        .catch()

    }, [])

    return (
        <Modal show={show} onHide={onHide} size="sm" centered>
            <ModalBody style={{ height: "40vh", fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
                <Container>
                    <Row>
                        <Col>
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th style={{width:"25%"}}>번호</th>
                                        <th style={{width:"50%"}}>제목</th>
                                        <th style={{width:"25%"}}>작성자</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>test</td>
                                            <td>content</td>
                                            <td>author</td>
                                            <td>
                                                <Button
                                                    variant="warning"
                                                    className="me-2"
                                                    onClick={() => handleEdit(index)}
                                                >
                                                    수정
                                                </Button>
                                                <Button variant="danger" onClick={() => handleDelete(index)}>
                                                    삭제
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </Container>

            </ModalBody>
        </Modal>
    );
}