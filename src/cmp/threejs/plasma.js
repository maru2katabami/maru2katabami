import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, Curve, TubeGeometry, CircleGeometry, DoubleSide } from "three"

export default function Plasma({ numLines = 14, radius = 14 }) {
  const linesRef = useRef(
    Array( numLines )
      .fill()
      .map(() => ({
        speed: 0.005 + Math.random() * 0.005,
        targetSpeed: 0.005,
        waveFrequency: 1 + Math.random() * 10,
        targetWaveFrequency: 10,
        waveAmplitude: 0.1 + Math.random() * 0.5,
        targetWaveAmplitude: 0.5,
        phi: Math.random() * Math.PI * 2,
        theta: Math.random() * Math.PI,
      }))
  )

  const meshRefs = useRef([])

  const geometries = useMemo(() => Array( numLines ).fill(null).map(() => new TubeGeometry()), [ numLines ])

  useEffect(() => {
    const intervals = linesRef.current.map(( line ) =>
      setInterval(() => {
        line.targetSpeed = 0.005 + Math.random() * 0.005
        line.targetWaveFrequency = 1 + Math.random() * 10
        line.targetWaveAmplitude = 0.1 + Math.random() * 0.5
      }, 3000 + Math.random() * 3000 )
    )
    return () => intervals.forEach( clearInterval )
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    linesRef.current.forEach(( line, i ) => {
      line.speed += ( line.targetSpeed - line.speed ) * 0.05
      line.waveFrequency += ( line.targetWaveFrequency - line.waveFrequency ) * 0.05
      line.waveAmplitude += ( line.targetWaveAmplitude - line.waveAmplitude ) * 0.05
      line.phi += line.speed * Math.sin( t * 0.5 )
      line.theta += line.speed * Math.cos( t * 0.5 )

      const [ x, y, z ] = [
        radius * Math.sin( line.theta ) * Math.cos( line.phi ),
        radius * Math.sin( line.theta ) * Math.sin( line.phi ),
        radius * Math.cos( line.theta )
      ]

      const curve = new Curve()
      curve.getPoint = ( u ) =>
        new Vector3( 0, 0, 0 )
          .lerp( new Vector3( x, y, z ), u )
          .add(
            new Vector3(
              Math.sin( u * line.waveFrequency + t ) * line.waveAmplitude * ( 1 - u ),
              Math.cos( u * line.waveFrequency + t ) * line.waveAmplitude * ( 1 - u ),
              Math.sin( u * line.waveFrequency * 1.5 + t ) * line.waveAmplitude * ( 1 - u )
            )
          )

      geometries[ i ].copy( new TubeGeometry( curve, 64, 0.05, 8, false ))

      const mesh = meshRefs.current[ i ]
      if ( mesh ) {
        mesh.lineMesh.geometry = geometries[ i ]
        mesh.circleMesh.position.set( x, y, z )
        mesh.circleMesh.lookAt( new Vector3( x, y, z ).normalize().multiplyScalar( radius + 1 ))
      }
    })
  })

  return (
    <group>
      <mesh>
        <sphereGeometry args={[ 1 ]}/>
        <meshStandardMaterial color="red" metalness={ 0.9 } roughness={ 0.1 }/>
      </mesh>
    { Array( numLines ).fill().map(( _, i ) => (
      <group key={ i }>
        <mesh ref={( ref ) => ( meshRefs.current[ i ] = { ...meshRefs.current[ i ], lineMesh: ref })} geometry={ geometries[ i ]}>
          <meshNormalMaterial/>
        </mesh>
        <mesh ref={( ref ) => ( meshRefs.current[ i ] = { ...meshRefs.current[ i ], circleMesh: ref })} geometry={ useMemo(() => new CircleGeometry( 0.3, 32 ), [])}>
          <meshStandardMaterial color="red" transparent opacity={ 0.5 } side={ DoubleSide }/>
        </mesh>
      </group>
    ))}
    </group>
  )
}
