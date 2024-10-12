import { FC, useMemo } from 'react'
import XYZInput from './XYZInput'
import { useDisplayEntityStore } from '@/store'
import { useShallow } from 'zustand/shallow'

const TransformsPanel: FC = () => {
  const { selectedEntity, selectedEntityPosition, setEntityTranslation } =
    useDisplayEntityStore(
      useShallow((state) => ({
        selectedEntity: state.getSelectedEntity(),
        selectedEntityPosition: state.getSelectedEntity()?.location,
        setEntityTranslation: state.setEntityTranslation,
      })),
    )

  const translation = useMemo(
    () => ({
      x: selectedEntityPosition?.[0] ?? 0,
      y: selectedEntityPosition?.[1] ?? 0,
      z: selectedEntityPosition?.[2] ?? 0,
    }),
    [selectedEntityPosition],
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
          value={translation}
          onChange={(xyz) => setEntityTranslation(selectedEntity.id, xyz)}
        />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Rotation
        </div>
        {/* temp */}
        <XYZInput value={{ x: 0, y: 0, z: 0 }} />
      </div>

      <div className="mt-2">
        <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
          Scale
        </div>
        {/* temp */}
        <XYZInput value={{ x: 0, y: 0, z: 0 }} />
      </div>
    </div>
  )
}

export default TransformsPanel
