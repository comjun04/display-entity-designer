import { useDisplayEntityStore } from '@/store'
import { cn } from '@/utils'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
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

      {entities.map((entity, idx) => (
        <div
          key={idx}
          className={cn(
            'flex cursor-pointer flex-row items-center gap-1',
            selectedEntity?.id === entity.id && 'font-bold text-yellow-500',
          )}
          onClick={() => setSelectedEntity(entity.id)}
        >
          <IoCubeOutline size={16} />
          <span>{entity.type}</span>
        </div>
      ))}
    </div>
  )
}

export default ObjectsPanel
