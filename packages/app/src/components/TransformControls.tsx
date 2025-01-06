import { TransformControls as TransformControlsImpl } from '@react-three/drei'
import { FC, MutableRefObject, useCallback, useEffect, useRef } from 'react'
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
import { TransformControls as OriginalTransformControls } from 'three/examples/jsm/Addons.js'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { Number3Tuple } from '@/types'

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

  const { firstSelectedEntityRefData, selectedEntityRefAllAvailable } =
    useEntityRefStore(
      useShallow((state) => ({
        firstSelectedEntityRefData:
          firstSelectedEntityId != null
            ? state.entityRefs.find((d) => d.id === firstSelectedEntityId)
            : undefined,
        selectedEntityRefAllAvailable: selectedEntityIds.every(
          (id) => state.entityRefs.find((d) => d.id === id)?.refAvailable,
        ),
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
  const selectedEntityInitialTransformations = useRef<
    {
      id: string
      object: Object3D
      position: Vector3
      quaternion: Quaternion
      scale: Vector3
    }[]
  >([])

  const updateBoundingBox = useCallback(() => {
    if (boundingBoxHelperRef.current == null || !selectedEntityRefAllAvailable)
      return

    const box = boundingBoxHelperRef.current.box
    box.set(infinityVector.clone(), minusInfinityVector.clone()) // 넓이 초기화

    selectedEntityIds.forEach((entityId) => {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)!
      box.expandByObject(refData.objectRef.current)
    })
  }, [selectedEntityIds, selectedEntityRefAllAvailable])

  useEffect(() => {
    if (pivotRef.current == null) return

    if (firstSelectedEntityRefData) {
      // pivot을 해당 entity의 world position으로 이동
      // (local position은 entity가 그룹 안에 속해 있을 경우 상대적인 값으로 지정되므로 사용할 수 없음)
      firstSelectedEntityRefData.objectRef.current.getWorldPosition(
        pivotRef.current.position,
      )
      pivotRef.current.rotation.copy(
        firstSelectedEntityRefData.objectRef.current.rotation,
      )
      pivotRef.current.scale.set(1, 1, 1)
    }

    pivotInitialPosition.current.copy(pivotRef.current.position)
  }, [firstSelectedEntityRefData, selectedEntityIds])

  useEffect(() => {
    updateBoundingBox()
  }, [selectedEntityIds, updateBoundingBox])

  useEffect(() => {
    const selectedEntities = entities.filter((e) =>
      selectedEntityIds.includes(e.id),
    )

    selectedEntityInitialTransformations.current = []

    if (!selectedEntityRefAllAvailable) return

    for (const entity of selectedEntities) {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entity.id)!
      const object = refData.objectRef.current

      const positionVector = new Vector3(...entity.position)
      const rotationEuler = new Euler(...entity.rotation)
      const scaleVector = new Vector3(...entity.size)

      selectedEntityInitialTransformations.current.push({
        id: entity.id,
        object,
        position: positionVector,
        quaternion: new Quaternion().setFromEuler(rotationEuler),
        scale: scaleVector,
      })

      // 선택된 entity가 selectedEntityIds 리스트에서 맨 첫 번째일 경우 기준점으로 설정
      if (entity.id === firstSelectedEntityId) {
        // pivot을 해당 entity의 world position으로 이동
        // (local position은 entity가 그룹 안에 속해 있을 경우 상대적인 값으로 지정되므로 사용할 수 없음)
        object.getWorldPosition(pivotRef.current.position)
        pivotInitialPosition.current.copy(pivotRef.current.position)
      }
    }

    // pivot rotation 리셋
    pivotRef.current.rotation.set(0, 0, 0)

    if (selectedEntityIds.length > 1) {
      updateBoundingBox()
    }
  }, [
    entities,
    selectedEntityIds,
    firstSelectedEntityId,
    updateBoundingBox,
    selectedEntityRefAllAvailable,
  ])

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
                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.id === entity.id,
                  )!

                const entityRefPosition = initialTransform.object.position
                initialTransform.position.copy(entityRefPosition)

                return {
                  id: entity.id,
                  translation: entityRefPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'rotate') {
            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.id === entity.id,
                  )!

                const newPosition = initialTransform.object.position

                const newRotationQuaternion = new Quaternion()
                initialTransform.object.getWorldQuaternion(
                  newRotationQuaternion,
                )
                const newRotationEuler = new Euler()
                  .setFromQuaternion(newRotationQuaternion)
                  .toArray()
                  .slice(0, 3) as Number3Tuple

                initialTransform.position.copy(newPosition)
                initialTransform.quaternion.copy(newRotationQuaternion)

                return {
                  id: entity.id,
                  rotation: newRotationEuler,
                  translation: newPosition.toArray(),
                }
              })

            batchSetEntityTransformation(batchUpdateData)
          } else if (mode === 'scale') {
            pivotRef.current.scale.set(1, 1, 1)

            const batchUpdateData = entities
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.id === entity.id,
                  )!

                const newScale = new Vector3()
                initialTransform.object.getWorldScale(newScale)

                // 다중 선택되어 있을 경우 그룹 중심점과 떨어져 있는 object들은 scale 시 위치가 달라짐
                // 따라서 world location을 별도로 계산하여 state에 반영
                const newPosition = initialTransform.object.position

                initialTransform.position.copy(newPosition)
                initialTransform.scale.copy(newScale)

                return {
                  id: entity.id,
                  scale: newScale.toArray(),
                  translation: newPosition.toArray(),
                }
              })
            batchSetEntityTransformation(batchUpdateData)
          }

          pivotInitialPosition.current.copy(pivotRef.current.position)

          // pivot rotation 리셋
          pivotRef.current.rotation.set(0, 0, 0)
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
            const initialTransformation =
              selectedEntityInitialTransformations.current.find(
                (d) => d.id === selectedEntityId,
              )!
            const objectRef = initialTransformation.object

            const pivotCurrentPositionOnLocalSpace =
              objectRef.parent!.worldToLocal(pivotRef.current.position.clone())

            const relativePosition = initialTransformation.position
              .clone()
              .sub(
                objectRef.parent!.worldToLocal(
                  pivotInitialPosition.current.clone(),
                ),
              )

            // pivot quaternion 회전값 (pivot quaternion은 처음에 (0,0,0)으로 초기화됨)
            const relativeQuaternion = pivotRef.current.quaternion

            /*
             * pivot 현재 quaternion + entity 초기 quaternion
             * 이게 object의 quaternion에 들어감 (방향을 결정)
             * cross(relativeQuaternion, initialTransformation.quaternion)
             *
             * Three.js `Object3D#rotateOnWorldAxis()` 참조
             * https://github.com/mrdoob/three.js/blob/e8af245aaac4f65d2f1f4df5a302bd19599d899e/src/core/Object3D.js#L192
             */
            const quaternion = initialTransformation.quaternion
              .clone()
              .premultiply(relativeQuaternion)

            if (mode === 'scale') {
              objectRef.position
                .copy(relativePosition)
                // position 축은 rotation과 상관없이 고정이라 특정 rotation 방향대로 scale을 주고 싶으면 먼저 rotation을 없애고 작업해야 함
                .applyQuaternion(quaternion.clone().invert()) // 적용된 rotation을 revert하여 기본 rotation으로 만들기
                .multiply(pivotRef.current.scale) // 그리고 나서 position scale 적용
                .applyQuaternion(quaternion) // rotation 다시 적용
              objectRef.position.add(pivotCurrentPositionOnLocalSpace)

              objectRef.scale.copy(
                initialTransformation.scale
                  .clone()
                  .multiply(pivotRef.current.scale),
              )
            } else {
              objectRef.position
                .copy(relativePosition)
                .applyQuaternion(relativeQuaternion)
                .add(pivotCurrentPositionOnLocalSpace)
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
