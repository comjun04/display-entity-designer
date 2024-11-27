import { FC, useCallback } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import { MathUtils } from 'three'
import { useEditorStore } from '@/stores/editorStore'
import { PartialNumber3Tuple } from '@/types'
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
          entityRefData.objectRef.current.position.setX(xyz[0])
        }
        if (xyz[1] != null) {
          entityRefData.objectRef.current.position.setY(xyz[1])
        }
        if (xyz[2] != null) {
          entityRefData.objectRef.current.position.setZ(xyz[2])
        }

        return {
          id,
          translation: [
            xyz[0] ?? undefined,
            xyz[1] ?? undefined,
            xyz[2] ?? undefined,
          ] satisfies PartialNumber3Tuple,
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

      setSelectionBaseTransformation({
        rotation: radianRotation,
      })

      const d = selectedEntityIds.map((id) => {
        const entityRefData = useEntityRefStore
          .getState()
          .entityRefs.find((d) => d.id === id)!

        if (radianRotation[0] != null) {
          entityRefData.objectRef.current.rotation.x = radianRotation[0]
        }
        if (radianRotation[1] != null) {
          entityRefData.objectRef.current.rotation.y = radianRotation[1]
        }
        if (radianRotation[2] != null) {
          entityRefData.objectRef.current.rotation.z = radianRotation[2]
        }

        return {
          id,
          rotation: radianRotation,
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
  const scaleUpdateFn = useCallback(
    (xyz: PartialNumber3Tuple) => {
      console.debug('TransformsPanel scaleUpdateFn', xyz)

      setSelectionBaseTransformation({
        size: xyz,
      })

      selectedEntityIds.forEach((id) => {
        const entityRefData = useEntityRefStore
          .getState()
          .entityRefs.find((d) => d.id === id)!

        if (xyz[0] != null) {
          entityRefData.objectRef.current.scale.setX(xyz[0])
        }
        if (xyz[1] != null) {
          entityRefData.objectRef.current.scale.setY(xyz[1])
        }
        if (xyz[2] != null) {
          entityRefData.objectRef.current.scale.setZ(xyz[2])
        }
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
