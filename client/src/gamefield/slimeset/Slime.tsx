import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { SlimeData } from "../../dataReceiver/gameReceiver.tsx";
import { ActionType, AttributeType, ObjectProps } from "../../redux/GameSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import './Slime.css';


/**
 * Component Slime
 * 슬라임 컴포넌트
 * 슬라임의 각종 정보 및 이동, 공격 등 모션 정보 포함
 * 
 */

interface Props {
    objectProps: ObjectProps // 렌더링 관련
    slimeData: SlimeData // 슬라임 데이터
}


//기본 프레임과 1프레임 당 액션의 소요 시간
//시간은 ms 단위
const FRAME_CONFIG = {
    IDLE: { frames: 2, duration: 300 },
    DRAW: { frames: 1, duration: 300 },
    MOVE: { frames: 2, duration: 300 },
    ATTACK: { frames: 3, duration: 300 },
    FEARED: { frames: 1, duration: 300 },
    LOCK: { frames: 1, duration: 300 },
    CONQUER_START: { frames: 1, duration: 3000 },
    CONQUER_CANCEL: { frames: 1, duration: 300 }
};

export default function Slime({ objectProps, slimeData }: Props) {

    // 옵저버용 애니메이션 활성용
    const observer = useSelector((state: RootState) => state.observer.observer)

    // 슬라임 렌더링 관련
    const [frame, setFrame] = useState<number>(1)
    const [moveX, setMoveX] = useState<number>(slimeData.targetX ? slimeData.targetX : 0)
    const [moveY, setMoveY] = useState<number>(slimeData.targetY ? slimeData.targetY : 0)
    const [isShaking, setShaking] = useState<boolean>(false)
    const [dir, setDir] = useState<string>('down')
    const [isShow, setShow] = useState<boolean>(false)

    // requestAnimation 계산 전용.
    const startTimeRef = useRef<number>(0)
    const targetRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
    const actionRef = useRef<ActionType>(ActionType.IDLE)
    const durationRef = useRef<number>(300)


    // 슬라임 떨림 설정
    const startShaking = (duration: number) => {
        setShaking(true)
        setTimeout(() => { setShaking(false) }, duration)
    }

    const cancelShaking = () => {
        setShaking(false)
    }

    // 슬라임의 속성을 나타내는 색을 반환하는 메소드
    const getAttr = () => {
        switch (slimeData.attr) {
            case AttributeType.GRASS: return "#38f113"
            case AttributeType.FIRE: return "#dc3545"
            case AttributeType.WATER: return "#0d6efd"
            default: return "#D9D9D9"
        }
    }


    // 슬라임 애니메이션 업데이트 
    const updateAnimation = (currentTime) => {

        const elaspedTime = currentTime - startTimeRef.current
        const { frames, duration } = FRAME_CONFIG[actionRef.current] || { frames: 1 }

        // 딜레이가 경과할 때마다 frame 증가
        if (elaspedTime > durationRef.current) {

            setFrame(prevFrame => {
                const newFrame = prevFrame + 1;

                const t = prevFrame / frames;

                setMoveX(prevX => prevX * (1 - t) + targetRef.current.x * t);
                setMoveY(prevY => prevY * (1 - t) + targetRef.current.y * t);

                if (newFrame > frames) {
                    actionRef.current = ActionType.IDLE
                    return 1;
                }

                return newFrame;
            });

            startTimeRef.current = currentTime;
        }

        requestAnimationFrame(updateAnimation)
    }


    // 초기화
    useEffect(() => {

        const animation = requestAnimationFrame(updateAnimation)

        return () => cancelAnimationFrame(animation)

    }, [])


    // 액션타입이 변경되었을 때 감지 및, action state 업데이트
    useEffect(() => {

        if (slimeData.actionType != ActionType.LOCKED) {

            setFrame(1)

            switch (slimeData.actionType) {
                case ActionType.DRAW:
                    startShaking(300)
                    break;
                case ActionType.FEARED:
                    actionRef.current = slimeData.actionType
                    startShaking(300)
                    break;
                case ActionType.STUCK:
                    startShaking(300)
                    break;
                case ActionType.CONQUER_START:
                    startShaking(5000)
                    actionRef.current = slimeData.actionType
                    break;
                case ActionType.CONQUER_CANCEL:
                    cancelShaking()
                    actionRef.current = ActionType.IDLE
                    break;
                default:
                    actionRef.current = slimeData.actionType
                    break;
            }
        }

    }, [slimeData])

    useEffect(() => {
        if (slimeData.direction !== null) {
            setDir(slimeData.direction)
        }
    }, [slimeData.direction])


    // 포지션 업데이트
    useEffect(() => {
        targetRef.current.x = slimeData.targetX ? slimeData.targetX : 0
        targetRef.current.y = slimeData.targetY ? slimeData.targetY : 0
    }, [slimeData.targetX, slimeData.targetY])


    // 애니메이션 duration 업데이트
    useEffect(() => {
        if (slimeData.duration > 0) {
            durationRef.current = slimeData.duration
        }
    }, [slimeData.duration])


    return (
        (moveX > 0 || (objectProps.position === 'relative')) && 
        <svg className={objectProps.className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width={objectProps.width} height={objectProps.height} preserveAspectRatio="xMidYMid meet"
            style={{
                position: objectProps.position,
                transform: "translate(" + moveX + "px," + moveY + "px)",
                transition: "transform " + durationRef.current * FRAME_CONFIG[actionRef.current].frames + "ms ease"
            }}>

            {observer === slimeData.username &&
                <circle viewBox="0 0 150 150" cx="75" cy="75" r="10" stroke={getAttr()} strokeWidth="10" fill="transparent">
                    <animate
                        attributeName="r"
                        from="10"
                        to="90"
                        dur={FRAME_CONFIG.IDLE.frames * FRAME_CONFIG.IDLE.duration + 'ms'}
                        begin="0s"
                        repeatCount="indefinite"
                        fill="freeze" />
                    <animate
                        attributeName="opacity"
                        from="1"
                        to="0.3"
                        dur={FRAME_CONFIG.IDLE.frames * FRAME_CONFIG.IDLE.duration + 'ms'}
                        begin="0s"
                        repeatCount="indefinite"
                        fill="freeze" />
                </circle>}

            <use xlinkHref={'#slime-' + slimeData.username + '-' + dir + '-' + actionRef.current + '-' + frame}
                x={11}
                y={25}
                width={150}
                height={150}
                className={isShaking ? 'slime-shaking' : ''}
            />

            <symbol id={'slime-' + slimeData.username + '-down-IDLE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={getAttr()} />
                <rect id="RightEye" x="77" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="38" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-down-IDLE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={getAttr()} />
                <rect id="RightEye" x="73" y="62.9992" width="10" height="19" transform="rotate(-89.2643 73 62.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="64" width="10" height="19" transform="rotate(-89.9731 33 64)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-down-MOVE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H22V37H19V82H25H39V91H87V82H108H109V37H103V18H87V11Z" fill={getAttr()} />
                <rect id="RightEye" x="73" y="62.9992" width="10" height="19" transform="rotate(-89.2643 73 62.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="64" width="10" height="19" transform="rotate(-89.9731 33 64)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M52 4H75V9H96V18H75V11H52V18H32V9H52V4ZM22 37V18H32V37H22ZM22 82H12V37H22V82ZM41 91H22V82H41V91ZM87 91H41V100H87V91ZM106 82V91H87V82H106ZM106 37H116V82H106V37ZM106 37V18H96V37H106Z" fill="black" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-down-MOVE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M99 41H29V50H20V87H29V91H99V87H109V50H99V41Z" fill={getAttr()} />
                <rect id="RightEye" x="74" y="80.9992" width="10" height="19" transform="rotate(-89.2643 74 80.9992)" fill="black" />
                <rect id="LeftEye" x="33" y="81" width="10" height="19" transform="rotate(-89.9731 33 81)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 32H89V41H109V50H88V41H40V32ZM20 50V41H40V50H20ZM29 89H19V80H10V50H20V79H29V89ZM99 89V98H29V89H99ZM109 79V50H119V80H109V89H99V79H109Z" fill="#020202" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M68 -8H58V37H68V-8ZM89 11H99V41H89V11ZM30 15H40V45H30V15Z" fill="black" />
            </symbol>


            <symbol id={'slime-' + slimeData.username + '-down-ATTACK-1'} viewBox="0 0 150 150">
                <path id="Body" d="M87 11H39V18H19V37H10V82H39V91H87V82H117V37H107V18H87V11Z" fill={getAttr()} />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M43 44H33V63H33.0005L33 64L52 64.0089L52.0047 54.0089L43 54.0047V44Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M93 44H83V53.1268L73.1284 53L73 62.9992L91.9984 63.2432L92.0016 63H93V44Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-down-ATTACK-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M98 9H40V18H20V37H11V82H25V91H40H98H108V82H118V37H111V18H98V9Z" fill={getAttr()} />
                <rect id="Mouse" x="53" y="69" width="22" height="9" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M97 45H87V54H78V64H87H97V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M40 45H30V54V64H40H49V54H40V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V37H20V18H39V9H87V18H108V37H118V18H108V9H88V0ZM99 91H30V82H11V91H30V100H100V91H118V82H99V91ZM119 37H129V82H119V37Z" fill="#020202" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-down-ATTACK-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M98 9H40V18H20V37H11V82H25V91H40H98H108V82H118V37H111V18H98V9Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M103 31H93V40H84V50H93H103V40V31Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M36 31H26V40V50H36H45V40H36V31Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V37H20V18H39V9H87V18H108V37H118V18H108V9H88V0ZM99 91H30V82H11V91H30V100H100V91H118V82H99V91ZM119 37H129V82H119V37Z" fill="#020202" />
                <rect id="Mouse" x="49" y="55" width="31" height="27" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-IDLE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-IDLE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-MOVE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-MOVE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M99 56H29V47H20V10H29V6H99V10H109V47H99V56Z" fill={getAttr()} />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M68 105H58V60H68V105ZM89 86H99V56H89V86ZM30 82H40V52H30V82Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 65H89V56H109V47H88V56H40V65ZM20 47V56H40V47H20ZM29 8H19V17H10V47H20V18H29V8ZM99 8V-1H29V8H99ZM109 18V47H119V17H109V8H99V18H109Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-ATTACK-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M87 11H39V18H19V37H10V82H25H39V91H87V82H108H117V37H107V18H87V11Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 9H39V18H19V27H10V37H0V82H10H29V91H99V82H117H127V37H117V27H108V18H88V9ZM87 18V27H107V46H117V73H98V82H29V73H10V46H20V27H39V18H87Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-ATTACK-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-ATTACK-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-IDLE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H110V18H97V9Z" fill={getAttr()} />
                <rect id="RightEye" x="92" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="44" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18H10V37H0V82H10V91H29V100H99V91H117V82H98V91H29V82H10V37H20V18H39V9H87V18H108V37H118V82H128V37H118V18H108V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-IDLE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 69 55)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 98 55)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-MOVE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H106V18H97V9Z" fill={getAttr()} />
                <rect id="RightEye" x="89" y="45" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="48" y="45" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18V37H10V82H20V91H29V100H99V91H109V82H119V37H109V82H90V91H39V82H20V37H29V18H39V9H87V18H98V37H108V18V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-MOVE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={getAttr()} />
                <rect id="RightEye" x="117" y="70" width="10" height="20" transform="rotate(-90 117 70)" fill="black" />
                <rect id="LeftEye" x="81" y="70" width="10" height="20" transform="rotate(-90 81 70)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-ATTACK-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M97 9H39V18H19V37H10V82H24V91H39H97H107V82H117V37H106V18H97V9Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M99 45H89V54H80V64H89H99V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M58 45H48V54V64H58H67V54H58V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M88 0H39V9H19V18V37H10V82H20V91H29V100H99V91H109V82H119V37H109V82H90V91H39V82H20V37H29V18H39V9H87V18H98V37H108V18V9H88V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-ATTACK-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M135 39H125V50H115V60H135V59V50V39Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M89 39H79V50V59V60H99V50H89V39Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
                <rect id="Mouse" x="97" y="68" width="20" height="10" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-ATTACK-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M131 19H76V28H52V29H51V53H41V63H11V91H51H136H141V29H136.103V28H131V19Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M129 33H119V44H109V54H129V53V44V33Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M83 33H73V44V53V54H93V44H83V33Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M81 8H122V18H131V28H121V18H81V8ZM61 28V18H81V28H61ZM51 43V28H61V43H51ZM31 63V53H41V43H51V53V63H41H31ZM11 73V63H31V73H11ZM51 93V83H11V73H1V83V93H11H51ZM121 93V103H51V93H121ZM141 83V93H121V83H141ZM141 38H151V83H141V38ZM141 38V28H131V38H141Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M34 28H64V18H34V28ZM11 43H51V33H11V43Z" fill="black" />
                <rect id="Mouse" x="94" y="59" width="25" height="25" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-IDLE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H18V18H31V9Z" fill={getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 36 45)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 84 45)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18H118V37H128V82H118V91H99V100H29V91H11V82H30V91H99V82H118V37H108V18H89V9H41V18H20V37H10V82H0V37H10V18H20V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-IDLE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M88 20H40V27H20V46H11V91H26H40V100H88V91H109H118V46H108V27H88V20Z" fill={getAttr()} />
                <rect id="RightEye" x="59" y="55" width="10" height="19" fill="black" />
                <rect id="LeftEye" x="30" y="55" width="10" height="19" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M89 18H40V27H20V36H11V46H1V91H11H30V100H100V91H118H128V46H118V36H109V27H89V18ZM88 27V36H108V55H118V82H99V91H30V82H11V55H21V36H40V27H88Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-MOVE-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={getAttr()} />
                <rect id="RightEye" width="10" height="19" transform="matrix(-1 0 0 1 39 45)" fill="black" />
                <rect id="LeftEye" width="10" height="19" transform="matrix(-1 0 0 1 80 45)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-MOVE-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={getAttr()} />
                <rect id="RightEye" width="10" height="20" transform="matrix(0 -1 -1 0 33 70)" fill="black" />
                <rect id="LeftEye" width="10" height="20" transform="matrix(0 -1 -1 0 69 70)" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-ATTACK-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M31 9H89V18H109V37H118V82H104V91H89H31H21V82H11V37H22V18H31V9Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M29 45H39V54H48V64H39H29V54V45Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M70 45H80V54V64H70H61V54H70V45Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M40 0H89V9H109V18V37H118V82H108V91H99V100H29V91H19V82H9V37H19V82H38V91H89V82H108V37H99V18H89V9H41V18H30V37H20V18V9H40V0Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-ATTACK-2'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M15 39H25V50H35V60H15V59V50V39Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M61 39H71V50V59V60H51V50H61V39Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
                <rect id="Mouse" width="20" height="10" transform="matrix(-1 0 0 1 53 68)" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-ATTACK-3'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M19 19H74V28H98V29H99V53H109V63H139V91H99H14H9V29H13.8974V28H19V19Z" fill={getAttr()} />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M21 33H31V44H41V54H21V53V44V33Z" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M67 33H77V44V53V54H57V44H67V33Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M69 8H28V18H19V28H29V18H69V8ZM89 28V18H69V28H89ZM99 43V28H89V43H99ZM119 63V53H109V43H99V53V63H109H119ZM139 73V63H119V73H139ZM99 93V83H139V73H149V83V93H139H99ZM29 93V103H99V93H29ZM9 83V93H29V83H9ZM9 38H-1V83H9V38ZM9 38V28H19V38H9Z" fill="black" />
                <path id="Effect" fillRule="evenodd" clipRule="evenodd" d="M116 28H86V18H116V28ZM139 43H99V33H139V43Z" fill="black" />
                <rect id="Mouse" width="25" height="25" transform="matrix(-1 0 0 1 56 59)" fill="black" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-up-FEARED-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-down-FEARED-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M88 55H98V65H88V74H78V65H68V55H78H88Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M50 55H60V65H50V74H40V65H30V55H40H50Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-right-FEARED-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M95 55H105V65H95V74H85V65H75V55H85H95Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M59 55H69V65H59V74H49V65H39V55H49H59Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-left-FEARED-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M88 20H40V27H20V46H11V91H26H40V100H88V91H109H118V46H108V27H88V20Z" fill={getAttr()} />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M33 55H23V65H33V74H43V65H53V55H43H33Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M69 55H59V65H69V74H79V65H89V55H79H69Z" fill="black" />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M89 18H40V27H20V36H11V46H1V91H11H30V100H100V91H118H128V46H118V36H109V27H89V18ZM88 27V36H108V55H118V82H99V91H30V82H11V55H21V36H40V27H88Z" fill="#020202" />
            </symbol>

            <symbol id={'slime-' + slimeData.username + '-down-CONQUER_START-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
                <rect id="Mouse" width="20" height="20" transform="matrix(-1 0 0 1 74 71)" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M97 50V55V65H87H77V55H87V50H97Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M39 50V55H49V65H39H29V55V50H39Z" fill="black" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-up-CONQUER_START-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
                <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M91.7103 55.6213L90.7381 58.2923L85.1655 56.264L83.2212 61.606L80.4349 60.5918L83.3513 52.579L83.3513 52.579L83.3513 52.5789L91.7103 55.6213ZM75.5726 58.8221L78.3589 59.8362L80.3032 54.4943L80.3032 54.4943L81.2754 51.8233L72.9164 48.7809L71.9443 51.4519L77.5169 53.4801L75.5726 58.8221ZM74.8961 43.3419L73.9239 46.0129L82.2828 49.0553L82.2829 49.0552L83.255 46.3843L85.1993 41.0424L82.413 40.0282L80.4687 45.3702L74.8961 43.3419ZM93.6899 50.1823L92.7178 52.8533L84.3588 49.8109L84.3588 49.8108L84.3588 49.8108L87.2753 41.798L90.0616 42.8121L88.1173 48.1541L93.6899 50.1823Z" fill="black" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-right-CONQUER_START-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M40 20H88V27H108V46H117V91H102H88V100H40V91H19H10V46H20V27H40V20Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M39 18H88V27H108V36H117V46H127V91H117H98V100H28V91H10H0V46H10V36H19V27H39V18ZM40 27V36H20V55H10V82H29V91H98V82H117V55H107V36H88V27H40Z" fill="#020202" />
                <rect id="Mouse" width="20" height="20" transform="matrix(-1 0 0 1 83 66)" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M99 42V47V57H89H79V47H89V42H99Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M63 42V47H73V57H63H53V47V42H63Z" fill="black" />
            </symbol>
            <symbol id={'slime-' + slimeData.username + '-left-CONQUER_START-1'} viewBox="0 0 150 150">
                <path id="Body" fillRule="evenodd" clipRule="evenodd" d="M88 20H40V27H20V46H11V91H26H40V100H88V91H109H118V46H108V27H88V20Z" fill={getAttr()} />
                <path id="Frame" fillRule="evenodd" clipRule="evenodd" d="M89 18H40V27H20V36H11V46H1V91H11H30V100H100V91H118H128V46H118V36H109V27H89V18ZM88 27V36H108V55H118V82H99V91H30V82H11V55H21V36H40V27H88Z" fill="#020202" />
                <rect id="Mouse" x="45" y="66" width="20" height="20" fill="black" />
                <path id="LeftEye" fillRule="evenodd" clipRule="evenodd" d="M29 42V47V57H39H49V47H39V42H29Z" fill="black" />
                <path id="RightEye" fillRule="evenodd" clipRule="evenodd" d="M65 42V47H55V57H65H75V47V42H65Z" fill="black" />
            </symbol>

        </svg>
    )

}

