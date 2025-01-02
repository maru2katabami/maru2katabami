import { useEffect, useRef } from "react"
import { useCryptoTicker } from "@/hooks"
import { useGLTF } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"
import { useFrame } from "@react-three/fiber"
import { Vector2, Vector3, TextureLoader } from "three"

export default function Items() {

  const tickerTexture = useCryptoTicker()

  const { scene, materials } = useGLTF("/glb/object.glb")

  useEffect(() => {
    materials.texture.map = tickerTexture
    materials.sphere = <PlasmaMaterial/>
  }, [])

  return (
    <RigidBody type="kinematicPosition" colliders="trimesh">
      <primitive object={ scene }/>
    </RigidBody>
  )
}

const PlasmaMaterial = () => {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = state.clock.getElapsedTime();
      const { width, height } = state.gl.domElement;
      materialRef.current.uniforms.iResolution.value.set(width, height, 1);
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      attach="material"
      uniforms={{
        iResolution: { value: new Vector3() },
        iTime: { value: 0 },
        iMouse: { value: new Vector2() },
        iChannel0: {
          value: new TextureLoader().load("/path-to-your-noise-texture.png"),
        },
      }}
      vertexShader={`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        #define NUM_RAYS 13.
        #define VOLUMETRIC_STEPS 19
        #define MAX_ITER 35
        #define FAR 6.
        #define time iTime*1.1

        mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,-s,s,c);}
        float noise( in float x ){return textureLod(iChannel0, vec2(x*.01,1.),0.0).x;}

        // (Insert the rest of your fragment shader code here)

        void main() {
          vec2 p = gl_FragCoord.xy / iResolution.xy - 0.5;
          // (Copy your mainImage logic here)
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Replace with the logic from mainImage
        }
      `}
    />
  );
};