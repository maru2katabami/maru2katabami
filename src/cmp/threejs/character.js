import { useGLTF, useKeyboardControls } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { useEffect, useRef, useState } from "react"
import { Vector3, Quaternion } from "three"

export default function Character() {
  const characterRef = useRef()
  const { scene } = useGLTF("/glb/character.glb")
  const [, get] = useKeyboardControls()

  const [rotationOffset, setRotationOffset] = useState(0)

  useEffect(() => {
    if (characterRef.current) {
      const position = characterRef.current.translation()
      console.log(position, characterRef.current)
    }
  }, [])

  useFrame(({ camera }) => {
    if (characterRef.current) {
      const position = characterRef.current.translation()
      const direction = new Vector3().subVectors(new Vector3(0, 0, 0), position).normalize()

      // ベースの回転: キャラクターを中心に向ける
      const baseQuaternion = new Quaternion().setFromUnitVectors(new Vector3(0, -1, 0), direction)

      // キーボード入力による左右回転の更新
      if (get().left) setRotationOffset((prev) => prev + 0.02) // 左回転
      if (get().right) setRotationOffset((prev) => prev - 0.02) // 右回転

      // 回転オフセット: Y軸（上方向）を軸に回転
      const offsetQuaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), rotationOffset)

      // ベースの回転とオフセット回転を合成
      baseQuaternion.multiply(offsetQuaternion)

      // キャラクターの回転を設定
      characterRef.current.setRotation(baseQuaternion)

      // カメラの追従設定
      const localCameraOffset = new Vector3(0, 5, 5)
      const worldCameraOffset = localCameraOffset.applyQuaternion(baseQuaternion)
      const targetPosition = new Vector3().copy(position).add(worldCameraOffset)

      const sphereCenter = new Vector3(0, 0, 0)
      const upVector = new Vector3().subVectors(position, sphereCenter).normalize()
      camera.up.copy(upVector)
      camera.position.lerp(targetPosition, 0.05)
      camera.lookAt(position.x, position.y, position.z)

      // キャラクターの移動設定
      const impulse = new Vector3()
      const forward = new Vector3(0, 0, -1).applyQuaternion(baseQuaternion)
      // const left = new Vector3(-1, 0, 0).applyQuaternion(baseQuaternion )

      if (get().forward) impulse.add(forward)
      if (get().backward) impulse.add(forward.negate())
      // if (get().left ) impulse.add( left )
      // if (get().right ) impulse.add( left.negate())
      if (!impulse.equals(new Vector3(0, 0, 0))) {
        const velocity = characterRef.current.linvel()
        const speed = new Vector3(velocity.x, velocity.y, velocity.z).length()
        if (speed < 5) characterRef.current.applyImpulse(impulse.normalize().multiplyScalar(1))
      }
    }
  })

  return (
    <RigidBody colliders={false} position={[0, 25, 0]} lockRotations ref={characterRef}>
      <primitive object={scene} />
      <CapsuleCollider args={[0.5, 1]} />
    </RigidBody>
  )
}
