import {
  Grid,
  Helper,
  PerspectiveCamera,
  TransformControls,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import { BoxHelper, Color, Event, Group } from 'three'
import { useDialogStore } from './stores/dialogStore'
import { useEditorStore } from './stores/editorStore'
import { useEntityRefStore } from './stores/entityRefStore'
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
    // setEntityTranslation,
    // setEntityRotation,
    // setEntityScale,
    batchSetEntityTransformation,
    deleteEntity,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      entityIds: state.entityIds,
      selectedEntityIds: state.selectedEntityIds,
      setSelected: state.setSelected,
      // setEntityTranslation: state.setEntityTranslation,
      // setEntityRotation: state.setEntityRotation,
      // setEntityScale: state.setEntityScale,
      batchSetEntityTransformation: state.batchSetEntityTransformation,
      deleteEntity: state.deleteEntity,
    })),
  )

  // temporary
  const firstSelectedEntityId =
    selectedEntityIds.length > 0 ? selectedEntityIds[0] : null

  const { firstSelectedEntityRef } = useEntityRefStore(
    useShallow((state) => ({
      firstSelectedEntityRef:
        firstSelectedEntityId != null
          ? state.entityRefs.find((d) => d.id === firstSelectedEntityId)
          : undefined,
    })),
  )
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

  const selectedEntityGroupRef = useRef<Group>(null)

  useEffect(() => {
    if (firstSelectedEntityId != null && firstSelectedEntityRef != null) {
      selectedEntityGroupRef.current?.position.copy(
        firstSelectedEntityRef.objectRef.current.position,
      )
      // selectedEntityGroupRef.current?.scale.copy(
      //   firstSelectedEntityRef.objectRef.current.scale,
      // )
    }
  }, [firstSelectedEntityId, firstSelectedEntityRef])

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

      {entityIds
        .filter((entityId) => !selectedEntityIds.includes(entityId))
        .map((id) => (
          <DisplayEntity key={id} id={id} />
        ))}

      <group ref={selectedEntityGroupRef}>
        {selectedEntityIds.map((id) => (
          <DisplayEntity key={id} id={id} />
        ))}

        {selectedEntityIds.length > 0 && (
          <Helper type={BoxHelper} args={['gold']} />
        )}
      </group>

      <TransformControls
        object={
          (selectedEntityGroupRef as MutableRefObject<Group> | null) ??
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
        onMouseUp={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target
          const entities = useDisplayEntityStore.getState().entities
          const firstSelectedEntity = entities.find(
            (e) => e.id === firstSelectedEntityId,
          )!

          if (mode === 'translate') {
            const positionDelta = target.object.position
              .clone()
              .setX(target.object.position.x - firstSelectedEntity.position[0])
              .setY(target.object.position.y - firstSelectedEntity.position[1])
              .setZ(target.object.position.z - firstSelectedEntity.position[2])
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const newPosition = positionDelta
                  .clone()
                  .setX(entity.position[0] + positionDelta.x)
                  .setY(entity.position[1] + positionDelta.y)
                  .setZ(entity.position[2] + positionDelta.z)

                return {
                  id: entity.id,
                  translation: newPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'rotate') {
            const rotationDelta = [
              target.object.rotation.x - firstSelectedEntity.rotation[0],
              target.object.rotation.y - firstSelectedEntity.rotation[1],
              target.object.rotation.z - firstSelectedEntity.rotation[2],
            ] satisfies [number, number, number]
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const newRotation = [
                  entity.rotation[0] + rotationDelta[0],
                  entity.rotation[1] + rotationDelta[1],
                  entity.rotation[2] + rotationDelta[2],
                ] satisfies [number, number, number]
                return {
                  id: entity.id,
                  rotation: newRotation,
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'scale') {
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const newScale = target.object.scale
                  .clone()
                  .setX(entity.size[0] * target.object.scale.x)
                  .setY(entity.size[1] * target.object.scale.y)
                  .setZ(entity.size[2] * target.object.scale.z)

                // group scale이 처음 크기로 돌아간 후 display entity의 scale이 변경될 경우 한 번 깜빡이는 현상이 발생함
                // 이를 방지하기 위해 state로 설정하기 전에 scale을 여기서 먼저 조정
                const entityRefData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)
                entityRefData?.objectRef.current.scale.copy(newScale)

                return {
                  id: entity.id,
                  scale: newScale.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)

            // 이동 후 group scale을 처음 크기로 다시 변경
            // 이렇게 해야 다음번 이동을 제대로 측정할 수 있음
            target.object.scale.set(1, 1, 1)
          }
        }}
        onObjectChange={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target

          const scale = target.object.scale.toArray().map(Math.abs) as [
            number,
            number,
            number,
          ]

          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(scale)
          // setEntityScale(firstSelectedEntityId!, scale) // 그 이후에 state 조작
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
