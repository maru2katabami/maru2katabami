import { useRef, useEffect, forwardRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useBox, useCompoundBody, useRaycastVehicle } from "@react-three/cannon"
import { MathUtils } from "three"
import { useControls } from "@/hook/useControls"

const Wheel = forwardRef(({ leftSide, radius = 0.7, ...props }, ref) => {
  const { scene } = useGLTF("/wheel.glb")
  useCompoundBody(() => ({
    collisionFilterGroup: 0,
    mass: 1,
    shapes: [{ args: [radius, radius, 0.3, 32], rotation: [0, 0, -Math.PI / 2], type: "Cylinder" }],
    type: "Kinematic",
    ...props,
  }), ref)
  return (
    <group ref={ref}>
      <group rotation={[0, 0, (leftSide ? 1 : -1) * Math.PI / 2]}>
        <primitive object={ scene.clone() }/>
      </group>
    </group>
  )
})
Wheel.displayName = "Wheel"

// メイン車両コンポーネント
export function Vehicle({
  width = 1.2,
  front = 1.2,
  back = -1.2,
  height = 0.1,
  radius = 0.35,
  force = 50,
  steer = 0.7,
  maxBrake = 30,
  setTarget,
}) {
  const wheelRefs = [useRef(), useRef(), useRef(), useRef()]
  const velocity = useRef([0, 0, 0])
  const steeringValue = useRef(0)
  const controls = useControls()

  const { nodes } = useGLTF("/m2k.glb")

  const baseWheelInfo = {
    axleLocal: [-1, 0, 0],
    customSlidingRotationalSpeed: -100,
    dampingCompression: 4.4,
    dampingRelaxation: 10,
    directionLocal: [0, -1, 0],
    frictionSlip: 1,
    maxSuspensionForce: 1e4,
    maxSuspensionTravel: 1,
    radius,
    suspensionRestLength: 0.5,
    suspensionStiffness: 30,
    useCustomSlidingRotationalSpeed: true,
  }
  const wheelInfos = [
    { ...baseWheelInfo, chassisConnectionPointLocal: [-width / 2, height, front], isFrontWheel: true },
    { ...baseWheelInfo, chassisConnectionPointLocal: [ width / 2, height, front], isFrontWheel: true },
    { ...baseWheelInfo, chassisConnectionPointLocal: [-width / 2, height, back ], isFrontWheel: false },
    { ...baseWheelInfo, chassisConnectionPointLocal: [ width / 2, height, back ], isFrontWheel: false },
  ]

  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    angularVelocity: [0, 0, 0],
    args: [1, 1, 2],
    mass: 10,
    position: [0, 2, 0],
  }))

  const [vehicle, vehicleApi] = useRaycastVehicle(() => ({
    chassisBody,
    wheelInfos,
    wheels: wheelRefs,
  }))

  useEffect(() => {
    chassisApi.position.subscribe(p => { setTarget([...p])})
    chassisApi.velocity.subscribe(v => { velocity.current = v })
  }, [chassisBody.current])

  useFrame((_, delta) => {

    const [vx, , vz] = velocity.current
    const speed = Math.sqrt(vx * vx + vz * vz)
    nodes.fan.rotation.y += speed * delta
    const { forward, backward, left, right, brake, reset, jump } = controls.current
    // エンジン力
    for (let i = 0; i < 4; i++) {
      const dir = forward && !backward ? -1 : backward && !forward ? 1 : 0
      vehicleApi.applyEngineForce(dir * force, i)
    }

    const targetSteer = (left && !right ? 1 : right && !left ? -1 : 0) * steer
    // lerp 係数は delta 秒あたりの速度。数値 (例: 5) はお好みで調整可能
    steeringValue.current = MathUtils.lerp(
      steeringValue.current,
      targetSteer,
      delta * 3
    )
    // フロントホイール（インデックス 0,1）に反映
    for (let i = 0; i < 2; i++) {
      vehicleApi.setSteeringValue(steeringValue.current, i)
    }
    // ブレーキ
    for (let i = 0; i < 4; i++) {
      vehicleApi.setBrake(brake ? maxBrake : 0, i)
    }

    if (jump) {
      chassisApi.applyForce([0,1000,0], [0,-1,0])
    }

    if (reset) {
      chassisApi.applyForce([60,1000,0], [0,-1,0])
    }
  })

  return (
    <group ref={vehicle}>
      <mesh ref={chassisBody}>
        <group position={[0, -0.6, 0]}>
          <primitive object={ nodes.Scene }/>
        </group>
      </mesh>
      {wheelRefs.map((ref, idx) => (
        <Wheel key={idx} ref={ref} radius={radius} leftSide={idx % 2 === 0} />
      ))}
    </group>
  )
}