import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { useRef, useState } from "react"

export default function Crack({ leva }) {

  const { nodes } = useGLTF("/glb/m2k.glb")
  const counts = useRef({})

  return Object.keys( nodes ).map(( key ) => {
    const node = nodes[ key ]
    if ( !node.isMesh ) return null
    const [ type, setType ] = useState("fixed")

    const handleCollision = () => {
      counts.current[ key ] = ( counts.current[ key ] || 0 ) + 1
      if ( counts.current[ key ] >= 3 ) setType("dynamic")
    }

    return (
      <RigidBody key={ key } type={ type } colliders="hull" onCollisionEnter={ handleCollision }>
        <mesh geometry={ node.geometry }>
          <meshNormalMaterial/>
        </mesh>
      </RigidBody>
    )
  })
}
