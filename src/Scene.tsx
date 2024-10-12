import { Grid, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Color } from 'three'
import Box from './components/canvas/Box'
import { useDisplayEntityStore } from './store'
import { useShallow } from 'zustand/shallow'
import CustomCameraControls from './CustomCameraControls'

const Scene: FC = () => {
  const { entities, selectedEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
      selectedEntity: state.selectedEntity,
    })),
  )

  return (
    <Canvas
      scene={{
        background: new Color(0x333333),
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

      {entities.map((entity) => {
        return (
          <Box
            key={entity.id}
            id={entity.id}
            size={entity.size}
            position={entity.location}
            object3DRef={entity.objectRef}
          />
        )
      })}

      <TransformControls
        object={
          selectedEntity?.objectRef != null
            ? selectedEntity.objectRef
            : undefined
        }
        // visible={selectedEntity != null} // 왜인지 모르겠는데 작동 안함
        showX={selectedEntity != null}
        showY={selectedEntity != null}
        showZ={selectedEntity != null}
        enabled={selectedEntity != null}
      />

      <PerspectiveCamera makeDefault position={[3, 3, 3]}>
        <pointLight decay={0} intensity={Math.PI} />
        <CustomCameraControls />
      </PerspectiveCamera>

      <Grid
        cellSize={1}
        cellColor={0xffffff}
        sectionColor={0x0}
        sectionSize={5}
        infiniteGrid
      />
    </Canvas>
  )
}

export default Scene
