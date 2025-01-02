"use client";

import { folder, useControls } from "leva";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Crack, Force, Items, Throw } from "@/cmp/threejs";
import { useEffect, useState } from "react";

export default function Page() {

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = e => setCursorPosition({ x: e.clientX, y: e.clientY })

  const handleTouchMove = e => e.touches && e.touches.length > 0 && setCursorPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY })

  const [leva, set] = useControls(() => ({
    "@react-three/rapier": folder({
      debug: false,
      gravity: [0, -9.82, 0],
      force: folder(
        {
          target: { x: 0, y: 0, z: 0 },
          power: { value: 0, min: -20, max: 20, step: 1 },
        },
        { collapsed: true }
      ),
      throw: folder(
        {
          shoot: true,
          speed: { value: 50, min: 1, max: 50, step: 1 },
        },
        { collapsed: true }
      ),
    }),
  }));

  useEffect(() => {
    set({ gravity: leva.power !== 0 ? [0, 0, 0] : [0, -9.82, 0] });
  }, [leva.power, set]);

  return (
    <main
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{ position: "relative", overflow: "hidden", touchAction: "none" }} // touchAction: "none" でスクロールを無効化
    >
      <Canvas camera={{ position: [0, 0, 40] }}>
        <OrbitControls />
        <ambientLight />
        <Environment preset="sunset" />
        <pointLight />
        {leva.debug && (
          <>
            <axesHelper args={[10000]} />
            <gridHelper args={[10000, 10000, "gray"]} />
          </>
        )}
        <Physics debug={leva.debug} gravity={leva.gravity}>
          <Force leva={leva} />
          <Throw leva={leva} />
          <Crack leva={leva} />
          <Items leva={leva} />
        </Physics>
      </Canvas>
      <div className={`absolute -translate-x-1/2 -translate-y-1/2 size-32 bg-[url(/img/cursor.png)] bg-cover pointer-events-none duration-500`}
           style={{ top: cursorPosition.y, left: cursorPosition.x }}/>
    </main>
  );
}
