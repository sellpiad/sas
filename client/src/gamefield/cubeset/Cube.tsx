import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/Store"
import './Cube.css'

interface Props {
    name: string
    hasPlayer: boolean
    attr: string
}


export default function CubeObj({ name, hasPlayer, attr }: Props) {

    const classNames = `slime-box ${hasPlayer ? "hasPlayer" : ''}`

    const getAttr = () => {
        switch (attr) {
            case 'GRASS':
                return "#38f113"
            case 'FIRE':
                return "#dc3545"
            case 'WATER':
                return "#0d6efd"
            default:
                return "tranparent"
        }
    }

    return (

        <div key={name} className={classNames} id={name} color="#ffffff" style={{
            borderColor: hasPlayer ? getAttr() : '#ffffff',
            backgroundColor: "transparent"
        }} />
    )

}