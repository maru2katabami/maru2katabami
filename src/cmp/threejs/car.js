import { useEffect, useRef } from 'react'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { M2K } from "./m2k"

export function Car({
  angularVelocity,
  back = -1.15,
  force = 1500,
  front = 1.3,
  height = -0.04,
  maxBrake = 50,
  position,
  radius = 0.7,
  rotation,
  steer = 0.5,
  width = 1.2,
}) {
  const wheels = [useRef(null), useRef(null), useRef(null), useRef(null)]

  const wheelInfo = {
    axleLocal: [-1, 0, 0],
    customSlidingRotationalSpeed: -30,
    dampingCompression: 4.4,
    dampingRelaxation: 10,
    directionLocal: [0, -1, 0],
    frictionSlip: 2,
    maxSuspensionForce: 1e4,
    maxSuspensionTravel: 0.3,
    radius,
    suspensionRestLength: 0.3,
    suspensionStiffness: 30,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfo1 = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo2 = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, front],
    isFrontWheel: true,
  }
  const wheelInfo3 = {
    ...wheelInfo,
    chassisConnectionPointLocal: [-width / 2, height, back],
    isFrontWheel: false,
  }
  const wheelInfo4 = {
    ...wheelInfo,
    chassisConnectionPointLocal: [width / 2, height, back],
    isFrontWheel: false,
  }

  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      angularVelocity,
      args: [1.7, 1, 4],
      mass: 500,
      onCollide: (e) => console.log('bonk', e.body.userData),
      position,
      rotation,
    }),
    useRef(null),
  )

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos: [wheelInfo1, wheelInfo2, wheelInfo3, wheelInfo4],
      wheels,
    }),
    useRef(null),
  )

  useEffect(() => {
    const unsubscribe = vehicleApi.sliding.subscribe((v) => console.log('sliding', v))
    return () => unsubscribe()
  }, [])

  // useFrame(() => {
  //   const { backward, brake, forward, left, reset, right } = controls.current

  //   for (let e = 2; e < 4; e++) {
  //     vehicleApi.applyEngineForce(forward || backward ? force * (forward && !backward ? -1 : 1) : 0, e)
  //   }

  //   for (let s = 0; s < 2; s++) {
  //     vehicleApi.setSteeringValue(left || right ? steer * (left && !right ? 1 : -1) : 0, s)
  //   }

  //   for (let b = 2; b < 4; b++) {
  //     vehicleApi.setBrake(brake ? maxBrake : 0, b)
  //   }

  //   if (reset) {
  //     chassisApi.position.set(...position)
  //     chassisApi.velocity.set(0, 0, 0)
  //     chassisApi.angularVelocity.set(...angularVelocity)
  //     chassisApi.rotation.set(...rotation)
  //   }
  // })

  return (
    <group ref={vehicle} position={[0, -0.4, 0]}>
      <mesh ref={chassisBody}>
        <boxGeometry args={[1.7, 1, 4]}/>
        <meshNormalMaterial/>
      </mesh>
      <M2K ref={wheels[0]} radius={radius} leftSide />
      <M2K ref={wheels[1]} radius={radius} />
      <M2K ref={wheels[2]} radius={radius} leftSide />
      <M2K ref={wheels[3]} radius={radius} />
    </group>
  )
}