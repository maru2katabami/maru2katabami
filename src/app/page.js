"use client";

import { useEffect } from "react";
import { folder, useControls } from "leva";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Crack, Force, Items, Plasma, Throw } from "@/cmp/threejs";
import Drawer from "@/cmp/drawer";


export default function Page() {

  const [ leva, set ] = useControls(() => ({
    "@react-three/rapier": folder({
      debug: false,
      gravity: [ 0, -9.82, 0 ],
      force: folder({
        target: { x: 0, y: 0, z: 0 },
        power: { value: 0, min: -20, max: 20, step: 1 },
      }, { collapsed: true }),
      throw: folder({
        shoot: true,
        speed: { value: 50, min: 1, max: 50, step: 1 },
      }, { collapsed: true }),
    }),
  }))

  useEffect(() => {
    set({ gravity: leva.power !== 0 ? [0, 0, 0] : [0, -9.82, 0] });
  }, [ leva.power, set ])

  return (
    <main>
      <Canvas camera={{ position: [0, 0, 40] }}>
        <OrbitControls />
        <ambientLight />
        <Environment preset="sunset" />
        <pointLight />
        <Plasma/>
        {leva.debug && (<>
        <axesHelper args={[ 10000 ]}/>
        <gridHelper args={[ 10000, 10000, "gray"]} />
        </>)}
        <Physics debug={leva.debug} gravity={leva.gravity}>
          <Force leva={leva} />
          <Throw leva={leva} />
          <Crack leva={leva} />
          <Items leva={leva} />
        </Physics>
      </Canvas>
      <Drawer/>
    </main>
  )
}