import { Environment, ContactShadows } from '@react-three/drei'

export function AvatarDecor() {
  return (
    <>
      <Environment preset="city" blur={0.6} />
      <fog attach="fog" args={['#202025', 5, 14]} />
      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.8}
        width={8}
        height={8}
        blur={2.2}
        far={5}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111316" roughness={0.7} metalness={0.15} />
      </mesh>
    </>
  )
}
