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

    const dispatch = useDispatch()

    const observerPos = useSelector((state:RootState) => state.observer.observerPos)
    const observer = useSelector((state:RootState) => state.observer.observer)

    const hasPlayer = (cubeNickname: string) => {
        return observerPos === cubeNickname ? true : false
    }

    const getAttr = (cubeNickname: string) => {
        if(hasPlayer(cubeNickname)){
            return observer !== null ? observer.attr : ''
        }
    }

    useEffect(() => {

        window.addEventListener('resize', updateCubeSize)

        return () => {

            window.removeEventListener('resize', updateCubeSize)

        }

    }, [])



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
            {
                Object.keys(cubeset).map((rowNum, index) => {
                    return <div key={'row-' + rowNum} className="cube-row">
                        {
                            cubeset[rowNum].map((cube, index) => {
                                return <div key={'col-' + cube.posX + cube.posY} style={{ width: "100%", height: "100%" }}>
                                    <Cube name={cube.name} hasPlayer={hasPlayer(cube.name)} attr={getAttr(cube.name)} />
                                </div>
                            })
                        }
                    </div>
                })

            }
        </Stack>


    )

}