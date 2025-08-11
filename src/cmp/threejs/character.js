import { useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { Vector3, Quaternion } from "three"

export const Character = ({ position, args }) => {
  const body = useRef(null)
  const keys = useRef({})
  const grounded = useRef(false)

  const forwardVector = new Vector3()
  const sideVector = new Vector3()
  const upVector = new Vector3(0, 1, 0)

  const jumpStrength = 8
  const moveStrength = 1
  const linearDamp = 4
  const angularDamp = 4

  useEffect(() => {
    const handleKey = (e) => {
      if (["KeyW", "KeyA", "KeyS", "KeyD", "Space"].includes(e.code)) {
        keys.current[e.code] = e.type === "keydown"
      }
    }
    window.addEventListener("keydown", handleKey)
    window.addEventListener("keyup", handleKey)
    return () => {
      window.removeEventListener("keydown", handleKey)
      window.removeEventListener("keyup", handleKey)
    }
  }, [])

  const { camera } = useThree()

  useFrame((_, delta) => {
    if (!body.current) return

    camera.getWorldDirection(forwardVector)
    forwardVector.y = 0
    forwardVector.normalize()
    sideVector.crossVectors(forwardVector, upVector).normalize()

    const impulse = new Vector3()
    if (keys.current["KeyW"]) impulse.add(forwardVector.clone().multiplyScalar(moveStrength))
    if (keys.current["KeyS"]) impulse.add(forwardVector.clone().multiplyScalar(-moveStrength))
    if (keys.current["KeyA"]) impulse.add(sideVector.clone().multiplyScalar(-moveStrength))
    if (keys.current["KeyD"]) impulse.add(sideVector.clone().multiplyScalar(moveStrength))

    if (impulse.lengthSq() > 0) {
      body.current.applyImpulse({ x: impulse.x, y: 0, z: impulse.z }, true)
    }

    if (keys.current["Space"] && grounded.current) {
      body.current.applyImpulse({ x: 0, y: jumpStrength, z: 0 }, true)
      keys.current["Space"] = false
    }

    if (!grounded.current) {
      const vel = body.current.linvel()
      body.current.setLinvel({
        x: vel.x * Math.exp(-linearDamp * delta),
        y: vel.y,
        z: vel.z * Math.exp(-linearDamp * delta),
      }, true)

      const ang = body.current.angvel()
      body.current.setAngvel(
        {
          x: ang.x * Math.exp(-angularDamp * delta),
          y: ang.y * Math.exp(-angularDamp * delta),
          z: ang.z * Math.exp(-angularDamp * delta),
        },
        true
      )
    }
  })

  return (
    <RigidBody
      ref={ body }
      type="dynamic"
      colliders={ false }
      lockRotations
      position={ position }
      restitution={ 1 }
      friction={ 4 }
      onCollisionEnter={() => { grounded.current = true }}
      onCollisionExit={() => { grounded.current = false }}>
      <CapsuleCollider args={[.5, .5]}/>
      <mesh castShadow>
        <capsuleGeometry args={[.5, 1, 16, 32]}/>
        <meshStandardMaterial color="white"/>
      </mesh>
    </RigidBody>
  )
}