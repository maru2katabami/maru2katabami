import React, { useState, useRef, useEffect, createRef } from "react"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import { Raycaster, Vector2 } from "three"
import { Zustand } from "@/utils/zustand"

export default function Throw() {

  const [ spheres, setSpheres ] = useState([])
  const sphereRefs = useRef([])

  const { shoot } = Zustand()

  const { camera, gl } = useThree()
  const raycaster = new Raycaster()

  const handleClick = event => {
    if ( !shoot ) return
    const mouse = new Vector2(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1 )

    raycaster.setFromCamera( mouse, camera )

    const initialPosition = camera.position.clone()
    const direction = raycaster.ray.direction.clone().normalize()

    const newSphereRef = createRef()
    sphereRefs.current.push( newSphereRef )

    setSpheres( current => [ ...current, { ref: newSphereRef, position: initialPosition, velocity: direction.multiplyScalar( 30 )}])
  }

  useEffect(() => {
    gl.domElement.addEventListener("click", handleClick )
    return () => gl.domElement.removeEventListener("click", handleClick )
  }, [ gl, shoot ])

  return (
    spheres.map(( sphere, index ) => (
      <RigidBody ref={ sphere.ref } colliders="ball" position={ sphere.position } linearVelocity={ sphere.velocity } key={ index }>
        <mesh>
          <sphereGeometry args={[ 1, 32, 32 ]}/>
          <meshStandardMaterial color={"#00FFBB"}/>
        </mesh>
      </RigidBody>
    ))
  )
}