import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/store'
import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

const PropertiesPanel: FC = () => {
  const { selectedEntity, setEntityBlockstates } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
      setEntityBlockstates: state.setEntityBlockstates,
    })),
  )

  const { data: blockstatesData } = useBlockStates(selectedEntity?.type)

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Properties</span>
      {selectedEntity != null && (
        <div className="flex flex-col gap-2">
          {[...blockstatesData.blockstates.entries()].map(([key, values]) => {
            return (
              <div key={key} className="flex flex-row items-center gap-2">
                <label className="flex-1 text-end">{key}</label>
                <select
                  className="flex-[2] rounded bg-neutral-800 px-2 py-1"
                  onChange={(evt) => {
                    setEntityBlockstates(selectedEntity.id, {
                      [key]: evt.target.value,
                    })
                  }}
                >
                  {[...values.values()].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PropertiesPanel
