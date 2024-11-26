import { Grid, PerspectiveCamera, TransformControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef, useState } from 'react'
import {
  Color,
  Euler,
  Event,
  Group,
  Object3D,
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
import { Number3Tuple } from './types'
import DragSelectControl from './components/DragSelectControl'

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

  const pivotRef = useRef<Group>(null) as MutableRefObject<Group>

  const { firstSelectedEntityRefData } = useEntityRefStore(
    useShallow((state) => ({
      firstSelectedEntityRefData:
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
  // const selectedEntityGroupRef = useRef<Group>(null)

  const pivotInitialPosition = useRef(new Vector3())
  const pivotInitialQuaternion = useRef(new Quaternion())
  const selectedEntityInitialTransformations = useRef<
    {
      object: Object3D
      position: Vector3
      quaternion: Quaternion
      scale: Vector3
    }[]
  >([])

  useEffect(() => {
    if (pivotRef.current == null) return

    if (firstSelectedEntityRefData) {
      pivotRef.current.position.copy(
        firstSelectedEntityRefData.objectRef.current.position,
      )
      pivotRef.current.rotation.copy(
        firstSelectedEntityRefData.objectRef.current.rotation,
      )
      pivotRef.current.scale.set(1, 1, 1)
    }

    pivotInitialPosition.current.copy(pivotRef.current.position)
    pivotInitialQuaternion.current.copy(pivotRef.current.quaternion)

    selectedEntityInitialTransformations.current = []

    for (const id of selectedEntityIds) {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === id)!
      const object = refData.objectRef.current

      selectedEntityInitialTransformations.current.push({
        object,
        position: object.position.clone(),
        quaternion: object.quaternion.clone(),
        scale: object.scale.clone(),
      })
    }
  }, [firstSelectedEntityRefData, selectedEntityIds])

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

      <group name="pivot" ref={pivotRef} />
      <TransformControls
        object={pivotRef}
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

          const entities = useDisplayEntityStore.getState().entities

          if (mode === 'translate') {
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const entityRefData = useEntityRefStore
                  .getState()
                  .entityRefs.find((d) => d.id === entity.id)!
                const newPosition = new Vector3()
                entityRefData.objectRef.current.getWorldPosition(newPosition)

                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.object.id === entityRefData.objectRef.current.id,
                  )!
                initialTransform.position.copy(newPosition)

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

                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.object.id === refData.objectRef.current.id,
                  )!
                initialTransform.position.copy(newTranslation)
                initialTransform.quaternion.copy(newRotationQ)

                return {
                  id: entity.id,
                  rotation: newRotationE,
                  translation: newTranslation.toArray(),
                }
              })

            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'scale') {
            pivotRef.current.scale.set(1, 1, 1)

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

                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.object.id === entityRefData.objectRef.current.id,
                  )!
                initialTransform.position.copy(updatedPosition)
                initialTransform.scale.copy(newScale)

                return {
                  id: entity.id,
                  scale: newScale.toArray(),
                  translation: updatedPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          }

          pivotInitialPosition.current.copy(pivotRef.current.position)
          pivotInitialQuaternion.current.copy(pivotRef.current.quaternion)
        }}
        onObjectChange={(e) => {
          if (pivotRef.current == null) return

          const target = (e as Event<string, OriginalTransformControls>).target
          // scale은 양수 값만 가질 수 있음
          const absoluteScale = target.object.scale
            .toArray()
            .map(Math.abs) as Number3Tuple
          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(absoluteScale)

          for (const selectedEntityId of selectedEntityIds) {
            const refData = useEntityRefStore
              .getState()
              .entityRefs.find((d) => d.id === selectedEntityId)!
            const objectRef = refData.objectRef.current

            const initialTransformation =
              selectedEntityInitialTransformations.current.find(
                (d) => d.object.id === objectRef.id,
              )!
            const relativePosition = initialTransformation.position
              .clone()
              .sub(pivotInitialPosition.current)

            // entity 초기 quaternion에서 pivot 초기 quaternion의 차이
            const relativeQuaternion = pivotInitialQuaternion.current
              .clone()
              .invert()
              .premultiply(initialTransformation.quaternion)
            // pivot 현재 quaternion + relativeQuaternion
            // 이게 object의 quaternion에 들어감 (방향을 결정)
            const quaternion = pivotRef.current.quaternion
              .clone()
              .multiply(relativeQuaternion)

            // 위치이동 시
            // pivot 현재 quaternion에서 pivot initial quaternion의 차이
            // current_quaternion x initial_quaternion^-1
            const positionalQuaternion = pivotInitialQuaternion.current
              .clone()
              .invert()
              .premultiply(pivotRef.current.quaternion)

            if (mode === 'scale') {
              objectRef.position
                .copy(relativePosition)
                // position 축은 rotation과 상관없이 고정이라 특정 rotation 방향대로 scale을 주고 싶으면 먼저 rotation을 없애고 작업해야 함
                .applyQuaternion(quaternion.clone().invert()) // 적용된 rotation을 revert하여 기본 rotation으로 만들기
                .multiply(pivotRef.current.scale) // 그리고 나서 position scale 적용
                .applyQuaternion(quaternion) // rotation 다시 적용
              objectRef.position.add(pivotRef.current.position)

              objectRef.scale.copy(
                initialTransformation.scale
                  .clone()
                  .multiply(pivotRef.current.scale),
              )
            } else {
              objectRef.position
                .copy(relativePosition)
                .applyQuaternion(positionalQuaternion)
                .add(pivotRef.current.position)
            }

            // 새로 바라볼 방향으로 설정
            objectRef.quaternion.copy(quaternion)
          }
        }}
      />
      <DragSelectControl />

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
