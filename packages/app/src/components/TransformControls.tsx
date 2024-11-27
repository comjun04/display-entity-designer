import { FC, MutableRefObject, useCallback, useEffect, useRef } from 'react'
import { TransformControls as TransformControlsImpl } from '@react-three/drei'
import {
  Box3,
  Box3Helper,
  Euler,
  Event,
  Group,
  Object3D,
  Quaternion,
  Vector3,
} from 'three'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { useShallow } from 'zustand/shallow'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { Number3Tuple } from '@/types'
import { TransformControls as OriginalTransformControls } from 'three/examples/jsm/Addons.js'

const infinityVector = new Vector3(Infinity, Infinity, Infinity)
const minusInfinityVector = new Vector3(-Infinity, -Infinity, -Infinity)
const dummyBox = new Box3(infinityVector.clone(), minusInfinityVector.clone())

type TransformControlsProps = {
  shiftPressed: boolean
}

const TransformControls: FC<TransformControlsProps> = ({ shiftPressed }) => {
  const { entities, selectedEntityIds, batchSetEntityTransformation } =
    useDisplayEntityStore(
      useShallow((state) => ({
        entities: state.entities,
        selectedEntityIds: state.selectedEntityIds,
        batchSetEntityTransformation: state.batchSetEntityTransformation,
      })),
    )

  const firstSelectedEntityId =
    selectedEntityIds.length > 0 ? selectedEntityIds[0] : null

  const { firstSelectedEntityRefData } = useEntityRefStore(
    useShallow((state) => ({
      firstSelectedEntityRefData:
        firstSelectedEntityId != null
          ? state.entityRefs.find((d) => d.id === firstSelectedEntityId)
          : undefined,
    })),
  )
  const { mode, setUsingTransformControl, setSelectionBaseTransformation } =
    useEditorStore(
      useShallow((state) => ({
        mode: state.mode,
        setUsingTransformControl: state.setUsingTransformControl,
        setSelectionBaseTransformation: state.setSelectionBaseTransformation,
      })),
    )

  const pivotRef = useRef<Group>(null) as MutableRefObject<Group>
  const boundingBoxHelperRef = useRef<Box3Helper>(null)

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

  const updateBoundingBox = useCallback(() => {
    if (boundingBoxHelperRef.current == null) return

    const box = boundingBoxHelperRef.current.box
    box.set(infinityVector.clone(), minusInfinityVector.clone()) // 넓이 초기화

    selectedEntityIds.forEach((entityId) => {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)!
      box.expandByObject(refData.objectRef.current)
    })
  }, [selectedEntityIds])

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
  }, [firstSelectedEntityRefData, selectedEntityIds])

  useEffect(() => {
    updateBoundingBox()
  }, [selectedEntityIds, updateBoundingBox])

  useEffect(() => {
    const selectedEntities = entities.filter((e) =>
      selectedEntityIds.includes(e.id),
    )

    selectedEntityInitialTransformations.current = []

    for (const entity of selectedEntities) {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entity.id)!
      const object = refData.objectRef.current

      const positionVector = new Vector3(...entity.position)
      const roatationEuler = new Euler(...entity.rotation)
      const scaleVector = new Vector3(...entity.size)

      selectedEntityInitialTransformations.current.push({
        object,
        position: positionVector,
        quaternion: new Quaternion().setFromEuler(roatationEuler),
        scale: scaleVector,
      })

      if (entity.id === firstSelectedEntityId) {
        pivotRef.current.position.copy(positionVector)
        pivotRef.current.rotation.copy(roatationEuler)
      }
    }

    if (selectedEntityIds.length > 1) {
      updateBoundingBox()
    }
  }, [entities, selectedEntityIds, firstSelectedEntityId, updateBoundingBox])

  return (
    <>
      <TransformControlsImpl
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

          if (selectedEntityIds.length > 0) {
            const firstSelectedEntityRefData = useEntityRefStore
              .getState()
              .entityRefs.find((d) => d.id === selectedEntityIds[0])!

            setSelectionBaseTransformation({
              position:
                firstSelectedEntityRefData.objectRef.current.position.toArray(),
              rotation: firstSelectedEntityRefData.objectRef.current.rotation
                .toArray()
                .slice(0, 3) as [number, number, number],
              size: firstSelectedEntityRefData.objectRef.current.scale.toArray(),
            })
          }

          // update box
          updateBoundingBox()
        }}
      />

      <group name="pivot" ref={pivotRef} />

      <box3Helper
        args={[dummyBox, 'white']}
        visible={selectedEntityIds.length > 1}
        ref={boundingBoxHelperRef}
      />
    </>
  )
}

export default TransformControls
