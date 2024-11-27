import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { ModelDisplayPositionKey } from '@/types'

const displayValue: (ModelDisplayPositionKey | null)[] = [
  null,
  'ground',
  'head',
  'firstperson_righthand',
  'firstperson_lefthand',
  'thirdperson_righthand',
  'thirdperson_lefthand',
  'gui',
  'fixed',
]

const PropertiesPanel: FC = () => {
  const { singleSelectedEntity, setEntityDisplayType, setBDEntityBlockstates } =
    useDisplayEntityStore(
      useShallow((state) => {
        return {
          singleSelectedEntity:
            state.selectedEntityIds.length === 1
              ? state.entities.find((e) => e.id === state.selectedEntityIds[0])!
              : null,
          setEntityDisplayType: state.setEntityDisplayType,
          setBDEntityBlockstates: state.setBDEntityBlockstates,
        }
      }),
    )

  const { data: blockstatesData } = useBlockStates(
    singleSelectedEntity?.kind === 'block'
      ? singleSelectedEntity.type
      : undefined,
  )

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Properties</span>
      {singleSelectedEntity?.kind === 'block' &&
        blockstatesData.blockstates.size > 0 && (
          <div className="flex flex-col gap-2">
            <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
              Blockstates
            </div>
            {[...blockstatesData.blockstates.entries()].map(([key, values]) => {
              return (
                <div key={key} className="flex flex-row items-center gap-2">
                  <label className="flex-1 text-end">{key}</label>
                  <select
                    className="flex-[2] rounded bg-neutral-800 px-2 py-1"
                    value={singleSelectedEntity.blockstates[key]}
                    onChange={(evt) => {
                      setBDEntityBlockstates(singleSelectedEntity.id, {
                        [key]: evt.target.value,
                      })
                    }}
                  >
                    {[...values.states.values()].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        )}

      {singleSelectedEntity?.kind === 'item' && (
        <div className="flex flex-col gap-2">
          <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
            Display
          </div>

          <div className="flex flex-row items-center gap-2">
            <label className="flex-1 text-end">display</label>
            <select
              className="flex-[2] rounded bg-neutral-800 px-2 py-1"
              value={singleSelectedEntity.display ?? 'none'}
              onChange={(evt) => {
                setEntityDisplayType(
                  singleSelectedEntity.id,
                  evt.target.value === 'none'
                    ? null
                    : (evt.target.value as ModelDisplayPositionKey),
                )
              }}
            >
              {displayValue.map((value) => (
                <option key={value ?? 'none'} value={value ?? 'none'}>
                  {value ?? 'none'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertiesPanel
