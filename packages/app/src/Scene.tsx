import { Grid, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, useEffect, useState } from 'react'
import { Color, Event } from 'three'
import { useDialogStore } from './stores/dialogStore'
import { useEditorStore } from './stores/editorStore'
// import { useEntityRefStore } from './stores/entityRefStore'
import { useDisplayEntityStore } from './stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import CustomCameraControls from './CustomCameraControls'
import { TransformControls as OriginalTransformControls } from 'three/examples/jsm/Addons.js'
import DisplayEntity from './components/canvas/DisplayEntity'

const Scene: FC = () => {
  const {
    entityIds,
    selectedEntityIds,
    setSelected,
    setEntityTranslation,
    setEntityRotation,
    setEntityScale,
    deleteEntity,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      entityIds: state.entityIds,
      selectedEntityIds: state.selectedEntityIds,
      setSelected: state.setSelected,
      setEntityTranslation: state.setEntityTranslation,
      setEntityRotation: state.setEntityRotation,
      setEntityScale: state.setEntityScale,
      deleteEntity: state.deleteEntity,
    })),
  )
  // const { entityRefs } = useEntityRefStore(
  //   useShallow((state) => ({
  //     entityRefs: state.entityRefs,
  //   })),
  // )
  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({ mode: state.mode, setMode: state.setMode })),
  )
  const { openedDialog } = useDialogStore(
    useShallow((state) => ({
      openedDialog: state.openedDialog,
    })),
  )

  const [shiftPressed, setShiftPressed] = useState(false)

  useEffect(() => {
    const focusableElements = ['input', 'textarea']
    const handler = (evt: KeyboardEvent) => {
      // <input>이나 <textarea>에 focus가 잡혀 있다면 이벤트를 처리하지 않음
      if (
        focusableElements.includes(
          (document.activeElement?.tagName ?? '').toLowerCase(),
        )
      ) {
        return true
      }

      // dialog 창이 열려 있을 떄는 이벤트를 처리하지 않음
      if (openedDialog != null) {
        return true
      }

      // 단축키 처리
      switch (evt.key) {
        case 't':
          setMode('translate')
          break
        case 'r':
          setMode('rotate')
          break
        case 's':
          setMode('scale')
          break
        case 'Delete':
          selectedEntityIds.forEach(deleteEntity)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setMode, deleteEntity, selectedEntityIds, openedDialog])

  useEffect(() => {
    const handler = (evt: KeyboardEvent) => {
      setShiftPressed(evt.shiftKey)
    }

    document.addEventListener('keydown', handler)
    document.addEventListener('keyup', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      document.removeEventListener('keyup', handler)
    }
  }, [])

  // temporary
  const firstSelectedEntityId =
    selectedEntityIds.length > 0 ? selectedEntityIds[0] : null

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

      {entityIds.map((id) => (
        <DisplayEntity key={id} id={id} />
      ))}

      <TransformControls
        object={
          // entityRefs.find((d) => d.id === selectedEntityId)?.objectRef ?? // TODO
          undefined
        }
        mode={mode}
        translationSnap={shiftPressed ? 0.00125 : 0.0625}
        rotationSnap={Math.PI / 12} // 15도
        scaleSnap={0.0625}
        // visible={selectedEntity != null} // 왜인지 모르겠는데 작동 안함
        showX={selectedEntityIds.length > 0}
        showY={selectedEntityIds.length > 0}
        showZ={selectedEntityIds.length > 0}
        enabled={selectedEntityIds.length > 0}
        onObjectChange={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target
          setEntityTranslation(
            firstSelectedEntityId!,
            target.object.position.toArray(),
          )

          const scale = target.object.scale.toArray().map(Math.abs) as [
            number,
            number,
            number,
          ]

          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(scale)
          setEntityScale(firstSelectedEntityId!, scale) // 그 이후에 state 조작

          const rotation = target.object.rotation
          setEntityRotation(firstSelectedEntityId!, [
            rotation.x,
            rotation.y,
            rotation.z,
          ])
        }}
        onPointerMissed={() => {
          setSelected([])
        }}
      />

      <ambientLight intensity={1.7} color={0xffffff} />
      <directionalLight position={[0, 10, 6]} />
      <directionalLight position={[0, 10, -6]} />

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
