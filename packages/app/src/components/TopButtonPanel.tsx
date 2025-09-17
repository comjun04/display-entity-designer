import { Tooltip } from '@heroui/tooltip'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { FaObjectGroup } from 'react-icons/fa6'
import { IoMdTrash } from 'react-icons/io'
import { IoCubeOutline } from 'react-icons/io5'
import { LuSmile, LuType } from 'react-icons/lu'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { toggleGroup } from '@/services/actions'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import FloatingButton from './FloatingButton'

const TopButtonPanel: FC = () => {
  const { t } = useTranslation()

  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { selectedEntityIds, deleteEntities } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
      deleteEntities: state.deleteEntities,
    })),
  )

  return (
    <div className="absolute left-1/2 top-4 z-[5] -translate-x-1/2">
      <div className="flex flex-row rounded-lg bg-black">
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
          content={t(($) => $.editor.topBar.groupOrUngroup)}
          placement="bottom"
          size="sm"
          offset={0}
          delay={300}
          closeDelay={0}
        >
          <FloatingButton onClick={toggleGroup}>
            <FaObjectGroup size={24} />
          </FloatingButton>
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
