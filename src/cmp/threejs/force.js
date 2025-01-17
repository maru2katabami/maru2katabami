import { useFrame } from "@react-three/fiber"
import { useRapier } from "@react-three/rapier"

export default function Force() {

  const { world } = useRapier()

  useFrame(() => {
    world.forEachActiveRigidBody(( body ) => {
      const pos = body.translation()
      const dir = { x: 0 - pos.x, y: 0 - pos.y, z: 0 - pos.z, }
      const len = Math.sqrt( dir.x ** 2 + dir.y ** 2 + dir.z ** 2 )
      const normal = { x: dir.x / len, y: dir.y / len, z: dir.z / len }

      body.applyImpulse({ x: normal.x, y: normal.y, z: normal.z }, true )
    })
  })
  return null
}