import React from "react"
import AttSymbol from "./AttrSymbol.tsx"
import './Cube.css'

interface Props {
    name: string
    hasPlayer: boolean
    setBorder: boolean
    attr: string
    conquering?: boolean
}


export default function CubeObj({ name, hasPlayer, setBorder, attr, conquering }: Props) {

    const classNames = `slime-box ${hasPlayer ? "hasPlayer " + attr?.toLowerCase() : ''} ${setBorder ? 'styx' : ''}`

    return (

        <div key={name} className={classNames} id={name}>
            <AttSymbol width="80%" height="80%" attr={attr} opacity={100} animating={conquering === undefined ? false : conquering}></AttSymbol>
        </div>
    )

}