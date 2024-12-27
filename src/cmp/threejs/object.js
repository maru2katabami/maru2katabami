import { useState, useRef, useMemo, useCallback } from "react"
import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"

export default function Object() {

  const { scene } = useGLTF("/glb/object1.glb")

  const initialObjects = useMemo(() =>
    scene.children
      .filter(( child ) => child.type === "Mesh")
      .map(( child, id ) => ({
        id,
        mesh: child.clone(),
        collisions: 0,
        lastCollisionTime: 0,
      })
  ),[ scene.children ])

  const [ objects, setObjects ] = useState( initialObjects )
  const bodies = useRef({})

  const handleCollision = useCallback(( id ) => {
      setObjects(( objs ) => objs.map(( obj ) => {
        if ( obj.id !== id ) return obj

        const now = Date.now()
        if ( now - obj.lastCollisionTime < 500 ) return obj

        const collisions = obj.collisions + 1
        const newMaterial = obj.mesh.material.clone()

        if ( collisions === 1 ) newMaterial.color.set("#FFAA00")
        if ( collisions === 2 ) newMaterial.color.set("#FF0000")

        obj.mesh.material = newMaterial

        return collisions >= 3 ? null: { ...obj, collisions, lastCollisionTime: now }
      }).filter( Boolean ))

      if ( objects.find(( o ) => o.id === id )?.collisions + 1 >= 3 ) {
        bodies.current[ id ]?.remove()
        delete bodies.current[ id ]
      }
    },[ objects ])

  return (
    <group>
      { objects.map(({ id, mesh }) => (
        <RigidBody
          key={ id }
          type="fixed"
          colliders="trimesh"
          onCollisionEnter={() => handleCollision( id )}
          ref={( ref ) => ref && ( bodies.current[ id ] = ref )}>
          <primitive object={ mesh }/>
        </RigidBody>
      ))}
    </group>
  )
}