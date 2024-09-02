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

type CubeAttrData = {
    name: string
    attr: string
}

export default function CubeSet({ client }: Props) {

    const cubeset = useSelector((state: RootState) => state.game.cubeset)
    const [attrmap, setAttrmap] = useState<Map<string, string>>(new Map<string, string>())
    const [conquerInProcess, setConquerInProcess] = useState<Map<string, string>>(new Map<string, string>())

    const dispatch = useDispatch()

    const observerPos = useSelector((state: RootState) => state.observer.observerPos)
    const observer = useSelector((state: RootState) => state.observer.observer)

    const gameSize = useSelector((state: RootState) => state.game.size)

    const inConquerProcess = (cubename: string) => {
        const attr = conquerInProcess.get(cubename)

        return attr == undefined ? false : true
    }

    const hasPlayer = (cubename: string) => {
        return observerPos === cubename ? true : false
    }

    const getAttr = (cubename: string) => {

        const attr = attrmap.get(cubename)

        return attr == undefined ? 'NORMAL' : attr
    }

    useEffect(() => {

        window.addEventListener('resize', updateCubeSize)

        return () => {

            window.removeEventListener('resize', updateCubeSize)

        }

    }, [])

    useEffect(() => {
        if (client?.connected) {

            client.subscribe('/topic/action/conquer/start', (msg: IMessage) => {

                const cubeAttr = JSON.parse(msg.body) as CubeAttrData

                setConquerInProcess(prev => {
                    const newMap = new Map<string, string>(prev);
                    newMap.set(cubeAttr.name, cubeAttr.attr)
                    return newMap;
                })

                setAttrmap(prev => {
                    const newMap = new Map<string, string>(prev);
                    newMap.set(cubeAttr.name, cubeAttr.attr)
                    return newMap;
                })
            })

            client.subscribe('/topic/action/conquer/cancel', (msg: IMessage) => {

                const cubeAttr = JSON.parse(msg.body) as CubeAttrData

                setConquerInProcess(prev => {
                    const newMap = new Map<string, string>(prev);
                    newMap.delete(cubeAttr.name)
                    return newMap;
                })

                setAttrmap(prev => {
                    const newMap = new Map<string, string>(prev);
                    newMap.delete(cubeAttr.name)
                    return newMap;
                })

            })
            client.subscribe('/topic/action/conquer/complete', (msg: IMessage) => {

                const cubeAttr = JSON.parse(msg.body) as CubeAttrData

                setConquerInProcess(prev => {
                    const newMap = new Map<string, string>(prev);
                    newMap.delete(cubeAttr.name)
                    return newMap;
                })

            })

            client.subscribe('/user/queue/cube/conquerSet', (msg: IMessage) => {

                const parser = JSON.parse(msg.body) as Map<string, string>

                const newMap = new Map<string, string>(Object.entries(parser))

                setAttrmap(newMap)
            })

            client.publish({ destination: '/app/cube/conquerSet' })
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
                                            conquering={inConquerProcess(cube.name)}
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