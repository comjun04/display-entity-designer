import { CameraControls, Grid } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Color } from 'three'
import Box from './components/canvas/Box'
import { useDisplayEntityStore } from './store'
import { useShallow } from 'zustand/shallow'

const Scene: FC = () => {
  const { entities } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
    })),
  )

  return (
    <Canvas
      scene={{
        background: new Color(0x333333),
      }}
      camera={{
        position: [3, 3, 3],
        // rotation: [0.0, Math.PI / 4, 0],
      }}
    >
      {/* Axis lines */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-100, 0, 0, 100, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xff0000} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -100, 0, 0, 100, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x00ff00} />
      </line>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, -100, 0, 0, 100])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x0000ff} />
      </line>

      {entities.map((entity) => (
        <Box key={entity.id} size={entity.size} position={entity.location} />
      ))}

      <Grid
        cellSize={1}
        cellColor={0xffffff}
        sectionColor={0x0}
        sectionSize={5}
        infiniteGrid
      />

      <CameraControls
        makeDefault
        smoothTime={0}
        draggingSmoothTime={0.025}
        maxZoom={1}
      />
    </Canvas>
  )
}

export default Scene
