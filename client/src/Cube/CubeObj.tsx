import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../redux/Store"
import './CubeObj.css'

interface Props {
    name: string
    isDominating: boolean
    isConquest: boolean
    isClickable: boolean
}


export default function CubeObj({ name, isConquest, isClickable, isDominating }: Props) {

    const attr = useSelector((state: RootState) => state.user.attr)
    const classNames = `slime-box ${isClickable ? "clickable" : ''} ${isDominating ? "isDominating" : ''}`;
    
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

    const getBackground = () => {
        if (isConquest) {
            return getAttr()
        } else {
            return "transparent"
        }
    }

    return (

        <div key={name} className={classNames} id={name} color="#ffffff" style={{
            borderColor: isClickable ? getAttr() : '#ffffff',
            backgroundColor: getBackground()
        }}/>
    )

}