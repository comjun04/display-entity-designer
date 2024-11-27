import { FC } from 'react'
import { IoMdTrash } from 'react-icons/io'
import { IoCubeOutline } from 'react-icons/io5'
import { TbDiamondFilled } from 'react-icons/tb'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import FloatingButton from './FloatingButton'

const TopButtonPanel: FC = () => {
  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { selectedEntityIds, deleteEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
      deleteEntity: state.deleteEntity,
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

        <FloatingButton
          onClick={() => {
            if (selectedEntityIds.length > 0) {
              selectedEntityIds.forEach(deleteEntity)
            }
          }}
        >
          <IoMdTrash size={24} />
        </FloatingButton>
      </div>
    </div>
  )
}

export default TopButtonPanel
