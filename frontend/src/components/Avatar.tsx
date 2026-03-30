import { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

type AvatarProps = {
  modelPath: string
}

export function Avatar({ modelPath }: AvatarProps) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(modelPath, true)

  useFrame(({ clock }) => {
    if (!group.current) return
    const breathing = Math.sin(clock.elapsedTime * 1.2) * 0.02
    group.current.position.y = 1.3 + breathing
  })

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={1.2} position={[0, -2, 2]} />
    </group>
  )
}

