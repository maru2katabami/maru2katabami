import React, { useState, useRef, useEffect } from "react"
import { button, useControls } from "leva"
import { useThree } from "@react-three/fiber"
import { RigidBody } from "@react-three/rapier"
import * as THREE from "three"

export const Throw = () => {

  const [ spheres, setSpheres ] = useState([])
  const sphereRefs = useRef([])

  const { shoot, color, power } = useControls("sphere", {
    shoot: false,
    color: "#00FFBB",
    power: { value: 20, min: 1, max: 50, step: 1 },
    reset: button(() => setSpheres([]))
  })

  const { camera, gl } = useThree()
  const raycaster = new THREE.Raycaster()

  const handleClick = event => {
    if ( !shoot ) return
    const mouse = new THREE.Vector2(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1 )

    raycaster.setFromCamera( mouse, camera )

    const initialPosition = camera.position.clone()
    const direction = raycaster.ray.direction.clone().normalize()

    const newSphereRef = React.createRef()
    sphereRefs.current.push( newSphereRef )

    setSpheres( current => [ ...current, { ref: newSphereRef, position: initialPosition, velocity: direction.multiplyScalar( power )}])
  }

  useEffect(() => {
    gl.domElement.addEventListener("click", handleClick )
    return () => gl.domElement.removeEventListener("click", handleClick )
  }, [ gl, shoot, power ])

  return (
    spheres.map(( sphere, index ) => (
      <RigidBody
        ref={ sphere.ref }
        colliders="ball"
        position={ sphere.position }
        linearVelocity={ sphere.velocity }
        key={ index }>
        <mesh>
          <sphereGeometry
            args={[ 1, 32, 32 ]}/>
          <meshStandardMaterial
            color={ color }/>
        </mesh>
      </RigidBody>
    ))
  )
}