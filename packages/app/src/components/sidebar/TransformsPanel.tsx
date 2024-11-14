import { FC } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useShallow } from 'zustand/shallow'
import { MathUtils } from 'three'

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

  // 소수점 9자리에서 반올림
  const translation = (firstSelectedEntity?.position ?? [0, 0, 0]).map(
    (d) => Math.round(d * 1_0000_0000) / 1_0000_0000,
  ) as [number, number, number]

  const rotation = (firstSelectedEntity?.rotation ?? [0, 0, 0]).map((d) => {
    const degree = MathUtils.radToDeg(d)
    const rounded = Math.round(degree * 1_0000_0000) / 1_0000_0000
    return rounded
  }) as [number, number, number]

  const scale = (firstSelectedEntity?.size ?? [1, 1, 1]).map(
    (d) => Math.round(d * 1_0000_0000) / 1_0000_0000,
  ) as [number, number, number]

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
          onChange={(xyz) => setEntityTranslation(firstSelectedEntity.id, xyz)}
        />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Rotation
        </div>
        {/* temp */}
        <XYZInput
          allowNegative
          value={rotation}
          onChange={(xyz) => {
            const radianRotation = xyz.map((d) => (d * Math.PI) / 180) as [
              number,
              number,
              number,
            ]
            setEntityRotation(firstSelectedEntity.id, radianRotation)
          }}
        />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Scale
        </div>
        {/* temp */}
        <XYZInput
          value={scale}
          onChange={(xyz) => setEntityScale(firstSelectedEntity.id, xyz)}
        />
      </div>
    </div>
  )
}

export default TransformsPanel
