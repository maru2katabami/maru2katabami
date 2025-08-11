import * as THREE from 'three'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'

export const Shooter = () => {
  const { camera, gl, scene } = useThree()
  const { world, rapier } = useRapier()

  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const bullets = useRef([])
  const sharedGeo = useMemo(() => new THREE.IcosahedronGeometry(.5, 0), [])
  const verts = useMemo(
    () => (sharedGeo.getAttribute('position').array),
    [sharedGeo]
  )

  useFrame(() => {
    for (const { rb, mesh } of bullets.current) {
      const t = rb.translation()
      const r = rb.rotation()
      mesh.position.set(t.x, t.y, t.z)
      mesh.quaternion.set(r.x, r.y, r.z, r.w)
    }
  })

  const shoot = useCallback((e) => {
    const el = gl.domElement
    const rect = el.getBoundingClientRect()
    ndc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    raycaster.setFromCamera(ndc, camera)
    const origin = raycaster.ray.origin
    const dir = raycaster.ray.direction.clone().normalize()

    const rb = world.createRigidBody(
      rapier.RigidBodyDesc.dynamic().setTranslation(origin.x, origin.y, origin.z)
    )
    const hull = rapier.ColliderDesc.convexHull(verts)
      .setRestitution(0.4)
      .setFriction(0.6)
    const col = world.createCollider(hull, rb)

    const mesh = new THREE.Mesh(
      sharedGeo.clone(),
      new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.4 })
    )
    mesh.position.copy(origin)
    scene.add(mesh)
    bullets.current.push({ rb, mesh })

    const speed = 15
    rb.setLinvel({ x: dir.x * speed, y: dir.y * speed, z: dir.z * speed }, true)

    setTimeout(() => {
      scene.remove(mesh)
      mesh.geometry?.dispose()
      ;(mesh.material)?.dispose()
      world.removeCollider(col, true)
      world.removeRigidBody(rb)
      bullets.current = bullets.current.filter((b) => b.rb !== rb)
    }, 5000)
  }, [camera, gl.domElement, ndc, raycaster, rapier, scene, sharedGeo, verts, world])

  useEffect(() => {
    const el = gl.domElement
    el.addEventListener('pointerdown', shoot)
    return () => el.removeEventListener('pointerdown', shoot)
  }, [gl.domElement, shoot])

  return null
}