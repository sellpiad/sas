import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import './CubeObj.css'
import styled, { css, keyframes } from "styled-components"

interface Props {
    name: string
    isDominating: boolean
    isConquest: boolean
    isClickable: boolean
}


export default function CubeObj({ name, isConquest, isClickable, isDominating }: Props) {

    const attr = useSelector((state: RootState) => state.user.attr)
    const classNames = `${isClickable ? "clickable" : 'slime-Box'} ${isDominating ? "isDominating" : "none"}`;
    
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

    useEffect(() => {

        if (isDominating) {
            console.log("정복중")
        }

    }, [isDominating])


    return (

        <div key={name} className={classNames} id={name} color="#ffffff" style={{
            border: isClickable ? 'solid' + getAttr() : 'solid #ffffff',
            aspectRatio:"1/1",
            borderRadius: "15%",
            backgroundColor: getBackground(),
            justifyContent: "center",
            display: "flex",
            width:"100%",
            height:"100%"
        }}/>
    )

}