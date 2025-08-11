"use client"

import { Character, Floor, Shooter } from "@/cmp/threejs"
import { Environment, OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"

export default function Page() {
  return (
    <main onContextMenu={e => e.preventDefault()}>
      <Canvas camera={{ position: [5, 5 ,5]}}>
        <OrbitControls/>
        <Environment preset="sunset"/>
        <ambientLight args={["orange", 1]}/>
        <fog attach="fog" args={["white", 30, 50]}/>
        <gridHelper args={[10000, 10000, "#ddd", "#ddd"]}/>
        <Physics>
          <Floor/>
          <Character position={[0, 5, 0]}/>
          <Shooter/>
        </Physics>
      </Canvas>
    </main>
  )
}