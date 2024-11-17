import { FC, useCallback } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import { MathUtils, Vector3 } from 'three'
import { useEditorStore } from '@/stores/editorStore'
import { Number3Tuple, PartialNumber3Tuple } from '@/types'
import { useEntityRefStore } from '@/stores/entityRefStore'

const TransformsPanel: FC = () => {
  const {
    selectedEntityIds,
    batchSetEntityTransformation,

    firstSelectedEntity,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
      batchSetEntityTransformation: state.batchSetEntityTransformation,

      // temporary
      firstSelectedEntity:
        state.selectedEntityIds.length > 0
          ? state.entities.find((e) => e.id === state.selectedEntityIds[0])!
          : null,
    })),
  )
  const { selectionBaseTransformation, setSelectionBaseTransformation } =
    useEditorStore(
      useShallow((state) => {
        return {
          selectionBaseTransformation: state.selectionBaseTransformation,
          setSelectionBaseTransformation: state.setSelectionBaseTransformation,
        }
      }),
    )

  const allSelectedEntityTranslationEqual =
    firstSelectedEntity != null &&
    selectedEntityIds.every((entityId) => {
      const entity = useDisplayEntityStore
        .getState()
        .entities.find((e) => e.id === entityId)!
      return (
        entity.position[0] === firstSelectedEntity.position[0] &&
        entity.position[1] === firstSelectedEntity.position[1] &&
        entity.position[2] === firstSelectedEntity.position[2]
      )
    })
  const translation = (
    allSelectedEntityTranslationEqual
      ? selectionBaseTransformation.position.map(
          (d) => Math.round(d * 1_0000_0000) / 1_0000_0000, // 소수점 9자리에서 반올림
        )
      : [undefined, undefined, undefined]
  ) as PartialNumber3Tuple

  const allSelectedEntityRotationEqual =
    firstSelectedEntity != null &&
    selectedEntityIds.every((entityId) => {
      const entity = useDisplayEntityStore
        .getState()
        .entities.find((e) => e.id === entityId)!
      return (
        entity.rotation[0] === firstSelectedEntity.rotation[0] &&
        entity.rotation[1] === firstSelectedEntity.rotation[1] &&
        entity.rotation[2] === firstSelectedEntity.rotation[2]
      )
    })
  const rotation = (
    allSelectedEntityRotationEqual
      ? selectionBaseTransformation.rotation.map((d) => {
          const degree = MathUtils.radToDeg(d)
          const rounded = Math.round(degree * 1_0000_0000) / 1_0000_0000
          return rounded
        })
      : [undefined, undefined, undefined]
  ) as PartialNumber3Tuple

  const allSelectedEntityScaleEqual =
    firstSelectedEntity != null &&
    selectedEntityIds.every((entityId) => {
      const entity = useDisplayEntityStore
        .getState()
        .entities.find((e) => e.id === entityId)!
      return (
        entity.size[0] === firstSelectedEntity.size[0] &&
        entity.size[1] === firstSelectedEntity.size[1] &&
        entity.size[2] === firstSelectedEntity.size[2]
      )
    })
  const scale = (
    allSelectedEntityScaleEqual
      ? selectionBaseTransformation.size.map(
          (d) => Math.round(d * 1_0000_0000) / 1_0000_0000,
        )
      : [undefined, undefined, undefined]
  ) as PartialNumber3Tuple

  const translationUpdateFn = useCallback(
    (xyz: PartialNumber3Tuple) => {
      console.debug('TransformsPanel translateUpdateFn', xyz)

      // TODO: remove this
      setSelectionBaseTransformation({
        position: xyz,
      })

      const d = selectedEntityIds.map((id) => {
        const entityRefData = useEntityRefStore
          .getState()
          .entityRefs.find((d) => d.id === id)!
        if (xyz[0] != null) {
          entityRefData.objectRef.current.position.setX(0)
        }
        if (xyz[1] != null) {
          entityRefData.objectRef.current.position.setY(0)
        }
        if (xyz[2] != null) {
          entityRefData.objectRef.current.position.setZ(0)
        }

        return {
          id,
          // 모든 선택된 object를 해당 위치로 이동 = 다중선택 그룹의 위치도 이동
          // 모든 선택된 object의 이동된 축 위치가 동일해지므로 해당 축의 상대좌표를 0으로 지정
          translation: [
            xyz[0] ?? undefined,
            xyz[1] ?? undefined,
            xyz[2] ?? undefined,
          ] satisfies [
            number | undefined,
            number | undefined,
            number | undefined,
          ],
        }
      })
      batchSetEntityTransformation(d)
    },
    [
      batchSetEntityTransformation,
      selectedEntityIds,
      setSelectionBaseTransformation,
    ],
  )
  const rotationUpdateFn = useCallback(
    (xyz: PartialNumber3Tuple) => {
      console.debug('TransformsPanel rotateUpdateFn', xyz)

      const radianRotation = xyz.map((d) =>
        d != null ? MathUtils.degToRad(d) : d,
      ) as PartialNumber3Tuple

      // TODO: remove this
      setSelectionBaseTransformation({
        rotation: radianRotation,
      })

      const groupRef = useEntityRefStore.getState().selectedEntityGroupRef
      if (groupRef == null) {
        console.error('TransformsPanel.scaleUpdateFn: groupRef is undefined')
        return
      } else if (groupRef.current == null) {
        console.error(
          'TransformsPanel.scaleUpdateFn: groupRef.current is undefined, ref not bound',
        )
        return
      }

      const selectedEntityRefDataList = selectedEntityIds.map(
        (id) =>
          useEntityRefStore.getState().entityRefs.find((d) => d.id === id)!,
      )
      // group 이동 전 entity들의 world position을 저장
      const selectedEntityWorldPositions = selectedEntityRefDataList.map(
        (data) => {
          const vec = new Vector3()
          data.objectRef.current.getWorldPosition(vec)
          return vec
        },
      )

      // update group rotation manually
      const newGroupRotation = groupRef.current.rotation.toArray()
      if (radianRotation[0] != null) {
        newGroupRotation[0] = radianRotation[0]
      }
      if (radianRotation[1] != null) {
        newGroupRotation[1] = radianRotation[1]
      }
      if (radianRotation[2] != null) {
        newGroupRotation[2] = radianRotation[2]
      }
      groupRef.current.rotation.fromArray(newGroupRotation)

      // 저장해뒀던 entity들의 world position들을 group의 local space 상의 position으로 변환해서 각 object에 적용
      selectedEntityRefDataList.forEach((data, idx) => {
        const localPosition = groupRef.current!.worldToLocal(
          selectedEntityWorldPositions[idx],
        )
        data.objectRef.current.position.copy(localPosition)
      })

      const d = selectedEntityIds.map((id) => ({
        id,
        rotation: radianRotation,
      }))
      batchSetEntityTransformation(d)
    },
    [
      batchSetEntityTransformation,
      selectedEntityIds,
      setSelectionBaseTransformation,
    ],
  )
  const scaleUpdateFn = useCallback(
    (xyz: PartialNumber3Tuple) => {
      console.debug('TransformsPanel scaleUpdateFn', xyz)

      // TODO: remove this
      setSelectionBaseTransformation({
        size: xyz,
      })

      const groupRef = useEntityRefStore.getState().selectedEntityGroupRef
      if (groupRef == null) {
        console.error('TransformsPanel.scaleUpdateFn: groupRef is undefined')
        return
      } else if (groupRef.current == null) {
        console.error(
          'TransformsPanel.scaleUpdateFn: groupRef.current is undefined, ref not bound',
        )
        return
      }

      // group이 scale된 비율을 저장
      // group을 scale한 이후 object 위치를 다시 잡을 때 사용됨
      const rescaleRatio = [1, 1, 1] satisfies Number3Tuple

      // update group scale manually
      if (xyz[0] != null) {
        rescaleRatio[0] = groupRef.current.scale.x / xyz[0]
        groupRef.current.scale.setX(xyz[0])
      }
      if (xyz[1] != null) {
        rescaleRatio[1] = groupRef.current.scale.y / xyz[1]
        groupRef.current.scale.setY(xyz[1])
      }
      if (xyz[2] != null) {
        rescaleRatio[2] = groupRef.current.scale.z / xyz[2]
        groupRef.current.scale.setZ(xyz[2])
      }

      // group이 scale되면 안에 들어있는 object들의 위치도 같이 이동함
      // TransformsPanel로 scale을 조정했을 경우 위치는 그대로, 각자의 scale만 변경해줘야 하기 때문에
      // group scale 변경으로 인해 이동된 위치를 바로잡기
      selectedEntityIds.forEach((id) => {
        const entityRefData = useEntityRefStore
          .getState()
          .entityRefs.find((d) => d.id === id)!
        const positionVecInstance = entityRefData.objectRef.current.position
        positionVecInstance
          .setX(positionVecInstance.x * rescaleRatio[0])
          .setY(positionVecInstance.y * rescaleRatio[1])
          .setZ(positionVecInstance.z * rescaleRatio[2])
      })

      const d = selectedEntityIds.map((id) => {
        return {
          id,
          scale: xyz,
        }
      })
      batchSetEntityTransformation(d)
    },
    [
      batchSetEntityTransformation,
      selectedEntityIds,
      setSelectionBaseTransformation,
    ],
  )

  if (firstSelectedEntity == null) return null

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Transforms</span>

      {/* Translation */}
      <div>
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Translation
        </div>
        <XYZInput
          allowNegative
          value={translation}
          onChange={translationUpdateFn}
        />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Rotation
        </div>
        {/* temp */}
        <XYZInput allowNegative value={rotation} onChange={rotationUpdateFn} />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Scale
        </div>
        {/* temp */}
        <XYZInput value={scale} onChange={scaleUpdateFn} />
      </div>
    </div>
  )
}

export default TransformsPanel
