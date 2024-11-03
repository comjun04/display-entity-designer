import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/store'
import { Select } from '@headlessui/react'
import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

const PropertiesPanel: FC = () => {
  const { selectedEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
    })),
  )

  const { data: blockstatesData } = useBlockStates(selectedEntity?.type)

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Properties</span>
      <div className="flex flex-col gap-2">
        {[...blockstatesData.blockstates.entries()].map(([key, values]) => {
          return (
            <div key={key} className="flex flex-row items-center gap-2">
              <label className="flex-1 text-end">{key}</label>
              <Select className="flex-[2] rounded bg-neutral-800 px-2 py-1">
                {[...values.values()].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PropertiesPanel
