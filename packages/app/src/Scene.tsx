import { Grid, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import { Color, Euler, Event, Group, Quaternion, Vector3 } from 'three'
import { useDialogStore } from './stores/dialogStore'
import { useEditorStore } from './stores/editorStore'
import { useEntityRefStore } from './stores/entityRefStore'
import { useDisplayEntityStore } from './stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import CustomCameraControls from './CustomCameraControls'
import { TransformControls as OriginalTransformControls } from 'three/examples/jsm/Addons.js'
import DisplayEntity from './components/canvas/DisplayEntity'
import { Number3Tuple } from './types'
import SelectedEntityGroup from './components/SelectedEntityGroup'

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
  const prevFirstSelectedEntityId = useRef<string | null>(null)

  const { firstSelectedEntityRefData: firstSelectedEntityRefData } =
    useEntityRefStore(
      useShallow((state) => ({
        firstSelectedEntityRefData:
          firstSelectedEntityId != null
            ? state.entityRefs.find((d) => d.id === firstSelectedEntityId)
            : undefined,
      })),
    )
  const {
    mode,
    setMode,
    setUsingTransformControl,
    setSelectionBaseTransformation,
  } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
      setUsingTransformControl: state.setUsingTransformControl,
      setSelectionBaseTransformation: state.setSelectionBaseTransformation,
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

  // 선택 해제된 object를 다중선택 그룹에서 빼냄 (world transformation 보존)
  useEffect(() => {
    if (
      baseEntityGroupRef.current == null ||
      selectedEntityGroupRef.current == null
    ) {
      return
    }

    const firstSelectedEntityIdChanged =
      firstSelectedEntityId !== prevFirstSelectedEntityId.current

    for (const entityId of entityIds) {
      if (!firstSelectedEntityIdChanged && selectedEntityIds.includes(entityId))
        continue

      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)
      if (refData == null || refData.objectRef.current == null) continue

      if (
        firstSelectedEntityIdChanged ||
        refData.objectRef.current.parent?.id !== baseEntityGroupRef.current.id
      ) {
        console.debug(
          'revert reparenting before',
          refData.objectRef.current.scale,
          selectedEntityGroupRef.current.scale,
        )
        baseEntityGroupRef.current.attach(refData.objectRef.current)
        console.debug(
          'revert reparenting after',
          refData.objectRef.current.scale,
          selectedEntityGroupRef.current.scale,
        )
      }
    }
  }, [entityIds, selectedEntityIds, firstSelectedEntityId])

  // 다중선택 그룹 위치 이동
  useEffect(() => {
    if (
      firstSelectedEntityId == null ||
      firstSelectedEntityRefData == null ||
      selectedEntityGroupRef.current == null
    )
      return

    // 다중선택 그룹 base position, rotation, scale은 첫 번째 선택한 object를 따라감
    selectedEntityGroupRef.current.position.copy(
      firstSelectedEntityRefData.objectRef.current.position,
    )

    selectedEntityGroupRef.current.rotation.copy(
      firstSelectedEntityRefData.objectRef.current.rotation,
    )

    selectedEntityGroupRef.current.scale.copy(
      firstSelectedEntityRefData.objectRef.current.scale,
    )

    setSelectionBaseTransformation({
      position: firstSelectedEntityRefData.objectRef.current.position.toArray(),
      rotation: firstSelectedEntityRefData.objectRef.current.rotation
        .toArray()
        .slice(0, 3) as Number3Tuple,
      size: firstSelectedEntityRefData.objectRef.current.scale.toArray(),
    })
  }, [
    firstSelectedEntityId,
    firstSelectedEntityRefData,
    setSelectionBaseTransformation,
  ])

  // re-parenting
  // 선택된 object를 다중선택 그룹에 넣기 (world transformation 보존)
  useEffect(() => {
    if (
      baseEntityGroupRef.current == null ||
      selectedEntityGroupRef.current == null
    ) {
      return
    }

    const firstSelectedEntityIdChanged =
      firstSelectedEntityId !== prevFirstSelectedEntityId.current

    for (const entityId of entityIds) {
      if (
        // !firstSelectedEntityIdChanged &&
        !selectedEntityIds.includes(entityId)
      )
        continue

      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)
      if (refData == null || refData.objectRef.current == null) continue

      // 해당 엔티티가 selected되었으면 별도 group에 넣기
      if (
        firstSelectedEntityIdChanged ||
        refData.objectRef.current.parent?.id !==
          selectedEntityGroupRef.current.id
      ) {
        console.debug(
          'reparenting before',
          refData.objectRef.current.scale,
          selectedEntityGroupRef.current.scale,
        )
        selectedEntityGroupRef.current.attach(refData.objectRef.current)
        console.debug(
          'reparenting after',
          refData.objectRef.current.scale,
          selectedEntityGroupRef.current.scale,
        )
      }
    }
  }, [entityIds, selectedEntityIds, firstSelectedEntityId])

  // last
  useEffect(() => {
    prevFirstSelectedEntityId.current = firstSelectedEntityId
  }, [firstSelectedEntityId])

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

      <SelectedEntityGroup groupRef={selectedEntityGroupRef} />

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
        onMouseUp={(e) => {
          setUsingTransformControl(false)

          const target = (e as Event<string, OriginalTransformControls>).target
          const entities = useDisplayEntityStore.getState().entities

          // ==========

          if (mode === 'translate') {
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const entityRefData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)!
                const newPosition = new Vector3()
                entityRefData.objectRef.current.getWorldPosition(newPosition)

                return {
                  id: entity.id,
                  translation: newPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
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
                  .slice(0, 3) as Number3Tuple

                return {
                  id: entity.id,
                  rotation: newRotationE,
                  translation: newTranslation.toArray(),
                }
              })

            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'scale') {
            const absoluteScale = target.object.scale
              .toArray()
              .map(Math.abs) as Number3Tuple

            // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
            target.object.scale.fromArray(absoluteScale)

            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const entityRefData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)!
                const newScale = new Vector3()
                entityRefData.objectRef.current.getWorldScale(newScale)

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
                  scale: newScale.toArray(),
                  translation: updatedPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          }
        }}
        onObjectChange={(e) => {
          const target = (e as Event<string, OriginalTransformControls>).target
          // scale은 양수 값만 가질 수 있음
          const absoluteScale = target.object.scale
            .toArray()
            .map(Math.abs) as Number3Tuple
          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(absoluteScale)

          const firstSelectedEntityRef =
            firstSelectedEntityRefData?.objectRef.current
          if (firstSelectedEntityRef == null) return

          const worldPosition = firstSelectedEntityRef.localToWorld(
            new Vector3(0, 0, 0),
          )

          const worldQuaternion = new Quaternion()
          firstSelectedEntityRef.getWorldQuaternion(worldQuaternion)
          const worldRotation = new Euler().setFromQuaternion(worldQuaternion)

          const worldScale = new Vector3()
          firstSelectedEntityRef.getWorldScale(worldScale)

          setSelectionBaseTransformation({
            position: worldPosition.toArray(),
            rotation: worldRotation.toArray().slice(0, 3) as Number3Tuple,
            size: worldScale.toArray(),
          })

          console.log(
            'TransformControl onObjectChange',
            absoluteScale,
            firstSelectedEntityRef.scale.toArray(),
            worldScale.toArray(),
          )
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
