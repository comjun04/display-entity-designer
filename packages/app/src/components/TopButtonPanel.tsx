import { useDialogStore, useDisplayEntityStore } from '@/store'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useShallow } from 'zustand/shallow'
import FloatingButton from './FloatingButton'
import { IoMdTrash } from 'react-icons/io'
import { LuInfo } from 'react-icons/lu'

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
    <div className="absolute left-0 top-0 z-[5] mt-4 flex w-full justify-center">
      <div className="flex flex-row rounded-lg bg-black">
        <FloatingButton
          onClick={() => {
            setOpenedDialog('blockDisplaySelect')
          }}
        >
          <IoCubeOutline size={24} />
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

        <div className="my-2 border-l border-gray-700" />

        <FloatingButton
          onClick={() => {
            setOpenedDialog('appInfo')
          }}
        >
          <LuInfo size={24} />
        </FloatingButton>
      </div>
    </div>
  )
}

export default TopButtonPanel
