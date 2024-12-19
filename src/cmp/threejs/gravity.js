import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, useRapier } from "@react-three/rapier"

export default function Gravity({ target, power }) {

  const { world } = useRapier()
  const vec3 = { x: target[0], y: target[1], z: target[2] }

  useFrame(() => {
    world.forEachActiveRigidBody(( body ) => {
      const pos = body.translation()
      const dir = { x: vec3.x - pos.x, y: vec3.y - pos.y, z: vec3.z - pos.z, }
      const len = Math.sqrt( dir.x ** 2 + dir.y ** 2 + dir.z ** 2 )
      const normal = { x: dir.x / len, y: dir.y / len, z: dir.z / len }

      body.applyImpulse({ x: normal.x * power, y: normal.y * power, z: normal.z * power }, true )
    })
  })
  return null
}