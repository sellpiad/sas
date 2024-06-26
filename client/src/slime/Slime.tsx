import { nanoid } from "@reduxjs/toolkit";
import React, { useEffect, useState } from "react";

type moveAttr = string | 'up' | 'down' | 'right' | 'left'

interface Props {
    move?: moveAttr
    fill?: string
    border?: string
    position?: string | undefined
    width?: string
    height?: string
    isAbsolute: boolean
}

export default function Slime({ move, fill, border, position, isAbsolute, ...props }: Props) {

    const [slimeMove, setSlimeMove] = useState(true)
    const [slime1, setSlime1] = useState<string>()
    const [slime2, setSlime2] = useState<string>()
    const [uniqueKey, setUniqueKey] = useState<string>()

    const [pos, setPos] = useState<string>()
    const [moveX, setMoveX] = useState<number>(0)
    const [moveY, setMoveY] = useState<number>(0)

    const [width, setWidth] = useState<string>('0')
    const [height, setHeight] = useState<string>('0')

    const [speed, setSpeed] = useState<number>(0)


    const getAttr = () => {
        switch (fill) {
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

    const updateSlimeBox = () => {

        const slimeBox = position !== undefined && document.getElementById(position)

        if (slimeBox) {
           
            setWidth(slimeBox.offsetWidth+"")
            setHeight(slimeBox.offsetHeight+"")
            setMoveX(slimeBox.offsetLeft)
            setMoveY(slimeBox.offsetTop)

        } else {
            if (props.width !== undefined && props.height !== undefined) {
                setWidth(props.width)
                setHeight(props.height)
            }

        }

    }


    useEffect(() => {

        setUniqueKey(nanoid())
        setTimeout(()=>{setSpeed(0.5)},10)

    }, [])

    useEffect(() => {
     
        updateSlimeBox()

    }, [position, width, height])

    useEffect(() => {

        setPos(`translate(${moveX}, ${moveY})`)

    }, [moveX, moveY])


    // 슬라임 프레임 설정
    useEffect(() => {

        setSlime1('#slime-' + uniqueKey + '-' + move + '-1')
        setSlime2('#slime-' + uniqueKey + '-' + move + '-2')

    }, [uniqueKey, move])


    // 슬라임 프레임 변환 속도
    useEffect(() => {
        setTimeout(() => {
            slimeMove ? setSlimeMove(false) : setSlimeMove(true)
        }, 500)
    }, [slimeMove])




    return (
        speed > 0 &&
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width={width} height={height} preserveAspectRatio="xMidYMid meet" transform={pos} style={{ position: isAbsolute ? "absolute" : "relative", transition: "transform " + speed + "s ease" }}>
            
            <use xlinkHref={slimeMove ? slime1 : slime2} x={11} y={25} width={150} height={150} />
        
            <symbol id={'slime-' + uniqueKey + '-down-1'} viewBox="0 0 150 150">
                <g clipPath="url(#a)">
                    <path fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M97 9H39v9H19v19h-9v45h14v9h83v-9h10V37h-7V18H97V9z" clipRule="evenodd" />
                    <path d="M29 91h70v9H29zM0 37h10v45H0zm10-19h10v19H10z" />
                    <path d="M10 18h10v19H10z" />
                    <path
                        d="M10 18h10v19H10zm67 27h10v19H77zm-39 0h11v19H38zm1-27H19V9h20zM29 91H10v-9h19zm88 0H98v-9h19zm-9-73H87V9h21zm0 0h10v19h-10zm10 19h10v45h-10z" />
                    <path fill={border === undefined ? '#020202' : border} d="M39 0h49v9H39z" />
                </g>
                <defs>
                    <clipPath id="a">
                        <path fill="#fff" d="M0 0h128v100H0z" />
                    </clipPath>
                </defs>
            </symbol>
            <symbol id={'slime-' + uniqueKey + '-down-2'} viewBox="0 0 150 150">
                <path fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                    d="M87 11H39v7H19v19h-9v45h29v9h48v-9h30V37h-10V18H87v-7z" clipRule="evenodd" />
                <path
                    d="M29 82h70v9H29zM0 37h10v45H0zm10-10h10v19H10zm63 36l.13-10 18.998.244-.129 10zm-40 1l.005-11 19 .009-.005 11zm6-37H19v-9h20zM29 82H10v-9h19zm88 0H98v-9h19zm-9-55H87v-9h21zm-1 0h10v19h-10zm10 10h10v45h-10z" />
                <path fill={border === undefined ? '#020202' : border} d="M39 9h49v9H39z" />
            </symbol>


            <symbol id={'slime-' + uniqueKey + '-right-1'} viewBox="0 0 150 150">
                <g clipPath="url(#clip0_10_2)">
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M97 9H39v9H19v19h-9v45h14v9h83v-9h10V37h-7V18H97V9z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M29 91h70v9H29z" />
                    <path id="Rectangle 3" d="M0 37h10v45H0z" />
                    <path id="Rectangle 5" d="M10 18h10v19H10z" />
                    <path id="Rectangle 9" d="M10 18h10v19H10z" />
                    <path id="Rectangle 13" d="M10 18h10v19H10z" />
                    <path id="RightEye" d="M92 45h10v19H92z" />
                    <path id="LeftEye" d="M44 45h10v19H44z" />
                    <path id="Rectangle 7" d="M39 18h20v9H39z" transform="rotate(180 39 18)" />
                    <path id="Rectangle 10" d="M29 91h19v9H29z" transform="rotate(180 29 91)" />
                    <path id="Rectangle 11" d="M117 91h19v9h-19z" transform="rotate(180 117 91)" />
                    <path id="Rectangle 8" d="M108 18h21v9h-21z" transform="rotate(180 108 18)" />
                    <path id="Rectangle 6" d="M108 18h10v19h-10z" />
                    <path id="Rectangle 4" d="M118 37h10v45h-10z" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M39 0h49v9H39z" />
                </g>
                <defs>
                    <clipPath id="clip0_10_2">
                        <path fill="#fff" d="M0 0h128v98H0z" />
                    </clipPath>
                </defs>
            </symbol>

            <symbol id={'slime-' + uniqueKey + '-right-2'} viewBox="0 0 150 150">
                <g clipPath="url(#clip0_10_40)">
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M97 9H39v9H19v19h-9v45h14v9h83v-9h10V37h-11V18h-9V9z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M29 91h70v9H29z" />
                    <path id="Rectangle 3" d="M10 37h10v45H10z" />
                    <path id="Rectangle 13" d="M19 18h10v19H19z" />
                    <path id="RightEye" d="M89 45h10v19H89z" />
                    <path id="LeftEye" d="M48 45h10v19H48z" />
                    <path id="Rectangle 7" d="M39 18h20v9H39z" transform="rotate(180 39 18)" />
                    <path id="Rectangle 10" d="M39 91h19v9H39z" transform="rotate(180 39 91)" />
                    <path id="Rectangle 11" d="M109 91h19v9h-19z" transform="rotate(180 109 91)" />
                    <path id="Rectangle 8" d="M108 18h21v9h-21z" transform="rotate(180 108 18)" />
                    <path id="Rectangle 6" d="M98 18h10v19H98z" />
                    <path id="Rectangle 4" d="M109 37h10v45h-10z" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M39 0h49v9H39z" />
                </g>
                <defs>
                    <clipPath id="clip0_10_40">
                        <path fill="#fff" d="M0 0h128v98H0z" />
                    </clipPath>
                </defs>
            </symbol>

            <symbol id={'slime-' + uniqueKey + '-left-1'} viewBox="0 0 150 150">
                <g clipPath="url(#clip0_13_60)">
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M31 9h58v9h20v19h9v45h-14v9H21v-9H11V37h7V18h13V9z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M0 0h70v9H0z" transform="matrix(-1 0 0 1 99 91)" />
                    <path id="Rectangle 3" d="M0 0h10v45H0z" transform="matrix(-1 0 0 1 128 37)" />
                    <path id="Rectangle 5" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 118 18)" />
                    <path id="Rectangle 9" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 118 18)" />
                    <path id="Rectangle 13" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 118 18)" />
                    <path id="RightEye" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 36 45)" />
                    <path id="LeftEye" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 84 45)" />
                    <path id="Rectangle 7" d="M0 0h20v9H0z" transform="matrix(1 0 0 -1 89 18)" />
                    <path id="Rectangle 10" d="M0 0h19v9H0z" transform="matrix(1 0 0 -1 99 91)" />
                    <path id="Rectangle 11" d="M0 0h19v9H0z" transform="matrix(1 0 0 -1 11 91)" />
                    <path id="Rectangle 8" d="M0 0h21v9H0z" transform="matrix(1 0 0 -1 20 18)" />
                    <path id="Rectangle 6" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 20 18)" />
                    <path id="Rectangle 4" d="M0 0h10v45H0z" transform="matrix(-1 0 0 1 10 37)" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M0 0h49v9H0z" transform="matrix(-1 0 0 1 89 0)" />
                </g>
                <defs>
                    <clipPath id="clip0_13_60">
                        <path fill="#fff" d="M0 0h128v100H0z" transform="matrix(-1 0 0 1 128 0)" />
                    </clipPath>
                </defs>
            </symbol>

            <symbol id={'slime-' + uniqueKey + '-left-2'} viewBox="0 0 150 150">
                <g clipPath="url(#clip0_13_120)">
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M31 9h58v9h20v19h9v45h-14v9H21v-9H11V37h11V18h9V9z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M0 0h70v9H0z" transform="matrix(-1 0 0 1 99 91)" />
                    <path id="Rectangle 3" d="M0 0h10v45H0z" transform="matrix(-1 0 0 1 118 37)" />
                    <path id="Rectangle 13" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 109 18)" />
                    <path id="RightEye" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 39 45)" />
                    <path id="LeftEye" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 80 45)" />
                    <path id="Rectangle 7" d="M0 0h20v9H0z" transform="matrix(1 0 0 -1 89 18)" />
                    <path id="Rectangle 10" d="M0 0h19v9H0z" transform="matrix(1 0 0 -1 89 91)" />
                    <path id="Rectangle 11" d="M0 0h19v9H0z" transform="matrix(1 0 0 -1 19 91)" />
                    <path id="Rectangle 8" d="M0 0h21v9H0z" transform="matrix(1 0 0 -1 20 18)" />
                    <path id="Rectangle 6" d="M0 0h10v19H0z" transform="matrix(-1 0 0 1 30 18)" />
                    <path id="Rectangle 4" d="M0 0h10v45H0z" transform="matrix(-1 0 0 1 19 37)" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M0 0h49v9H0z" transform="matrix(-1 0 0 1 89 0)" />
                </g>
                <defs>
                    <clipPath id="clip0_13_120">
                        <path fill="#fff" d="M0 0h128v98H0z" transform="matrix(-1 0 0 1 128 0)" />
                    </clipPath>
                </defs>
            </symbol>

            <symbol id={'slime-' + uniqueKey + '-up-1'} viewBox="0 0 150 150">
                <g clipPath="url(#clip0_13_138)">
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M97 9H39v9H19v19h-9v45h14v9h83v-9h10V37h-7V18H97V9z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M29 91h70v9H29z" />
                    <path id="Rectangle 3" d="M0 37h10v45H0z" />
                    <path id="Rectangle 5" d="M10 18h10v19H10z" />
                    <path id="Rectangle 9" d="M10 18h10v19H10z" />
                    <path id="Rectangle 13" d="M10 18h10v19H10z" />
                    <path id="Rectangle 7" d="M39 18h20v9H39z" transform="rotate(180 39 18)" />
                    <path id="Rectangle 10" d="M29 91h19v9H29z" transform="rotate(180 29 91)" />
                    <path id="Rectangle 11" d="M117 91h19v9h-19z" transform="rotate(180 117 91)" />
                    <path id="Rectangle 8" d="M108 18h21v9h-21z" transform="rotate(180 108 18)" />
                    <path id="Rectangle 6" d="M108 18h10v19h-10z" />
                    <path id="Rectangle 4" d="M118 37h10v45h-10z" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M39 0h49v9H39z" />
                </g>
                <defs>
                    <clipPath id="clip0_13_138">
                        <path fill="#fff" d="M0 0h128v100H0z" />
                    </clipPath>
                </defs>
            </symbol>
            <symbol id={'slime-' + uniqueKey + '-up-2'} viewBox="0 0 150 150">
                <g >
                    <path id="Union" fill={fill === undefined ? '#D9D9D9' : getAttr()} fillRule="evenodd"
                        d="M87 11H39v7H19v19h-9v45h29v9h48v-9h30V37h-10V18H87v-7z" clipRule="evenodd" />
                    <path id="Rectangle 1" d="M29 82h70v9H29z" />
                    <path id="Rectangle 3" d="M0 37h10v45H0z" />
                    <path id="Rectangle 9" d="M10 27h10v19H10z" />
                    <path id="Rectangle 7" d="M39 27h20v9H39z" transform="rotate(180 39 27)" />
                    <path id="Rectangle 10" d="M29 82h19v9H29z" transform="rotate(180 29 82)" />
                    <path id="Rectangle 11" d="M117 82h19v9h-19z" transform="rotate(180 117 82)" />
                    <path id="Rectangle 8" d="M108 27h21v9h-21z" transform="rotate(180 108 27)" />
                    <path id="Rectangle 6" d="M107 27h10v19h-10z" />
                    <path id="Rectangle 4" d="M117 37h10v45h-10z" />
                    <path id="Rectangle 2" fill={border === undefined ? '#020202' : border} d="M39 9h49v9H39z" />
                </g>
            </symbol>
        </svg>
    )

}

