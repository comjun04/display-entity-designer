import {
  Grid,
  Helper,
  PerspectiveCamera,
  TransformControls,
} from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import {
  BoxHelper,
  Color,
  Euler,
  Event,
  Group,
  Quaternion,
  Vector3,
} from 'three'
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
    batchSetEntityTransformation,
    deleteEntity,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      entityIds: state.entityIds,
      selectedEntityIds: state.selectedEntityIds,
      setSelected: state.setSelected,
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
  const { mode, setMode, setUsingTransformControl } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
      setUsingTransformControl: state.setUsingTransformControl,
    })),
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

  const baseEntityGroupRef = useRef<Group>(null)
  const selectedEntityGroupRef = useRef<Group>(null)
  const selectedEntityGroupPrevData = useRef({
    position: new Vector3(0, 0, 0),
    rotation: new Euler(0, 0, 0),
    scale: new Vector3(1, 1, 1),
  })

  useEffect(() => {
    if (firstSelectedEntityId != null && firstSelectedEntityRef != null) {
      selectedEntityGroupRef.current?.position.copy(
        firstSelectedEntityRef.objectRef.current.position,
      )
      selectedEntityGroupPrevData.current.position.copy(
        firstSelectedEntityRef.objectRef.current.position,
      )

      selectedEntityGroupRef.current?.scale.set(1, 1, 1)
      selectedEntityGroupPrevData.current.scale.set(1, 1, 1)

      selectedEntityGroupRef.current?.rotation.set(0, 0, 0)
      selectedEntityGroupPrevData.current.rotation.set(0, 0, 0)
    }
  }, [firstSelectedEntityId, firstSelectedEntityRef])

  // re-parenting
  useEffect(() => {
    if (
      baseEntityGroupRef.current == null ||
      selectedEntityGroupRef.current == null
    ) {
      return
    }

    for (const entityId of entityIds) {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)
      if (refData == null || refData.objectRef.current == null) continue

      if (selectedEntityIds.includes(entityId)) {
        // 해당 엔티티가 selected되었으면 별도 group에 넣기
        if (
          refData.objectRef.current.parent?.id !==
          selectedEntityGroupRef.current.id
        ) {
          console.warn(
            'reparenting before',
            refData.objectRef.current.scale,
            selectedEntityGroupRef.current.scale,
          )
          selectedEntityGroupRef.current.attach(refData.objectRef.current)
          console.warn(
            'reparenting after',
            refData.objectRef.current.scale,
            selectedEntityGroupRef.current.scale,
          )
        }
      } else {
        // 해당 엔티티가 selected되어있지 않으면 원래 그룹으로 되돌리기
        if (
          refData.objectRef.current.parent?.id !== baseEntityGroupRef.current.id
        ) {
          console.warn(
            'revert reparenting before',
            refData.objectRef.current.scale,
            selectedEntityGroupRef.current.scale,
          )
          baseEntityGroupRef.current.attach(refData.objectRef.current)
          console.warn(
            'revert reparenting after',
            refData.objectRef.current.scale,
            selectedEntityGroupRef.current.scale,
          )
        }
      }
    }
  }, [entityIds, selectedEntityIds])

  return (
    <Canvas
      scene={{
        background: new Color(0x222222),
      }}
      onPointerMissed={() => {
        setSelected([])
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

      <group ref={baseEntityGroupRef}>
        {entityIds.map((id) => (
          <DisplayEntity key={id} id={id} />
        ))}
      </group>

      <group ref={selectedEntityGroupRef}>
        {selectedEntityIds.length > 0 && (
          <Helper type={BoxHelper} args={['white']} />
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
        onMouseDown={() => {
          setUsingTransformControl(true)
        }}
        onMouseUp={() => {
          setUsingTransformControl(false)
        }}
        onObjectChange={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target
          const entities = useDisplayEntityStore.getState().entities

          // console.log(performance.now(), target.object.position)

          // ==========

          if (mode === 'translate') {
            const positionDelta = target.object.position
              .clone()
              .sub(selectedEntityGroupPrevData.current.position)
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const newPosition = new Vector3()
                  .setX(entity.position[0] + positionDelta.x)
                  .setY(entity.position[1] + positionDelta.y)
                  .setZ(entity.position[2] + positionDelta.z)

                return {
                  id: entity.id,
                  translation: newPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)

            selectedEntityGroupPrevData.current.position.copy(
              target.object.position,
            )
          } else if (mode === 'rotate') {
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const refData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)!

                const newTranslation = new Vector3()
                refData.objectRef.current.getWorldPosition(newTranslation)

                const newRotationQ = new Quaternion()
                refData.objectRef.current.getWorldQuaternion(newRotationQ)
                const newRotationE = new Euler()
                  .setFromQuaternion(newRotationQ)
                  .toArray()
                  .slice(0, 3) as [number, number, number]

                return {
                  id: entity.id,
                  rotation: newRotationE,
                  translation: newTranslation.toArray(),
                }
              })

            batchSetEntityTransformation(batchUpdateData)

            selectedEntityGroupPrevData.current.rotation.copy(
              target.object.rotation,
            )
          } else if (mode === 'scale') {
            const scale = target.object.scale.toArray().map(Math.abs) as [
              number,
              number,
              number,
            ]

            // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
            target.object.scale.fromArray(scale)

            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const newScale = [
                  (entity.size[0] /
                    selectedEntityGroupPrevData.current.scale.x) *
                    target.object.scale.x,
                  (entity.size[1] /
                    selectedEntityGroupPrevData.current.scale.y) *
                    target.object.scale.y,
                  (entity.size[2] /
                    selectedEntityGroupPrevData.current.scale.z) *
                    target.object.scale.z,
                ] satisfies [number, number, number]

                // group scale이 처음 크기로 돌아간 후 display entity의 scale이 변경될 경우 한 번 깜빡이는 현상이 발생함
                // 이를 방지하기 위해 state로 설정하기 전에 scale을 여기서 먼저 조정
                // const entityRefData = useEntityRefStore
                //   .getState()
                //   .entityRefs.find((d) => d.id === entity.id)
                // entityRefData?.objectRef.current.scale.copy(newScale)

                // 다중 선택되어 있을 경우 그룹 중심점과 떨어져 있는 object들은 scale 시 위치가 달라짐
                // 따라서 world location을 별도로 계산하여 state에 반영
                const refData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)
                const updatedPosition = refData!.objectRef.current.localToWorld(
                  new Vector3(0, 0, 0),
                )

                return {
                  id: entity.id,
                  scale: newScale,
                  translation: updatedPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)

            selectedEntityGroupPrevData.current.scale.copy(target.object.scale)

            // 이동 후 group scale을 처음 크기로 다시 변경
            // 이렇게 해야 다음번 이동을 제대로 측정할 수 있음
            // target.object.scale.set(1, 1, 1)
          }
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
