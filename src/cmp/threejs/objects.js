import { useEffect, useRef, useState } from "react"
import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"

export default function Objects() {

  const { nodes } = useGLTF("/m2k.glb")

  const counts = useRef({})
  const [ types, setTypes ] = useState( Object.fromEntries( Object.keys( nodes ).map(( key ) => [ key, "fixed"])))
  const [ colors, setColors ] = useState( Object.fromEntries( Object.keys( nodes ).map(( key ) => [ key, "white"])))

  const handleCollision = ( key ) => {
    counts.current[ key ] = ( counts.current[ key ] || 0) + 1
    if ( counts.current[ key ] >= 3 && types[ key ] !== "dynamic") setTypes(( prev ) => ({ ...prev, [key]: "dynamic"}))
    const newColor = counts.current[ key ] >= 3 ? "red" : counts.current[ key ] === 2 ? "yellow": counts.current[ key ] === 1 ? "gray": "white"
    setColors(( prev ) => ({ ...prev, [ key ]: newColor }))
  }

  return (
    <group>
      <RigidBody type="fixed" colliders="ball">
        <primitive object={ nodes.glass }/>
      </RigidBody>
      { Object.entries( nodes ).map(([ key, node ]) => {
        if (!node.name.includes("m2k")) return null
        return (
          <RigidBody key={ key } type={ types[ key ]} colliders="hull" onCollisionEnter={() => handleCollision( key )}>
            <mesh geometry={ node.geometry }>
              <meshStandardMaterial color={ colors[ key ]}/>
            </mesh>
          </RigidBody>
        )
      })}
    </group>
  )
}
