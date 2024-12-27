"use client"

import { Environment, KeyboardControls, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { Character, Gravity, Object, Throw } from "@/cmp/threejs"
import { folder, useControls } from "leva"

export default function Page() {

  const { debug, gravity, shoot, power } = useControls("@react-three/fiber/drei/rapier", {
    debug: false,
    gravity: { value: 1, min: -10, max: 10, step: 0.1 },
    throw: folder({
      shoot: false,
      power: { value: 20, min: 1, max: 50, step: 1 }
    }, { collapsed: true })
  }, { collapsed: true })

  return (
    <main>
      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "KeyW"]},
          { name: "backward", keys: ["ArrowDown", "KeyS"]},
          { name: "left", keys: ["ArrowLeft", "KeyA"]},
          { name: "right", keys: ["ArrowRight", "KeyD"]},
          { name: "jump", keys: ["Space"]},
        ]}>
        <Canvas>
          <OrbitControls/>
          <Environment preset="city"/>
          <ambientLight/>
          <Physics debug={ debug } gravity={[ 0, 0, 0 ]} tim>
            <Gravity target={[ 0, 0, 0 ]} gravity={ gravity }/>
            <Object/>
            <Character/>
            <Throw shoot={ shoot } power={ power }/>
          </Physics>
        </Canvas>
      </KeyboardControls>
    </main>
  )
}