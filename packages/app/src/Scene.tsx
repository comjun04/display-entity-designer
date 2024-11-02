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
  const {
    entities,
    entityRefs,
    selectedEntity,
    setSelected,
    setEntityTranslation,
    setEntityRotation,
    setEntityScale,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
      entityRefs: state.entityRefs,
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
      setEntityTranslation: state.setEntityTranslation,
      setEntityRotation: state.setEntityRotation,
      setEntityScale: state.setEntityScale,
    })),
  )
  const { mode } = useEditorStore(useShallow((state) => ({ mode: state.mode })))

  return (
    <Canvas
      scene={{
        background: new Color(0x222222),
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
            type={entity.type}
            size={entity.size}
            position={entity.position}
            rotation={entity.rotation}
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

          const scale = target.object.scale.toArray().map(Math.abs) as [
            number,
            number,
            number,
          ]

          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(scale)
          setEntityScale(selectedEntity!.id, scale) // 그 이후에 state 조작

          const rotation = target.object.rotation
          setEntityRotation(selectedEntity!.id, [
            rotation.x,
            rotation.y,
            rotation.z,
          ])
        }}
        onPointerMissed={() => {
          setSelected(null)
        }}
      />

      {/* TODO: 마크 클라이언트 렌더링 로직 분석해서 최적의 intensity 값 찾기  */}
      <ambientLight intensity={Math.PI / 2} />

      <PerspectiveCamera makeDefault position={[3, 3, 3]}>
        <CustomCameraControls />
      </PerspectiveCamera>

      <Grid
        cellSize={1 / 16}
        cellColor={0x777777}
        sectionColor={0x333333}
        sectionSize={1}
        infiniteGrid
      />
    </Canvas>
  )
}

export default Scene
