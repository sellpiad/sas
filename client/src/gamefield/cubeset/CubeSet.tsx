import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { Stack } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import useCube, { CubeSetType, CubeType } from "../../customHook/useCube.tsx";
import { updateSize } from "../../redux/CubeSlice.tsx";
import { RootState } from "../../redux/Store.tsx";
import Cube from "./Cube.tsx";
import './CubeSet.css';

/**
 * 큐브셋 컴포넌트
 * 
 */

interface Props {
    client: Client | undefined;
}


export default function CubeSet({ client }: Props) {

    const cubeset: CubeSetType = useCube({ client })
    const [mapSize, setMapSize] = useState<number>(0)

    const dispatch = useDispatch()

    const mapSizeSetting = () => {
        const lengths = Object.values(cubeset).map((cubeRow) => Object.keys(cubeRow).length)
        setMapSize(Math.max(...lengths))
    }

    const boxSizeSetting = () => {
        const slimeBox = document.getElementById('slimebox0')

        if (slimeBox != null)
            dispatch(updateSize({ width: slimeBox.offsetWidth, height: slimeBox.offsetHeight }));

    }

    useEffect(() => {

        if (cubeset) {
            mapSizeSetting()
            boxSizeSetting()

            window.addEventListener('resize', boxSizeSetting)
        }

        return () => {
            window.removeEventListener('resize', boxSizeSetting)
        }

    }, [cubeset])



    return (
        cubeset &&
        <Stack id="cubeSet" className="cube-set">
            <div className="cube-row">
                {Array.from({ length: mapSize + 2 }, (_, index) => (
                    <Cube key={'col-border-top-' + index} name={"styx"} setBorder={true} attr={"STYX"} />
                ))}
            </div>
            {
                Object.keys(cubeset).map((posY) => {

                    const cubeRowSet: { [name: string]: CubeType } = cubeset[posY]

                    return (
                        <div key={'row-' + posY} className="cube-row">
                            <Cube key={'col-border-left-' + posY} name={"styx"} setBorder={true} attr={"STYX"} />
                            {
                                Object.values(cubeRowSet).map((cube) => {
                                    return (
                                        <Cube
                                            key={'col-' + cube.posX + cube.posY}
                                            name={cube.name}
                                            attr={cube.attr}
                                            setBorder={false}
                                        />
                                    )
                                })
                            }
                            <Cube key={'col-border-right-' + posY} name={"styx"} setBorder={true} attr={"STYX"} />
                        </div>
                    )
                })
            }
            <div className="cube-row">
                {
                    Array.from({ length: mapSize + 2 }, (_, index) => (
                        <Cube key={'col-border-down-' + index} name={"styx"} setBorder={true} attr={"STYX"} />
                    ))
                }
            </div>
        </Stack >


    )

}