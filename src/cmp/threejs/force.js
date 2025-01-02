import { useFrame } from "@react-three/fiber"
import { useRapier } from "@react-three/rapier"

export default function Force({ leva }) {

  const { world } = useRapier()

  useFrame(() => {
    world.forEachActiveRigidBody(( body ) => {
      const pos = body.translation()
      const dir = { x: leva.target.x - pos.x, y: leva.target.y - pos.y, z: leva.target.z - pos.z, }
      const len = Math.sqrt( dir.x ** 2 + dir.y ** 2 + dir.z ** 2 )
      const normal = { x: dir.x / len, y: dir.y / len, z: dir.z / len }

      body.applyImpulse({ x: normal.x * leva.power, y: normal.y * leva.power, z: normal.z * leva.power }, true )
    })
  })
  return null
}