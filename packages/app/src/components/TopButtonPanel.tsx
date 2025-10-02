import { Tooltip } from '@heroui/tooltip'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdTrash } from 'react-icons/io'
import { IoCubeOutline } from 'react-icons/io5'
import {
  LuChevronDown,
  LuCopyPlus,
  LuGroup,
  LuPlus,
  LuSmile,
  LuType,
  LuUngroup,
} from 'react-icons/lu'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { toggleGroup } from '@/services/actions'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import FloatingButton from './FloatingButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

const TopButtonPanel: FC = () => {
  const { t } = useTranslation()

  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { selectedEntityIds, deleteEntities, singleSelectedEntityIsGrouped } =
    useDisplayEntityStore(
      useShallow((state) => ({
        selectedEntityIds: state.selectedEntityIds,
        deleteEntities: state.deleteEntities,
        singleSelectedEntityIsGrouped:
          state.selectedEntityIds.length === 1 &&
          state.entities.get(state.selectedEntityIds[0])?.kind === 'group',
      })),
    )

  return (
    <div className="absolute left-1/2 top-4 z-[5] -translate-x-1/2">
      <div className="flex flex-row rounded-lg bg-black">
        {/* Desktop - show all 'Add Display Entity' buttons */}
        <div className="flex hidden flex-row sm:block">
          <Tooltip
            content={t(($) => $.editor.topBar.blockDisplay)}
            placement="bottom"
            size="sm"
            offset={0}
            delay={300}
            closeDelay={0}
          >
            <FloatingButton
              onClick={() => {
                setOpenedDialog('blockDisplaySelect')
              }}
            >
              <IoCubeOutline size={24} />
            </FloatingButton>
          </Tooltip>

          <Tooltip
            content={t(($) => $.editor.topBar.itemDisplay)}
            placement="bottom"
            size="sm"
            offset={0}
            delay={300}
            closeDelay={0}
          >
            <FloatingButton
              onClick={() => {
                setOpenedDialog('itemDisplaySelect')
              }}
            >
              <TbDiamondFilled size={24} />
            </FloatingButton>
          </Tooltip>

          <Tooltip
            content={t(($) => $.editor.topBar.textDisplay)}
            placement="bottom"
            size="sm"
            offset={0}
            delay={300}
            closeDelay={0}
          >
            <FloatingButton
              onClick={() => {
                useDisplayEntityStore
                  .getState()
                  .createNew([{ kind: 'text', text: 'Enter Text' }])
              }}
            >
              <LuType size={24} />
            </FloatingButton>
          </Tooltip>
        </div>
        {/* Mobile - show dropdown menu for 'Add Display Entity' action */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <FloatingButton className="flex flex-row items-center gap-1 sm:hidden">
              <LuPlus size={24} />
              <LuChevronDown size={16} />
            </FloatingButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="origin-top-left"
          >
            <DropdownMenuItem
              className="flex flex-row items-center gap-2"
              onClick={() => {
                setOpenedDialog('blockDisplaySelect')
              }}
            >
              <IoCubeOutline />
              {t(($) => $.editor.topBar.blockDisplay)}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-row items-center gap-2"
              onClick={() => {
                setOpenedDialog('itemDisplaySelect')
              }}
            >
              <TbDiamondFilled />

              {t(($) => $.editor.topBar.itemDisplay)}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-row items-center gap-2"
              onClick={() => {
                useDisplayEntityStore
                  .getState()
                  .createNew([{ kind: 'text', text: 'Enter Text' }])
              }}
            >
              <LuType />

              {t(($) => $.editor.topBar.textDisplay)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="my-2 border-l border-gray-700" />

        <Tooltip
          content={t(($) => $.editor.topBar.addPlayerHead)}
          placement="bottom"
          size="sm"
          offset={0}
          delay={300}
          closeDelay={0}
        >
          <FloatingButton
            onClick={() => {
              useDisplayEntityStore
                .getState()
                .createNew([{ kind: 'item', type: 'player_head' }])
            }}
          >
            <LuSmile size={24} />
          </FloatingButton>
        </Tooltip>

        <div className="my-2 border-l border-gray-700" />

        <Tooltip
          content={t(($) => $.editor.topBar.duplicate)}
          placement="bottom"
          size="sm"
          offset={0}
          delay={300}
          closeDelay={0}
        >
          <FloatingButton
            onClick={() => useDisplayEntityStore.getState().duplicateSelected()}
          >
            <LuCopyPlus size={24} />
          </FloatingButton>
        </Tooltip>

        <Tooltip
          content={t(($) =>
            singleSelectedEntityIsGrouped
              ? $.editor.topBar.ungroup
              : $.editor.topBar.group,
          )}
          placement="bottom"
          size="sm"
          offset={0}
          delay={300}
          closeDelay={0}
        >
          {singleSelectedEntityIsGrouped ? (
            <FloatingButton onClick={toggleGroup}>
              <LuUngroup size={24} />
            </FloatingButton>
          ) : (
            <FloatingButton onClick={toggleGroup}>
              <LuGroup size={24} />
            </FloatingButton>
          )}
        </Tooltip>

        <Tooltip
          content={t(($) => $.editor.topBar.delete)}
          placement="bottom"
          size="sm"
          offset={0}
          delay={300}
          closeDelay={0}
        >
          <FloatingButton
            onClick={() => {
              deleteEntities(selectedEntityIds)
            }}
          >
            <IoMdTrash size={24} />
          </FloatingButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default TopButtonPanel
