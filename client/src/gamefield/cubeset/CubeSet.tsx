import { Client, IMessage } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateRenderingState, updateSize } from "../../redux/CubeSlice.tsx";
import { initialGameSize } from "../../redux/GameSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import { updateUsername } from "../../redux/UserSlice.tsx";
import Cube from "./Cube.tsx";
import './CubeSet.css';
import { Root } from "react-dom/client";

interface Props {
    client: Client | undefined;
}

export default function CubeSet({ client }: Props) {

    const cubeset = useSelector((state: RootState) => state.game.cubeset)
    const [attrset,setAttrset] = useState<Set<string>>(new Set<string>())


    const dispatch = useDispatch()

    const observerPos = useSelector((state: RootState) => state.observer.observerPos)
    const observer = useSelector((state: RootState) => state.observer.observer)

    const gameSize = useSelector((state: RootState) => state.game.size)

    const beingConquered = (cubeNickname:string) => {
        
    }

    const hasPlayer = (cubeNickname: string) => {
        return observerPos === cubeNickname ? true : false
    }

    const getAttr = (cubeNickname: string) => {

            if(attrset.size > 0 && attrset.has(cubeNickname)){
                return attrset[cubeNickname]
            }
    }

    useEffect(() => {

        window.addEventListener('resize', updateCubeSize)

        return () => {

            window.removeEventListener('resize', updateCubeSize)

        }

    }, [])


    useEffect(() => {
        if (client?.connected) {
            client.subscribe('/topic/game/action/conquer/start', (msg: IMessage) => {
                console.log(msg.body)
            })
            client.subscribe('/topic/game/action/conquer/cancel', (msg: IMessage) => {
                console.log(msg.body)
            })
            client.subscribe('/topic/cube/conquerSet',(msg:IMessage) => {
                console.log(msg.body)
            })
            client.subscribe('/user/queue/cube/conquerSet',(msg:IMessage) => {
                
                const parser = JSON.parse(msg.body)

                setAttrset(parser)
            })

            client.publish({destination:'/app/cube/conquerSet'})
        }
    }, [client])



    // 큐브 사이즈가 변할 때, redux용 state를 업데이트.
    const updateCubeSize = () => {

        const slimeBox = document.getElementById('slimebox0')

        if (slimeBox) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { width, height } = entry.contentRect;
                    dispatch(updateSize({ width: slimeBox.offsetWidth, height: slimeBox.offsetHeight }));
                }
            });

            resizeObserver.observe(slimeBox);

            // Clean up the observer on component unmount
            return () => {
                resizeObserver.unobserve(slimeBox);
            };
        }

    }


    useEffect(() => {

        if (cubeset) {

            const lengths = Object.values(cubeset).map((value: []) => value.length)

            dispatch(updateRenderingState({ isRendered: true }))
            dispatch(initialGameSize({ size: Math.max(...lengths) }))
            updateCubeSize()
        }

    }, [cubeset])

    return (
        cubeset &&
        <Stack id="cubeSet" className="cube-set">
            <div className="cube-row">
                {Array.from({ length: gameSize + 2 }, (_, index) => (
                    <Cube key={'col-border-top-' + index} name={"styx"} hasPlayer={false} setBorder={true} attr={"STYX"} />
                ))}
            </div>
            {
                Object.keys(cubeset).map((rowNum, index) => {
                    return (
                        <div key={'row-' + rowNum} className="cube-row">
                            <Cube key={'col-border-left-' + index} name={"styx"} hasPlayer={false} setBorder={true} attr={"STYX"} />
                            {
                                cubeset[rowNum].map((cube, index) => {
                                    return (
                                        <Cube 
                                        key={'col-' + cube.posX + cube.posY} 
                                        name={cube.name} 
                                        hasPlayer={hasPlayer(cube.name)} 
                                        setBorder={false} 
                                        attr={getAttr(cube.name)} 
                                        conquering={true}
                                        />
                                    )
                                })
                            }
                            <Cube key={'col-border-right-' + index} name={"styx"} hasPlayer={false} setBorder={true} attr={"STYX"} />
                        </div>
                    )
                })
            }
            <div className="cube-row">
                {
                    Array.from({ length: gameSize + 2 }, (_, index) => (
                        <Cube key={'col-border-down-' + index} name={"styx"} hasPlayer={false} setBorder={true} attr={"STYX"} />
                    ))
                }
            </div>
        </Stack >


    )

}