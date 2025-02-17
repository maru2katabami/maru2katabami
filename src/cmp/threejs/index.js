"use client"

import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import Texture from "./texture"
import Throw from "./throw"
import Objects from "./objects"

export default function ThreeJS() {

  return (
    <Canvas>
      <OrbitControls/>
      <Environment files="/env.hdr"/>
      <ambientLight intencity={ 10 }/>
      <Texture/>
      <Physics>
        <Throw/>
        <Objects/>
      </Physics>
    </Canvas>
  )
}