import { useDisplayEntityStore } from '@/store'
import { cn } from '@/utils'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

const ObjectsPanel: FC = () => {
  const { entities, selectedEntity, setSelectedEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
      selectedEntity: state.getSelectedEntity(),
      setSelectedEntity: state.setSelected,
    })),
  )

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Objects</span>

      {entities.map((entity, idx) => {
        const blockstateArr: string[] = []
        if (entity.kind === 'block') {
          for (const key in entity.blockstates) {
            blockstateArr.push(`${key}=${entity.blockstates[key]}`)
          }
        }

        return (
          <div
            key={idx}
            className={cn(
              'flex cursor-pointer flex-row items-center gap-1',
              selectedEntity?.id === entity.id && 'font-bold text-yellow-500',
            )}
            onClick={() => setSelectedEntity(entity.id)}
          >
            <span className="flex-none">
              {entity.kind === 'block' && <IoCubeOutline size={16} />}
              {entity.kind === 'item' && <TbDiamondFilled size={16} />}
            </span>
            <span>{entity.type}</span>
            {blockstateArr.length > 0 && (
              <span className="truncate opacity-50">
                [{blockstateArr.join(',')}]
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ObjectsPanel
