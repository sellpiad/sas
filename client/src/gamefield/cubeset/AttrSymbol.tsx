import React from "react"
import './AttrSymbol.css'

interface Props {
    width: string
    height: string
    attr: string
    opacity: number
    animating: boolean
}

export default function AttSymbol({ width, height, attr, opacity, animating }: Props) {

    return (
        <svg className={animating ? 'animate' : ''} width={width} height={height} viewBox="0 0 70 70" fill="none" opacity={opacity} xmlns="http://www.w3.org/2000/svg">
            {attr === 'GRASS' && <Grass />}
            {attr === 'FIRE' && <Fire />}
            {attr === 'WATER' && <Water />}
        </svg>
    )
}

function Grass() {
    return (
        <path fillRule="evenodd" clipRule="evenodd" d="M35 0H65V5H35V0ZM35 10V5H30V10H25V15H20V20H15V25H10V45H15V50H10V55H5V60H0V65H5V70H10V65H15V60H20V55H25V60H45V55H50V50H55V45H60V40H65V35H70V5H65V35H60V30H40V15V10H35ZM35 10V15V30H40V35H60V40H55V45H50V40H30V20H25V15H30V10H35ZM25 20V40H30V45H50V50H45V55H25V50H20V45H15V25H20V20H25ZM15 55H10V60H5V65H10V60H15V55ZM15 55H20V50H15V55Z" fill="#57FF4F" />
    )
}

function Water() {
    return (
        <>
            <path fillRule="evenodd" clipRule="evenodd" d="M37 0H32V5H27V10H22V15H17V20H12V25H7V35H2V50H7V55H12V60H17V65H22V70H47V65H52V60H57V55H62V50H67V35H62V25H57V20H52V15H47V10H42V5H37V0Z" fill="#2444E2" />
            <path fillRule="evenodd" clipRule="evenodd" d="M52 39V49H47V54H42V59H32V64H42V59H47V54H52V49H57V39H52Z" fill="#FFF2F2" />
        </>

    )
}

function Fire() {
    return (
        <>
            <path fillRule="evenodd" clipRule="evenodd" d="M34 3H39V8H34V3ZM29 13V8H34V13H29ZM24 18V13H29V18H24ZM14 33V28V23H19V18H24V28H19V33H14ZM14 48H9V33H14V48ZM19 53H14V48H19V53ZM24 58V53H19V58V63H29V68H44V63H54V58V53H59V48H64V33H59V28V23H54V18H49V13H44V8H39V13H44V18H49V28H54V33H59V48H54V53H49V58H44V63H29V58H24Z" fill="#F80707" />
            <path fillRule="evenodd" clipRule="evenodd" d="M34 8H39V13H44V18H49V28H54V33H59V48H54V53H49V58H44V63H29V58H24V53H19V48H14V33H19V28H24V18H29V13H34V8ZM49 48V33H44V28H39V23H34V28H29V33H24V48H29V53H44V48H49Z" fill="#F84F07" />
            <path fillRule="evenodd" clipRule="evenodd" d="M34 23V28H29V33H24V48H29V53H44V48H49V33H44V28H39V23H34Z" fill="#BB9220" />
        </>
    )
}