import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { useRef, useState } from "react"

export default function Crack({ leva }) {
  const { nodes } = useGLTF("/glb/m2k.glb")
  const counts = useRef({})
  const [ types, setTypes ] = useState( Object.fromEntries( Object.keys( nodes ).map(( key ) => [ key, "fixed"])))

  const handleCollision = ( key ) => {
    counts.current[ key ] = ( counts.current[ key ] || 0 ) + 1
    if ( counts.current[ key ] >= 3 && types[ key ] !== "dynamic") {
      setTypes(( prev ) => ({ ...prev, [ key ]: "dynamic"}))
    }
  }

  return Object.entries( nodes ).map(([ key, node ]) => {
    if ( !node.isMesh ) return null
    return (
      <RigidBody key={ key } type={ types[ key ]} colliders="hull" onCollisionEnter={() => handleCollision( key )}>
        <mesh geometry={ node.geometry }>
          <meshNormalMaterial/>
        </mesh>
      </RigidBody>
    )
  })
}
