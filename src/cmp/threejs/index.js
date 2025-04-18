"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { Debug, Physics } from "@react-three/cannon"
import { Floor } from "./floor"
import { Vehicle } from "./m2k"

export function ThreeJS() {

  const [target, setTarget] = useState([0,0,0])

  return (
    <Canvas>
      <OrbitControls target={ target }/>
      <Environment preset="city"/>
      <ambientLight/>
      <color attach="background" args={["#666"]}/>
      <Physics>
        {/* <Debug> */}
        <Floor/>
        <Vehicle setTarget={ setTarget }/>
        {/* </Debug> */}
      </Physics>
    </Canvas>
  )
}