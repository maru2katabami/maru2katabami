import { RigidBody } from "@react-three/rapier"

export default function Object() {
  return (
    <group>
      <RigidBody colliders="ball" position={[ 0, 3, 0 ]}>
        <mesh>
          <sphereGeometry args={[1]}/>
          <meshNormalMaterial/>
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh rotation={[ -Math.PI/2, 0, 0 ]}>
          <planeGeometry args={[ 10, 10 ]}/>
          <meshNormalMaterial/>
        </mesh>
      </RigidBody>
    </group>
  )
}