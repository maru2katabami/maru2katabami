import { useState } from "react"
import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"

export default function Objects() {

  const { nodes } = useGLTF("/m2k.glb")
  const [ nodeStates, setNodeStates ] = useState(
    Object.fromEntries(
      Object.entries( nodes )
        .filter(([ _, node ]) => node.name.includes("m2k"))
        .map(([ key ]) => [ key, { count: 0, type: "fixed", color: "white"}])
  ))

  const handleCollision = ( key ) => {
    setNodeStates(( prev ) => {
      const prevState = prev[ key ]
      const newCount = prevState.count + 1
      const newType = newCount >= 3 ? "dynamic": "fixed"
      const newColor = newCount >= 3 ? "red": newCount === 2 ? "yellow": newCount === 1 ? "gray": "white"
      return { ...prev, [ key ]: { count: newCount, type: newType, color: newColor }}
    })
  }

  return (
    <group>
      <RigidBody type="fixed" colliders="ball">
        <primitive object={ nodes.glass }/>
      </RigidBody>
      { Object.entries( nodes ).map(([ key, node ]) => {
        if ( !node.name.includes("m2k")) return null
        const { type, color } = nodeStates[ key ]
        return (
          <RigidBody key={ key } type={ type } colliders="hull" onCollisionEnter={() => handleCollision( key )}>
            <mesh geometry={ node.geometry }>
              <meshStandardMaterial color={ color }/>
            </mesh>
          </RigidBody>
        )
      })}
    </group>
  )
}