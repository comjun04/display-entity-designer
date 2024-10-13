import { Grid, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC } from 'react'
import { Color, Event } from 'three'
import Box from './components/canvas/Box'
import { useDisplayEntityStore, useEditorStore } from './store'
import { useShallow } from 'zustand/shallow'
import CustomCameraControls from './CustomCameraControls'
import { TransformControls as OriginalTransformControls } from 'three/examples/jsm/Addons.js'

const Scene: FC = () => {
  const { entities, entityRefs, selectedEntity, setEntityTranslation } =
    useDisplayEntityStore(
      useShallow((state) => ({
        entities: state.entities,
        entityRefs: state.entityRefs,
        selectedEntity: state.getSelectedEntity(),
        setEntityTranslation: state.setEntityTranslation,
      })),
    )
  const { mode } = useEditorStore(useShallow((state) => ({ mode: state.mode })))

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
        const refData = entityRefs.find((d) => d.id === entity.id)!
        return (
          <Box
            key={entity.id}
            id={entity.id}
            size={entity.size}
            position={entity.position}
            object3DRef={refData.objectRef}
          />
        )
      })}

      <TransformControls
        object={
          entityRefs.find((d) => d.id === selectedEntity?.id)?.objectRef ??
          undefined
        }
        mode={mode}
        translationSnap={0.0625}
        rotationSnap={Math.PI / 12} // 15도
        scaleSnap={0.0625}
        // visible={selectedEntity != null} // 왜인지 모르겠는데 작동 안함
        showX={selectedEntity != null}
        showY={selectedEntity != null}
        showZ={selectedEntity != null}
        enabled={selectedEntity != null}
        onObjectChange={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target
          setEntityTranslation(
            selectedEntity!.id,
            target.object.position.toArray(),
          )
        }}
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
