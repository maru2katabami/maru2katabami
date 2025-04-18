import { useRef } from "react"
import { usePlane } from "@react-three/cannon"

export function Floor() {

  const [ref, api] = usePlane(() => ({
    type: "Static",
    args: [1000, 1000, 256, 256],
    rotation: [-Math.PI/2,0,0]
  }), useRef())

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1000,1000]}/>
      <meshNormalMaterial/>
    </mesh>
  )
}