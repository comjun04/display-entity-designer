import { TransformControls as TransformControlsImpl } from '@react-three/drei'
import {
  type FC,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Box3,
  Box3Helper,
  Euler,
  type Event,
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
import type { Number3Tuple } from '@/types'

const SCALE_SNAP = 0.0625

const infinityVector = new Vector3(Infinity, Infinity, Infinity)
const minusInfinityVector = new Vector3(-Infinity, -Infinity, -Infinity)
const dummyBox = new Box3(infinityVector.clone(), minusInfinityVector.clone())

const TransformControls: FC = () => {
  const { selectedEntityIds, batchSetEntityTransformation } =
    useDisplayEntityStore(
      useShallow((state) => ({
        selectedEntityIds: state.selectedEntityIds,
        batchSetEntityTransformation: state.batchSetEntityTransformation,
      })),
    )

  const firstSelectedEntityId =
    selectedEntityIds.length > 0 ? selectedEntityIds[0] : null

  const { firstSelectedEntityRefData, rootGroupRefData } = useEntityRefStore(
    useShallow((state) => ({
      firstSelectedEntityRefData:
        firstSelectedEntityId != null
          ? state.entityRefs.get(firstSelectedEntityId)
          : undefined,
      rootGroupRefData: state.rootGroupRefData,
    })),
  )
  const {
    mode,
    rotationSpace,
    setUsingTransformControl,
    setSelectionBaseTransformation,
  } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      rotationSpace: state.rotationSpace,
      setUsingTransformControl: state.setUsingTransformControl,
      setSelectionBaseTransformation: state.setSelectionBaseTransformation,
    })),
  )

  const [shiftPressed, setShiftPressed] = useState(false)

  const pivot = useMemo(() => {
    const group = new Group()
    group.name = 'Pivot'
    return group
  }, [])
  // const pivotRef = useRef<Group>(null) as MutableRefObject<Group>
  const boundingBoxHelperRef = useRef<Box3Helper>(null)

  const pivotInitialPosition = useRef(new Vector3())
  const pivotInitialQuaternion = useRef(new Quaternion())
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
    if (boundingBoxHelperRef.current == null) return

    const box = boundingBoxHelperRef.current.box
    box.set(infinityVector.clone(), minusInfinityVector.clone()) // 넓이 초기화

    selectedEntityIds.forEach((entityId) => {
      const refData = useEntityRefStore.getState().entityRefs.get(entityId)!
      if (refData.objectRef.current != null) {
        box.expandByObject(refData.objectRef.current)
      }
    })
  }, [selectedEntityIds])

  // reparent pivot when first selected entity is changed
  useEffect(() => {
    const { rootGroupRefData } = useEntityRefStore.getState()

    console.log('pivot reparent', firstSelectedEntityRefData)

    if (firstSelectedEntityRefData != null) {
      const parent =
        firstSelectedEntityRefData.objectRef.current.parent ??
        rootGroupRefData.objectRef.current
      parent.add(pivot)
    } else {
      const parent = rootGroupRefData.objectRef.current
      parent.add(pivot)
    }
  }, [firstSelectedEntityRefData, pivot])

  // useEffect(() => {
  //   if (pivotRef.current == null) return

  //   if (firstSelectedEntityRefData) {
  //     // pivot을 해당 entity의 world position으로 이동
  //     // (local position은 entity가 그룹 안에 속해 있을 경우 상대적인 값으로 지정되므로 사용할 수 없음)
  //     firstSelectedEntityRefData.objectRef.current.getWorldPosition(
  //       pivotRef.current.position,
  //     )
  //     pivotRef.current.rotation.copy(
  //       firstSelectedEntityRefData.objectRef.current.rotation,
  //     )
  //     pivotRef.current.scale.set(1, 1, 1)
  //   }

  //   pivotInitialPosition.current.copy(pivotRef.current.position)
  // }, [firstSelectedEntityRefData, selectedEntityIds])

  useEffect(() => {
    updateBoundingBox()
  }, [selectedEntityIds, updateBoundingBox])

  useEffect(() => {
    const { entities } = useDisplayEntityStore.getState()
    const selectedEntities = [...entities.values()].filter((e) =>
      selectedEntityIds.includes(e.id),
    )

    console.log('update transform data list')

    selectedEntityInitialTransformations.current = []

    const tempEuler = new Euler()

    for (const entity of selectedEntities) {
      const refData = useEntityRefStore.getState().entityRefs.get(entity.id)!
      const object = refData.objectRef.current

      const positionVector = new Vector3(...entity.position)
      const rotationQuaternion = new Quaternion().setFromEuler(
        tempEuler.set(...entity.rotation),
      )
      const scaleVector = new Vector3(...entity.size)

      selectedEntityInitialTransformations.current.push({
        id: entity.id,
        object,
        position: positionVector,
        quaternion: rotationQuaternion,
        scale: scaleVector,
      })

      // 선택된 entity가 selectedEntityIds 리스트에서 맨 첫 번째일 경우 기준점으로 설정
      if (entity.id === firstSelectedEntityId) {
        pivot.position.copy(positionVector)
        pivot.quaternion.copy(rotationQuaternion)
        pivot.scale.set(1, 1, 1)

        pivotInitialPosition.current.copy(pivot.position)
        pivotInitialQuaternion.current.copy(pivot.quaternion)
      }
    }

    // pivot rotation 리셋
    // pivotRef.current.rotation.set(0, 0, 0)

    if (selectedEntityIds.length > 1) {
      updateBoundingBox()
    }
  }, [selectedEntityIds, firstSelectedEntityId, updateBoundingBox, pivot])

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

  return (
    <>
      <TransformControlsImpl
        object={pivot}
        mode={mode}
        space={rotationSpace}
        translationSnap={shiftPressed ? 0.00125 : 0.0625}
        // rotationSnap={Math.PI / 12} // 15도
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
            const batchUpdateData = [...entities.values()]
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
            const batchUpdateData = [...entities.values()]
              .filter((e) => selectedEntityIds.includes(e.id))
              .map((entity) => {
                const initialTransform =
                  selectedEntityInitialTransformations.current.find(
                    (d) => d.id === entity.id,
                  )!

                const newPosition = initialTransform.object.position

                const newRotationQuaternion =
                  initialTransform.object.quaternion.clone()
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
            // pivotRef.current.scale.set(1, 1, 1)

            const batchUpdateData = [...entities.values()]
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

          pivotInitialPosition.current.copy(pivot.position)
          pivotInitialQuaternion.current.copy(pivot.quaternion)

          pivot.scale.set(1, 1, 1)

          // pivot rotation 리셋
          // pivotRef.current.rotation.set(0, 0, 0)
        }}
        onObjectChange={(e) => {
          // if (pivotRef.current == null) return

          const target = (e as Event<string, OriginalTransformControls>).target
          // scale은 양수 값만 가질 수 있음
          const absoluteScale = target.object.scale
            .toArray()
            .map(Math.abs) as Number3Tuple
          // state를 건드리기 전에 object3d에 먼저 scale 값을 세팅해야 음수 값일 경우 음수 <-> 양수로 계속 바뀌면서 생기는 깜빡거림을 방지할 수 있음
          target.object.scale.fromArray(absoluteScale)

          // pivot quaternion currently moving - pivot quaternion before moving
          const pivotQuatDelta = pivot.quaternion
            .clone()
            .premultiply(pivotInitialQuaternion.current.clone().invert())

          for (const transformData of selectedEntityInitialTransformations.current) {
            if (mode !== 'scale') {
              const relativePosFromPivot = transformData.position
                .clone()
                .sub(pivotInitialPosition.current)

              const newPos = relativePosFromPivot
                .clone()
                .applyQuaternion(pivotQuatDelta)
                .multiply(pivot.scale)
                .add(pivot.position)
              transformData.object.position.copy(newPos)

              const quat2 = pivotQuatDelta
                .clone()
                .premultiply(transformData.quaternion)
              transformData.object.quaternion.copy(quat2)
            } else {
              const alteredScale = transformData.scale
                .clone()
                .multiply(pivot.scale)
              const scaleToApply = transformData.scale.clone()
              ;(['x', 'y', 'z'] as const).forEach((axis) => {
                if (
                  target.axis != null &&
                  target.axis.toLowerCase().includes(axis)
                ) {
                  const initialAxisScale = transformData.scale[axis]
                  const axisScaleDiff = alteredScale[axis] - initialAxisScale

                  let finalAxisScale =
                    initialAxisScale +
                    Math.round(axisScaleDiff / SCALE_SNAP) * SCALE_SNAP
                  finalAxisScale = Math.max(
                    Math.abs(finalAxisScale),
                    Number.EPSILON,
                  )

                  scaleToApply[axis] = finalAxisScale
                }
              })

              // transformData.object.scale.copy(pivot.scale)
              transformData.object.scale.copy(scaleToApply)
            }
          }

          // =====

          for (const selectedEntityId of selectedEntityIds) {
            // const initialTransformation =
            //   selectedEntityInitialTransformations.current.find(
            //     (d) => d.id === selectedEntityId,
            //   )!
            // const objectRef = initialTransformation.object
            // // object quaternion before rotating - pivot quaternion before rotating
            // const initialRelativeQuaternion = initialTransformation.quaternion
            //   .clone()
            //   .premultiply(pivotInitialQuaternion.current.clone().invert())
            // // object pos before moving - pivot pos before moving
            // const initialRelativePosition = initialTransformation.position
            //   .clone()
            //   .sub(pivotInitialPosition.current)
            // //
            // // objectRef.quaternion
            // //   .copy(initialRelativeQuaternion)
            // //   .premultiply(pivot.quaternion)
            // objectRef.quaternion
            //   .copy(initialTransformation.quaternion)
            //   .multiply(pivotQuatDelta)
            // // console.log(
            // //   initialTransformation.quaternion,
            // //   pivotRelativeQuaternion,
            // // )
            // objectRef.position
            //   .copy(initialRelativePosition)
            //   .applyQuaternion(pivotQuatDelta)
            //   .add(pivot.position)
            // =====
            // const pivotCurrentPositionOnLocalSpace =
            //   objectRef.parent!.worldToLocal(pivotRef.current.position.clone())
            // const relativePosition = initialTransformation.position
            //   .clone()
            //   .sub(
            //     objectRef.parent!.worldToLocal(
            //       pivotInitialPosition.current.clone(),
            //     ),
            //   )
            // // pivot quaternion 회전값 (pivot quaternion은 처음에 (0,0,0)으로 초기화됨)
            // const relativeQuaternion = pivotRef.current.quaternion
            // /*
            //  * pivot 현재 quaternion + entity 초기 quaternion
            //  * 이게 object의 quaternion에 들어감 (방향을 결정)
            //  * cross(relativeQuaternion, initialTransformation.quaternion)
            //  *
            //  * Three.js `Object3D#rotateOnWorldAxis()` 참조
            //  * https://github.com/mrdoob/three.js/blob/e8af245aaac4f65d2f1f4df5a302bd19599d899e/src/core/Object3D.js#L192
            //  */
            // const quaternion = initialTransformation.quaternion
            //   .clone()
            //   .premultiply(relativeQuaternion)
            // if (mode === 'scale') {
            //   objectRef.position
            //     .copy(relativePosition)
            //     // position 축은 rotation과 상관없이 고정이라 특정 rotation 방향대로 scale을 주고 싶으면 먼저 rotation을 없애고 작업해야 함
            //     .applyQuaternion(quaternion.clone().invert()) // 적용된 rotation을 revert하여 기본 rotation으로 만들기
            //     .multiply(pivotRef.current.scale) // 그리고 나서 position scale 적용
            //     .applyQuaternion(quaternion) // rotation 다시 적용
            //   objectRef.position.add(pivotCurrentPositionOnLocalSpace)
            //   objectRef.scale.copy(
            //     initialTransformation.scale
            //       .clone()
            //       .multiply(pivotRef.current.scale),
            //   )
            // } else {
            //   objectRef.position
            //     .copy(relativePosition)
            //     .applyQuaternion(relativeQuaternion)
            //     .add(pivotCurrentPositionOnLocalSpace)
            // }
            // // 새로 바라볼 방향으로 설정
            // objectRef.quaternion.copy(quaternion)
          }

          if (selectedEntityIds.length > 0) {
            const firstSelectedEntityRefData = useEntityRefStore
              .getState()
              .entityRefs.get(selectedEntityIds[0])!

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

      {/*<group name="pivot" ref={pivotRef} />*/}

      <box3Helper
        args={[dummyBox, 'white']}
        visible={selectedEntityIds.length > 1}
        ref={boundingBoxHelperRef}
      />
    </>
  )
}

export default TransformControls
