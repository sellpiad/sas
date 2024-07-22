import { Client } from '@stomp/stompjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Modal, ModalBody, ModalHeader, ModalTitle, Pagination, Row, Table } from 'react-bootstrap';
import CreatePost from './CreatePost.tsx';
import Post from './Post.tsx';
import EditPost from './EditPost.tsx';

interface Props {
    show: boolean
    onHide: () => void
}

interface boardDTO {

    id: number
    title: string
    author: string

}

export default function Board({ show, onHide }: Props) {

    const [posts, setPosts] = useState([])
    const [page, setPage] = useState<number>(1)
    const [size, setSize] = useState<number>(6)
    const [total, setTotal] = useState<number>(0)
    const [pagination, setPagination] = useState<JSX.Element[]>([])

    const [id, setId] = useState<number>()

    const [mode, setMode] = useState<string>('LIST')

    const handleCreate = () => {
        setMode('CREATE')
    }

    const handlePost = (index) => {
        setMode('POST')
        setId(index)
    }

    const handlePage = (index) => {
        setPage(index)
    }

    const updatePagination = () => {

        const pageset: JSX.Element[] = []

        for (let i = page - 2; i <= page + 2; i++) {
            if (i >= 1 && i <= total) {
                pageset.push(
                    <Pagination.Item key={i} active={page === i} onClick={() => handlePage(i)}>{i}</Pagination.Item>
                )
            }
        }

        setPagination(pageset)
    }

    const getList = () => {
        axios.get('/api/getList', {
            params: {
                page: page,
                pageSize: size
            }
        })
            .then((res) => {

                setPosts(res.data.content)
                setTotal(res.data.totalPages)
                console.log(res.data)
            })
            .catch((err) => { console.log(err) })

    }

    useEffect(() => {

        getList()
        updatePagination()

    }, [mode, page, total])


    return (
        <Modal show={show} onHide={onHide} centered>
            <ModalHeader closeButton style={{ fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
                <ModalTitle>자유게시판</ModalTitle>
            </ModalHeader>
            <ModalBody style={{ height: "50vh", fontFamily: "DNFBitBitv2", fontSize: "0.9rem" }}>
                {mode === 'LIST' &&
                    <Container>
                        <Row>
                            <Table striped hover style={{ textAlign: "center" }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: "25%" }}>번호</th>
                                        <th style={{ width: "50%" }}>제목</th>
                                        <th style={{ width: "25%" }}>작성자</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map((post: boardDTO, index) => (
                                        <tr key={index} onClick={() => handlePost(post.id)}>
                                            <td>{post.id}</td>
                                            <td>{post.title.substring(0,12)}</td>
                                            <td>{post.author}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Row>
                        <Row>
                            <Pagination size='sm' style={{ justifyContent: "center" }}>
                                <Pagination.First onClick={() => setPage(1)} />
                                {page - 2 > 1 && <Pagination.Ellipsis />}
                                {pagination}
                                {page + 2 < total && <Pagination.Ellipsis />}
                                <Pagination.Last onClick={() => setPage(total)} />
                            </Pagination>
                        </Row>
                        <Row>
                            <Button onClick={handleCreate}>등록</Button>
                        </Row>
                    </Container>}
                {mode === 'CREATE' &&
                    <CreatePost onMode={setMode}></CreatePost>}
                {mode === 'POST' &&
                    <Post onMode={setMode} id={id}></Post>}
                {mode === 'EDIT' &&
                    <EditPost onMode={setMode} id={id}></EditPost>}
            </ModalBody>
        </Modal>
    );
}