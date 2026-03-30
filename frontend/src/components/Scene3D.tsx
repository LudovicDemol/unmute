import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Html, useProgress } from '@react-three/drei'
import { Avatar } from './Avatar'
import { AvatarDecor } from './AvatarDecor'

type Scene3DProps = {
  modelPath: string
}

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="canvas-loader">Chargement {Math.round(progress)}%</div>
    </Html>
  )
}

export default function Scene3D({ modelPath }: Scene3DProps) {
  return (
    <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
      <color attach="background" args={['#0f1015']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 4]} intensity={0.8} castShadow />
      <pointLight position={[-5, 2, -4]} intensity={0.3} />

      <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={45} />
      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} />

      <AvatarDecor />

      <Suspense fallback={<Loader />}>
        <Avatar modelPath={modelPath} />
      </Suspense>
    </Canvas>
  )
}
