import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/Store";


/**
 * Component Slime
 * 슬라임 컴포넌트
 * 슬라임의 각종 정보 및 이동, 공격 등 모션 정보 포함
 * 
 */

interface Props {
    playerId?: string
    actionType?: string
    direction?: string
    fill?: string
    border?: string
    target?: string | undefined // 현재 위치한 큐브 이름
    width?: string
    height?: string
    isAbsolute: boolean
}

//기본 프레임과 해당 액션의 소요 시간
//시간은 ms 단위
const idleFrame = 2;
const idleTime = 500;

const movingFrame = 2;
const movingTime = 300;

const attackFrame = 3;
const attackTime = 300;

export default function Slime({ playerId, actionType, direction, fill, border, target, isAbsolute, ...props }: Props) {

    // 슬라임 넓이와 높이
    // 이 컴포넌트는 여러 곳에서 쓰기 때문에 props에서 따로 width와 height이 들어오거나,
    // 슬라임 박스 내에 위치 시키거나 하는 경우 때문에 어댑터 역할로 따로 state를 선언.
    const [width, setWidth] = useState<number>(0)
    const [height, setHeight] = useState<number>(0)

    const boxWidth = useSelector((state: RootState) => state.cube.width)
    const boxHeight = useSelector((state: RootState) => state.cube.height)

    const [speed, setSpeed] = useState<number>(0) // 이동 스피드

    const [moveX, setMoveX] = useState<number>(0)
    const [moveY, setMoveY] = useState<number>(0)
    const [motion, setMotion] = useState<string>()
    const [action, setAction] = useState<string>('idle')
    const [frame, setFrame] = useState<number>(1)

    const startTimeRef = useRef(0)
    const actionRef = useRef('idle')
    const frameRef = useRef<number>(1)

    const targetRef = useRef<string>()


    // 슬라임의 속성을 나타내는 색을 반환하는 메소드
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

    const getWidth = () => {
        return props.width === undefined ? width : props.width
    }

    const getHeight = () => {
        return props.height === undefined ? height : props.height
    }

    // 슬라임이 속한 큐브의 정보 업데이트 메소드
    const updateSlimeBox = () => {
        setWidth(boxWidth)
        setHeight(boxHeight)
    }

    // 위치 업데이트 메소드
    const updateTarget = () => {

        const slimeBox = target !== undefined && document.getElementById(target)

        if (slimeBox) {
            setMoveX(slimeBox.offsetLeft)
            setMoveY(slimeBox.offsetTop)
        }

    }

    // 모션 업데이트 메소드
    const updateMotion = () => {
        setMotion('#slime-' + playerId + '-' + direction + '-' + action + '-' + frame)
    }


    // 애니메이션 업데이트 메소드
    const updateAnimation = (currentTime) => {

        let maxFrame = 0;
        let delay = 0;
        const elaspedTime = currentTime - startTimeRef.current

        switch (actionRef.current) {
            case 'idle':
                maxFrame = idleFrame
                delay = idleTime / maxFrame
                break;
            case 'move':
                maxFrame = movingFrame
                delay = movingTime / maxFrame
                break;
            case 'attack':
                maxFrame = attackFrame
                delay = attackTime / maxFrame
                break;
        }

        // 딜레이가 경과할 때마다 frame 증가
        if (elaspedTime > delay) {

            setFrame(prev => prev + 1)
            startTimeRef.current = currentTime

            // 좌표 체크
            const slimeBox = targetRef.current !== undefined && document.getElementById(targetRef.current)


            if (slimeBox) {
                const targetX = slimeBox.offsetLeft
                const targetY = slimeBox.offsetTop

                const t = frameRef.current / movingFrame

                setMoveX(prevX => prevX * (1 - t) + targetX * t)
                setMoveY(prevY => prevY * (1 - t) + targetY * t)
            }


            if (frameRef.current === maxFrame) {
                setAction('idle')
                setFrame(1)
            }
        }

        requestAnimationFrame(updateAnimation)
    }


    // 초기화
    useEffect(() => {

        updateTarget()
        updateSlimeBox()

        setTimeout(() => { setSpeed(0.5) }, 10)
        const animation = requestAnimationFrame(updateAnimation)

        return () => cancelAnimationFrame(animation)

    }, [playerId])

    // 액션타입이 변경되었을 때 감지 및, action state 업데이트
    useEffect(() => {

        if (actionType) {
            setAction(prev => actionType?.toLowerCase() === 'locked' ? prev : actionType?.toLowerCase()) // action 변경 트리거
            setFrame(1) // 액션 변경으로 인한 frame 초기화
        }

    }, [actionType])


    // 모션 업데이트
    useEffect(() => {

        actionRef.current = action
        frameRef.current = frame

        updateMotion()

    }, [action, direction, frame])


    // 포지션 업데이트
    useEffect(() => {
        targetRef.current = target
    }, [target])


    // 박스 크기 변할 때 슬라임 크기 변화
    useEffect(() => {
        updateSlimeBox()
    }, [boxWidth, boxHeight])




    return (
        speed > 0 &&
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width={getWidth()} height={getHeight()} preserveAspectRatio="xMidYMid meet" style={{ position: isAbsolute ? "absolute" : "relative", transform: "translate(" + moveX + "px," + moveY + "px)", transition: "transform " + speed + "s ease" }}>

            <use xlinkHref={motion} x={11} y={25} width={150} height={150} />

            <symbol id={'slime-' + playerId + '-down-idle-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="77" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="38" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + playerId + '-down-idle-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="73" y="62.9992" width="10" height="19" transform="rotate(-89.2643 73 62.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="64" width="10" height="19" transform="rotate(-89.9731 33 64)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-down-move-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H22V37H19V82H25H39V91H87V82H108H109V37H103V18H87V11Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="73" y="62.9992" width="10" height="19" transform="rotate(-89.2643 73 62.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="64" width="10" height="19" transform="rotate(-89.9731 33 64)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M52 4H75V9H96V18H75V11H52V18H32V9H52V4ZM22 37V18H32V37H22ZM22 82H12V37H22V82ZM41 91H22V82H41V91ZM87 91H41V100H87V91ZM106 82V91H87V82H106ZM106 37H116V82H106V37ZM106 37V18H96V37H106Z" fill="black" />
            </symbol>
            <symbol id={'slime-' + playerId + '-down-move-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M99 41H29V50H20V87H29V91H99V87H109V50H99V41Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="74" y="80.9992" width="10" height="19" transform="rotate(-89.2643 74 80.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="81" width="10" height="19" transform="rotate(-89.9731 33 81)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 32H89V41H109V50H88V41H40V32ZM20 50V41H40V50H20ZM29 89H19V80H10V50H20V79H29V89ZM99 89V98H29V89H99ZM109 79V50H119V80H109V89H99V79H109Z" fill="#020202" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M68 -8H58V37H68V-8ZM89 11H99V41H89V11ZM30 15H40V45H30V15Z" fill="black" />
            </symbol>


            <symbol id={'slime-' + playerId + '-down-attack-1'} viewBox="0 0 150 150">
                <path id="Body" d="M87 11H39V18H19V37H10V82H39V91H87V82H117V37H107V18H87V11Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M43 44H33V63H33.0005L33 64L52 64.0089L52.0047 54.0089L43 54.0047V44Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M93 44H83V53.1268L73.1284 53L73 62.9992L91.9984 63.2432L92.0016 63H93V44Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + playerId + '-down-attack-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M98 9H40V18H20V37H11V82H25V91H40H98H108V82H118V37H111V18H98V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="Mouse" x="53" y="69" width="22" height="9" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M97 45H87V54H78V64H87H97V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M40 45H30V54V64H40H49V54H40V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V37H20V18H39V9H87V18H108V37H118V18H108V9H88V0ZM99 91H30V82H11V91H30V100H100V91H118V82H99V91ZM119 37H129V82H119V37Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + playerId + '-down-attack-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M98 9H40V18H20V37H11V82H25V91H40H98H108V82H118V37H111V18H98V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M103 31H93V40H84V50H93H103V40V31Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M36 31H26V40V50H36H45V40H36V31Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V37H20V18H39V9H87V18H108V37H118V18H108V9H88V0ZM99 91H30V82H11V91H30V100H100V91H118V82H99V91ZM119 37H129V82H119V37Z" fill="#020202" />
                <rect id="Mouse" x="49" y="55" width="31" height="27" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-idle-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-idle-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-move-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-move-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M99 56H29V47H20V10H29V6H99V10H109V47H99V56Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M68 105H58V60H68V105ZM89 86H99V56H89V86ZM30 82H40V52H30V82Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 65H89V56H109V47H88V56H40V65ZM20 47V56H40V47H20ZM29 8H19V17H10V47H20V18H29V8ZM99 8V-1H29V8H99ZM109 18V47H119V17H109V8H99V18H109Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-attack-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-attack-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-up-attack-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-idle-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="92" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="44" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-idle-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 69 55)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 98 55)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-move-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H106V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="89" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="48" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18V37H10V82H20V91H29V100H99V91H109V82H119V37H109V82H90V91H39V82H20V37H29V18H39V9H87V18H98V37H108V18V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-move-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="117" y="70" width="10" height="20" transform="rotate(-90 117 70)" fill="black" />
                <rect id="LeftEye" x="81" y="70" width="10" height="20" transform="rotate(-90 81 70)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-attack-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H106V18H97V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M99 45H89V54H80V64H89H99V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M58 45H48V54V64H58H67V54H58V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18V37H10V82H20V91H29V100H99V91H109V82H119V37H109V82H90V91H39V82H20V37H29V18H39V9H87V18H98V37H108V18V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-attack-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M135 39H125V50H115V60H135V59V50V39Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M89 39H79V50V59V60H99V50H89V39Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
                <rect id="Mouse" x="97" y="68" width="20" height="10" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-right-attack-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M129 33H119V44H109V54H129V53V44V33Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M83 33H73V44V53V54H93V44H83V33Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
                <rect id="Mouse" x="94" y="59" width="25" height="25" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-idle-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H18V18H31V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 36 45)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 84 45)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18H118V37H128V82H118V91H99V100H29V91H11V82H30V91H99V82H118V37H108V18H89V9H41V18H20V37H10V82H0V37H10V18H20V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-idle-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M88 20H40V27H20V46H11V91H26H40V100H88V91H109H118V46H108V27H88V20Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" x="59" y="55" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="30" y="55" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M89 18H40V27H20V36H11V46H1V91H11H30V100H100V91H118H128V46H118V36H109V27H89V18ZM88 27V36H108V55H118V82H99V91H30V82H11V55H21V36H40V27H88Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-move-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 39 45)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 80 45)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-move-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <rect id="RightEye" width="10" height="20" transform="matrix(0 -1 -1 0 33 70)" fill="black" />
                <rect id="LeftEye" width="10" height="20" transform="matrix(0 -1 -1 0 69 70)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-attack-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M29 45H39V54H48V64H39H29V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M70 45H80V54V64H70H61V54H70V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-attack-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M15 39H25V50H35V60H15V59V50V39Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M61 39H71V50V59V60H51V50H61V39Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
                <rect id="Mouse" width="20" height="10" transform="matrix(-1 0 0 1 53 68)" fill="black" />
            </symbol>

            <symbol id={'slime-' + playerId + '-left-attack-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={fill === undefined ? '#D9D9D9' : getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M21 33H31V44H41V54H21V53V44V33Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M67 33H77V44V53V54H57V44H67V33Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
                <rect id="Mouse" width="25" height="25" transform="matrix(-1 0 0 1 56 59)" fill="black" />
            </symbol>
        </svg>
    )

}

