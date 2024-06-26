import React from "react";
import { Button, Col, Row, Stack } from "react-bootstrap";
import './Plate.css'

export default function Plate() {



    return (

        <Stack gap={1}>
            <Row className="g-0">

                <Col>
                    <Button className="customed-button" variant="outline-secondary"></Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-secondary">NORTH</Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-secondary"></Button>
                </Col>
            </Row>
            <Row className="g-0">
                <Col>
                    <Button className="customed-button" variant="outline-light">WEST</Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-warning">CENTRAL</Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-primary">EAST</Button>
                </Col>
            </Row>
            <Row className="g-0">
                <Col>
                    <Button className="customed-button" variant="outline-secondary"></Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-danger">SOUTH</Button>
                </Col>
                <Col>
                    <Button className="customed-button" variant="outline-secondary"></Button>
                </Col>
            </Row>
        </Stack>

    )

}