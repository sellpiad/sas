import React from "react"
import { default as AttrSymbol } from "./AttrSymbol.tsx"
import './Cube.css'

interface Props {
    name: string
    attr: string
    setBorder: boolean
}


export default function Cube({ name, setBorder, attr }: Props) {

    const classNames = `slime-box ${setBorder ? 'styx' : ''}`

    return (

        <div key={name} className={classNames} id={name}>
            <AttrSymbol width="80%" height="80%" attr={attr} opacity={100}></AttrSymbol>
        </div>
    )

}