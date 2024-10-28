import React from "react"
import './AttrSymbol.css'

interface Props {
    width: string
    height: string
    attr: string
    opacity: number
}

export default function AttrSymbol({ width, height, attr, opacity}: Props) {

    return (
        <svg width={width} height={height} viewBox="0 0 70 90" fill="none" opacity={opacity} xmlns="http://www.w3.org/2000/svg">
            {attr === 'GRASS' && <Grass />}
            {attr === 'FIRE' && <Fire />}
            {attr === 'WATER' && <Water />}
        </svg>
    )
}

function Grass() {
    return (<>
        <rect x="11" y="35" width="70" height="70" fill="url(#pattern0_122_313)" />
        <g className='float-animation' filter="url(#filter0_d_122_313)">
            <path fillRule="evenodd" clipRule="evenodd" d="M39 0H69V5H39V0ZM39 10V5H34V10H29V15H24V20H19V25H14V45H19V50H14V55H9V60H4V65H9V70H14V65H19V60H24V55H29V60H49V55H54V50H59V45H64V40H69V35H74V5H69V35H64V40H59V45H54V50H49V55H29V50H24V45H19V25H24V20H29V15H34V10H39ZM39 10H44V15H39V10ZM19 55H14V60H9V65H14V60H19V55ZM19 55H24V50H19V55Z" fill="#12930C" />
            <path fillRule="evenodd" clipRule="evenodd" d="M44 10H39V30H44V35H64V30H44V10ZM34 20H29V40H34V45H54V40H34V20Z" fill="#0F9208" />
            <path fillRule="evenodd" clipRule="evenodd" d="M39 5H69V10V30V35H64V30H44V10H39V5ZM29 20V15H34V10H39V30H44V35H64V40H59V45H54V40H34V35V20H29ZM24 25V20H29V40H34V45H54V50H49V55H34H29V50H24V45H19V25H24Z" fill="#529E2F" />
        </g>
        <defs>
            <pattern id="pattern0_122_313" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use xlinkHref="#image0_122_313" transform="translate(-0.0982906) scale(0.00854701)" />
            </pattern>
            <filter id="filter0_d_122_313" x="0" y="0" width="78" height="78" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_313" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_313" result="shape" />
            </filter>
            <filter id="filter1_d_122_313" x="25" y="10" width="43" height="43" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_313" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_313" result="shape" />
            </filter>
            <filter id="filter2_f_122_313" x="15" y="1" width="58" height="58" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_122_313" />
            </filter>
            <image id="image0_122_313" width="140" height="117" xlinkHref="data:image/png;base64,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" />
        </defs>
    </>
    )
}

function Water() {
    return (
        <>
            <rect x="2" y="40" width="70" height="70" fill="url(#pattern0_122_311)" />
            <g className='float-animation' filter="url(#filter0_d_122_311)">
                <path fillRule="evenodd" clipRule="evenodd" d="M39 0H34V5H29V10H24V15H19V20H14V25H9V35H4V50H9V55H14V60H19V65H24V70H49V65H54V60H59V55H64V50H69V35H64V25H59V20H54V15H49V10H44V5H39V0Z" fill="#2444E2" />
                <path fillRule="evenodd" clipRule="evenodd" d="M54 39V49H49V54H44V59H34V64H44V59H49V54H54V49H59V39H54Z" fill="#FFF2F2" />
            </g>
            <defs>
                <pattern id="pattern0_122_311" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_122_311" transform="scale(0.00714286)" />
                </pattern>
                <filter id="filter0_d_122_311" x="0" y="0" width="73" height="78" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_311" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_311" result="shape" />
                </filter>
                <filter id="filter1_d_122_311" x="30" y="39" width="33" height="33" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_311" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_311" result="shape" />
                </filter>
                <image id="image0_122_311" width="140" height="140" xlinkHref="data:image/png;base64,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" />
            </defs>
        </>

    )
}

function Fire() {
    return (
        <>
            <rect y="35" width="70" height="70" fill="url(#pattern0_122_203)" />
            <g className='float-animation' filter="url(#filter0_d_122_203)">
                <path fillRule="evenodd" clipRule="evenodd" d="M34 3H39V8H34V3ZM29 13V8H34V13H29ZM24 18V13H29V18H24ZM14 33V28V23H19V18H24V28H19V33H14ZM14 48H9V33H14V48ZM19 53H14V48H19V53ZM24 58V53H19V58V63H29V68H44V63H54V58V53H59V48H64V33H59V28V23H54V18H49V13H44V8H39V13H44V18H49V28H54V33H59V48H54V53H49V58H44V63H29V58H24Z" fill="#F80707" />
                <path fillRule="evenodd" clipRule="evenodd" d="M34 8H39V13H44V18H49V28H54V33H59V48H54V53H49V58H44V63H29V58H24V53H19V48H14V33H19V28H24V18H29V13H34V8ZM49 48V33H44V28H39V23H34V28H29V33H24V48H29V53H44V48H49Z" fill="#F84F07" />
                <path fillRule="evenodd" clipRule="evenodd" d="M34 23V28H29V33H24V48H29V53H44V48H49V33H44V28H39V23H34Z" fill="#BB9220" />
            </g>
            <defs>
                <pattern id="pattern0_122_203" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_122_203" transform="translate(-0.108696) scale(0.00869565)" />
                </pattern>
                <filter id="filter0_d_122_203" x="5" y="3" width="63" height="73" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_203" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_203" result="shape" />
                </filter>
                <filter id="filter1_d_122_203" x="10" y="8" width="53" height="63" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_203" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_203" result="shape" />
                </filter>
                <filter id="filter2_d_122_203" x="20" y="23" width="33" height="38" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_122_203" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_122_203" result="shape" />
                </filter>
                <image id="image0_122_203" width="140" height="115" xlinkHref="data:image/png;base64,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" />
            </defs>
        </>
    )
}

