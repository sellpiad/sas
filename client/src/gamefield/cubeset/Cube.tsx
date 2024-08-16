import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../redux/Store"
import './Cube.css'

interface Props {
    name: string
    hasPlayer: boolean
    setBorder: boolean
    attr: string | undefined
}


export default function CubeObj({name, hasPlayer, setBorder, attr }: Props) {

    const classNames = `slime-box ${hasPlayer ? "hasPlayer " + attr?.toLowerCase() : ''} ${setBorder ? 'styx' : ''}`

    return (

        <div key={name} className={classNames} id={name}/>
    )

}