import React from "react";
import { Button, Col, Container, Form, InputGroup, Row } from "react-bootstrap";

export default function Post() {
    return (
        <Container>
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1">제목</InputGroup.Text>
                        <Form.Control
                            placeholder="제목"
                            aria-label="제목"
                            aria-describedby="basic-addon1"
                        />
                        <InputGroup.Text id="basic-addon1">작성자</InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>
            <Row>
                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>내용</Form.Label>
                    <Form.Control as="textarea" rows={8} />
                </Form.Group>
            </Row>
            <Row>
                <Button variant="outline-primary">등록</Button>
            </Row>
        </Container>
    )
}