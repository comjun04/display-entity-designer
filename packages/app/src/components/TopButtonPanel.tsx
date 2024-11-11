import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useShallow } from 'zustand/shallow'
import FloatingButton from './FloatingButton'
import { IoMdTrash } from 'react-icons/io'
import { TbDiamondFilled } from 'react-icons/tb'

const TopButtonPanel: FC = () => {
  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { selectedEntityId, deleteEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityId: state.selectedEntityId,
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
            if (selectedEntityId != null) {
              deleteEntity(selectedEntityId)
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
