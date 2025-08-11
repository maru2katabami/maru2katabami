"use client"

import React, { useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { RigidBody, RigidBodyType } from "@react-three/rapier"

export const Floor = ({ count = 300, size = 1, height = 0.1, gap = 0.01 }) => {
  const directions = useMemo(() => [
    [ 1,  0], [ 0,  1], [-1,  1],
    [-1,  0], [ 0, -1], [ 1, -1],
  ], [])

  const coords = useMemo(() => {
    const arr = [[0, 0]]
    let layer = 1
    while (arr.length < count) {
      let q = 0, r = -layer
      for (let side = 0; side < 6 && arr.length < count; side++) {
        for (let step = 0; step < layer && arr.length < count; step++) {
          arr.push([q, r])
          q += directions[side][0]
          r += directions[side][1]
        }
      }
      layer++
    }
    return arr
  }, [count, directions])

  const positions = useMemo(() => {
    const xSpacing = Math.sqrt(3) * size + gap
    const zSpacing = 1.5 * size + gap
    return coords.map(([q, r]) => [xSpacing * q + (xSpacing / 2) * r, 0, zSpacing * r])
  }, [coords, size, gap])

  const Tile = ({ position }) => {
    const bodyRef = useRef()
    const [hits, setHits] = useState(0)
    const [type, setType] = useState("fixed")

    const fixedColor   = new THREE.Color("lightgray")
    const dynamicColor = new THREE.Color("orange")
    const t = Math.min(hits / 5, 1)
    const currentColor = fixedColor.clone().lerp(dynamicColor, t).getStyle()

    const handleCollision = () => {
      setHits(prev => {
        const next = prev + 1
        if (next === 5) {
          bodyRef.current?.setBodyType("dynamic")
          setType("dynamic")
        }
        return next
      })
    }

    return (
      <RigidBody
        ref={bodyRef}
        type={type}
        colliders="hull"
        onCollisionEnter={handleCollision}>
        <mesh position={position}>
          <cylinderGeometry args={[size, size, height, 6]} />
          <meshStandardMaterial color={currentColor} />
        </mesh>
      </RigidBody>
    )
  }

  return (
    <group>
      { positions.map((pos, i) => (
      <Tile key={ i } position={ pos }/>
      ))}
    </group>
  )
}
