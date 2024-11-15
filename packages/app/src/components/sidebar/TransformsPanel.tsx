import { FC, useCallback } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import { MathUtils } from 'three'
import { useEditorStore } from '@/stores/editorStore'
import { Number3Tuple } from '@/types'

const TransformsPanel: FC = () => {
  const {
    setEntityTranslation,
    setEntityRotation,
    setEntityScale,

    firstSelectedEntity,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
      setEntityTranslation: state.setEntityTranslation,
      setEntityRotation: state.setEntityRotation,
      setEntityScale: state.setEntityScale,

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

  // 소수점 9자리에서 반올림
  const translation = (selectionBaseTransformation.position ?? [0, 0, 0]).map(
    (d) => Math.round(d * 1_0000_0000) / 1_0000_0000,
  ) as Number3Tuple

  const rotation = (selectionBaseTransformation.rotation ?? [0, 0, 0]).map(
    (d) => {
      const degree = MathUtils.radToDeg(d)
      const rounded = Math.round(degree * 1_0000_0000) / 1_0000_0000
      return rounded
    },
  ) as Number3Tuple

  const scale = (selectionBaseTransformation.size ?? [1, 1, 1]).map(
    (d) => Math.round(d * 1_0000_0000) / 1_0000_0000,
  ) as Number3Tuple

  const translationUpdateFn = useCallback(
    (xyz: [number | undefined, number | undefined, number | undefined]) => {
      if (firstSelectedEntity?.id != null) {
        setEntityTranslation(firstSelectedEntity.id, xyz)
        setSelectionBaseTransformation({
          position: xyz,
        })
      }
    },
    [
      firstSelectedEntity?.id,
      setEntityTranslation,
      setSelectionBaseTransformation,
    ],
  )
  const rotationUpdateFn = useCallback(
    (xyz: [number | undefined, number | undefined, number | undefined]) => {
      if (firstSelectedEntity?.id != null) {
        const radianRotation = xyz.map((d) =>
          d != null ? MathUtils.degToRad(d) : d,
        ) as [number | undefined, number | undefined, number | undefined]

        setEntityRotation(firstSelectedEntity.id, radianRotation)
        setSelectionBaseTransformation({
          rotation: radianRotation,
        })
      }
    },
    [
      firstSelectedEntity?.id,
      setEntityRotation,
      setSelectionBaseTransformation,
    ],
  )
  const scaleUpdateFn = useCallback(
    (xyz: [number | undefined, number | undefined, number | undefined]) => {
      if (firstSelectedEntity?.id != null) {
        setEntityScale(firstSelectedEntity.id, xyz)
        setSelectionBaseTransformation({
          size: xyz,
        })
      }
    },
    [firstSelectedEntity?.id, setEntityScale, setSelectionBaseTransformation],
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
