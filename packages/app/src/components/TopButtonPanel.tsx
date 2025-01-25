import { FC } from 'react'
import { FaObjectGroup } from 'react-icons/fa6'
import { IoMdTrash } from 'react-icons/io'
import { IoCubeOutline } from 'react-icons/io5'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { toggleGroup } from '@/services/actions'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import FloatingButton from './FloatingButton'

const TopButtonPanel: FC = () => {
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
        <FloatingButton
          onClick={() => {
            setOpenedDialog('blockDisplaySelect')
          }}
        >
          <IoCubeOutline size={24} />
        </FloatingButton>
        <FloatingButton
          onClick={() => {
            setOpenedDialog('itemDisplaySelect')
          }}
        >
          <TbDiamondFilled size={24} />
        </FloatingButton>

        <div className="my-2 border-l border-gray-700" />

        <FloatingButton onClick={toggleGroup}>
          <FaObjectGroup size={24} />
        </FloatingButton>
        <FloatingButton
          onClick={() => {
            deleteEntities(selectedEntityIds)
          }}
        >
          <IoMdTrash size={24} />
        </FloatingButton>
      </div>
    </div>
  )
}

export default TopButtonPanel
