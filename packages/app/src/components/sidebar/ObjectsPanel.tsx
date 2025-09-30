import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { IoCubeOutline } from 'react-icons/io5'
import { LuChevronDown, LuType } from 'react-icons/lu'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { cn } from '@/utils'

import { SidePanel, SidePanelContent, SidePanelTitle } from '../SidePanel'

type ObjectItemProps = {
  id: string
}
const ObjectItem: FC<ObjectItemProps> = ({ id }) => {
  const {
    kind,
    type,
    textDisplayText,
    display,
    blockstates,
    selected,
    children,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const entity = state.entities.get(id)!

      return {
        kind: entity.kind,
        type: 'type' in entity ? entity.type : undefined,
        textDisplayText: 'text' in entity ? entity.text : undefined,
        display: 'display' in entity ? entity.display : null,
        blockstates: entity.kind === 'block' ? entity.blockstates : undefined,
        selected: state.selectedEntityIds.includes(id),

        parent: entity.parent,
        children: entity.kind === 'group' ? entity.children : null,
      }
    }),
  )
  const thisOrChildSelected = useDisplayEntityStore((state) =>
    state.selectedEntityIdsIncludingParent.has(id),
  )

  const blockstateArr: string[] = []
  if (kind === 'block') {
    for (const key in blockstates!) {
      blockstateArr.push(`${key}=${blockstates[key]}`)
    }
  }

  return (
    <div>
      <div
        className={cn(
          'flex cursor-pointer flex-row items-center gap-1',
          selected && [
            'font-bold',
            kind === 'group' ? 'text-green-500' : 'text-yellow-500',
          ],
        )}
        onClick={(evt) => {
          const { addToSelected: addToSelectedEntity, setSelected } =
            useDisplayEntityStore.getState()

          if (evt.ctrlKey) {
            const { entities, selectedEntityIds } =
              useDisplayEntityStore.getState()

            if (selectedEntityIds.length < 1) {
              addToSelectedEntity(id)
              return
            }

            const thisEntity = entities.get(id)
            if (thisEntity == null) return

            // 같은 parent 내의 object만 다중 선택 가능
            const selectedEntityParent = [...entities.values()].find((e) =>
              selectedEntityIds.includes(e.id),
            )!.parent
            if (thisEntity.parent === selectedEntityParent) {
              addToSelectedEntity(id)
              return
            }
          }

          setSelected([id])
        }}
      >
        <span className="flex-none">
          {kind === 'block' && <IoCubeOutline size={16} />}
          {kind === 'item' && <TbDiamondFilled size={16} />}
          {kind === 'text' && <LuType size={16} />}
          {kind === 'group' && <LuChevronDown size={16} />}
        </span>
        <span>
          {kind === 'group'
            ? 'Group'
            : kind === 'text'
              ? textDisplayText
              : type}
        </span>
        {blockstateArr.length > 0 && (
          <span className="truncate opacity-50">
            [{blockstateArr.join(',')}]
          </span>
        )}
        {kind === 'item' && display != null && (
          <span className="truncate opacity-50">[display={display}]</span>
        )}
      </div>

      {kind === 'group' && children != null && thisOrChildSelected && (
        <div className="pl-4">
          {children.map((entityId) => (
            <ObjectItem key={entityId} id={entityId} />
          ))}
        </div>
      )}
    </div>
  )
}

const ObjectsPanel: FC = () => {
  const { t } = useTranslation()

  const rootEntityIds = useDisplayEntityStore(
    useShallow((state) =>
      [...state.entities.values()]
        .filter((e) => e.parent == null)
        .map((entity) => entity.id),
    ),
  )

  return (
    <SidePanel className="max-h-[50vh]">
      <SidePanelTitle>{t(($) => $.sidebar.objectsPanel.title)}</SidePanelTitle>
      <SidePanelContent>
        {rootEntityIds.map((id) => (
          <ObjectItem key={id} id={id} />
        ))}
      </SidePanelContent>
    </SidePanel>
  )
}

export default ObjectsPanel
