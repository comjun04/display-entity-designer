import { FC, useMemo } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/store'
import { useShallow } from 'zustand/shallow'

const TransformsPanel: FC = () => {
  const {
    selectedEntity,
    setEntityTranslation,
    setEntityRotation,
    setEntityScale,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
      setEntityTranslation: state.setEntityTranslation,
      setEntityRotation: state.setEntityRotation,
      setEntityScale: state.setEntityScale,
    })),
  )

  const translation = useMemo(
    () => selectedEntity?.position ?? ([0, 0, 0] as [number, number, number]),
    [selectedEntity?.position],
  )
  const rotation = useMemo(
    () =>
      (selectedEntity?.rotation ?? [0, 0, 0]).map((d) => {
        const degree = (d / Math.PI) * 180

        // 소수점 7자리에서 반올림
        const rounded = Math.round(degree * 1000000) / 1000000
        return rounded
      }) as [number, number, number],
    [selectedEntity?.rotation],
  )
  const scale = useMemo(
    () => selectedEntity?.size ?? ([1, 1, 1] as [number, number, number]),
    [selectedEntity?.size],
  )

  if (selectedEntity == null) return null

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
          onChange={(xyz) => setEntityTranslation(selectedEntity.id, xyz)}
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
            setEntityRotation(selectedEntity.id, radianRotation)
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
          onChange={(xyz) => setEntityScale(selectedEntity.id, xyz)}
        />
      </div>
    </div>
  )
}

export default TransformsPanel
