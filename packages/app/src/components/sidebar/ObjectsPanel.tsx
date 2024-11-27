import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { cn } from '@/utils'

type ObjectItemProps = {
  id: string
}
const ObjectItem: FC<ObjectItemProps> = ({ id }) => {
  const {
    kind,
    type,
    display,
    blockstates,
    selected,
    setSelected,
    addToSelectedEntity,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const entity = state.entities.find((e) => e.id === id)!

      return {
        kind: entity.kind,
        type: entity.type,
        display: entity.display,
        blockstates: entity.kind === 'block' ? entity.blockstates : undefined,
        selected: state.selectedEntityIds.includes(id),
        setSelected: state.setSelected,
        addToSelectedEntity: state.addToSelected,
      }
    }),
  )

  const blockstateArr: string[] = []
  if (kind === 'block') {
    for (const key in blockstates!) {
      blockstateArr.push(`${key}=${blockstates[key]}`)
    }
  }

  return (
    <div
      className={cn(
        'flex cursor-pointer flex-row items-center gap-1',
        selected && 'font-bold text-yellow-500',
      )}
      onClick={(evt) =>
        evt.ctrlKey ? addToSelectedEntity(id) : setSelected([id])
      }
    >
      <span className="flex-none">
        {kind === 'block' && <IoCubeOutline size={16} />}
        {kind === 'item' && <TbDiamondFilled size={16} />}
      </span>
      <span>{type}</span>
      {blockstateArr.length > 0 && (
        <span className="truncate opacity-50">[{blockstateArr.join(',')}]</span>
      )}
      {kind === 'item' && display != null && (
        <span className="truncate opacity-50">[display={display}]</span>
      )}
    </div>
  )
}

const ObjectsPanel: FC = () => {
  const { entityIds } = useDisplayEntityStore(
    useShallow((state) => ({
      entityIds: state.entityIds,
    })),
  )

  return (
    <div className="flex select-none flex-col gap-[2px] rounded-lg bg-neutral-900 p-2 text-sm">
      <span className="font-bold">Objects</span>

      {entityIds.map((id) => (
        <ObjectItem key={id} id={id} />
      ))}
    </div>
  )
}

export default ObjectsPanel
