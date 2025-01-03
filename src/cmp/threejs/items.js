import { useEffect } from "react"
import { useCryptoTicker } from "@/hooks"
import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"

export default function Items() {

  const tickerTexture = useCryptoTicker()

  const { scene, materials } = useGLTF("/glb/object.glb")

  useEffect(() => {
    materials.texture.map = tickerTexture
  }, [])

  return (
    <RigidBody type="kinematicPosition" colliders="trimesh">
      <primitive object={ scene }/>
    </RigidBody>
  )
}