import { useGLTF, useKeyboardControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import { Vector3, Quaternion} from "three"

export default function Character() {

  const characterRef = useRef()

  const { scene } = useGLTF("/glb/character.glb")

  const [ , get ] = useKeyboardControls()
  
  useEffect(() => {
    if (characterRef.current) {
      const position = characterRef.current.translation()
      console.log(position, characterRef.current)
    }
  }, [])

  useFrame(({ camera }) => {
    if ( characterRef.current ) {
      const position = characterRef.current.translation()
      const rotation = characterRef.current.rotation()
      const direction = new Vector3().subVectors( new Vector3( 0, 0, 0 ), position ).normalize()
      const quaternion = new Quaternion().setFromUnitVectors( new Vector3( 0, -1, 0 ), direction )
      characterRef.current.setRotation( quaternion )
  
      const localCameraOffset = new Vector3( 0, 5, 5 )
      const worldCameraOffset = localCameraOffset.applyQuaternion( rotation )
      const targetPosition = new Vector3().copy( position ).add( worldCameraOffset )
  
      const sphereCenter = new Vector3( 0, 0, 0 )
      const upVector = new Vector3().subVectors( position, sphereCenter ).normalize()
      camera.up.copy( upVector )
      camera.position.lerp( targetPosition, 0.05 )
      camera.lookAt( position.x, position.y, position.z )
  
      const impulse = new Vector3()
      const forward = new Vector3(0, 0, -1).applyQuaternion(rotation)
      const left = new Vector3(-1, 0, 0).applyQuaternion(rotation)
  
      if (get().forward) impulse.add(forward)
      if (get().backward) impulse.add(forward.negate())
      if (get().left) impulse.add(left)
      if (get().right) impulse.add(left.negate())
      if (!impulse.equals(new Vector3(0, 0, 0))) {
        const velocity = characterRef.current.linvel()
        const speed = new Vector3(velocity.x, velocity.y, velocity.z).length()
        if (speed < 5) characterRef.current.applyImpulse(impulse.normalize().multiplyScalar(1))
      }
    }
  })
  

  return (
    <RigidBody colliders={ false } position={[0, 25, 0]} lockRotations ref={ characterRef }>
      <primitive object={ scene }/>
      <CapsuleCollider args={[ 0.5, 1 ]}/>
    </RigidBody>
  )
}