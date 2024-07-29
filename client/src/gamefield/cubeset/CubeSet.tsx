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

interface Props {
    client: Client | undefined;
}

export default function CubeSet({ client }: Props) {

    const cubeset = useSelector((state: RootState) => state.game.cubeset)

    const [conqueredCubes, setConqueredCubes] = useState<Set<string>>(new Set<string>())
    const [targetCube, setTartgetCube] = useState<string>('')

    const dispatch = useDispatch()

    const playerId = useSelector((state: RootState) => state.user.username)
    const playerPos = useSelector((state: RootState) => state.user.position)


    const isConquered = (cubeNickname: string) => {
        return conqueredCubes.has(cubeNickname)
    }

    const isClickable = (cubeNickname: string) => {
        return playerPos === cubeNickname ? true : false
    }

    const isDominating = (cubeNickname: string) => {
        return targetCube === cubeNickname ? true : false
    }



    useEffect(() => {

        if (client != undefined) {
        
            client.subscribe('/user/queue/player/alive', (msg: IMessage) => {
                if (!JSON.parse(msg.body)) {
                    dispatch(updateUsername({ playerId: null }))
                }
            })

            client.subscribe("/user/queue/player/isDominating", (msg: IMessage) => {
                setTartgetCube(msg.body)
            })

            client.subscribe("/user/queue/cube/conqueredCubes", (msg: IMessage) => {
                //setConqueredCubes(new Set<string>(JSON.parse(msg.body)))
            })

        }

        window.addEventListener('resize', updateCubeSize)


        return () => {

            if (client != undefined) {
                client.unsubscribe("/user/queue/cube/cubeSet")
                client.unsubscribe("/user/queue/cube/conqueredCubes")
            }

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


    useEffect(() => {

        if (playerId === null) {
            setConqueredCubes(new Set<string>())
        }

    }, [playerId])


    return (
        cubeset &&
        <Stack id="cubeSet" className="cube-set">
            {
                Object.keys(cubeset).map((rowNum, index) => {
                    return <div key={'row-' + rowNum} className="cube-row">
                        {
                            cubeset[rowNum].map((cube, index) => {
                                return <div key={'col-' + cube.posX + cube.posY} style={{ width: "100%", height: "100%" }}>
                                    <Cube name={cube.name} isConquest={isConquered(cube.name)} isClickable={isClickable(cube.name)} isDominating={isDominating(cube.name)} />
                                </div>
                            })
                        }
                    </div>
                })

            }
        </Stack>


    )

}