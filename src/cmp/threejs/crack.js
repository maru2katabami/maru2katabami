import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { useRef } from "react"

export default function Crack({ leva }) {
  const { nodes } = useGLTF("/glb/m2k.glb")
  const state = useRef({})

  const initializeState = (key) => {
    if (!state.current[key]) {
      state.current[key] = { count: 0, type: "fixed" }
    }
    return state.current[key]
  }

  return Object.keys(nodes).map((key) => {
    const node = nodes[key]
    if (!node.isMesh) return null

    const handleCollision = () => {
      const currentState = initializeState(key)
      currentState.count += 1
      if (currentState.count >= 3) {
        currentState.type = "dynamic"
      }
    }

    return (
      <RigidBody key={key} type={initializeState(key).type} colliders="hull" onCollisionEnter={handleCollision}>
        <mesh geometry={node.geometry}>
          <meshNormalMaterial />
        </mesh>
      </RigidBody>
    )
  })
}
