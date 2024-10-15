import { useDialogStore } from '@/store'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useShallow } from 'zustand/shallow'
import FloatingButton from './FloatingButton'

const TopButtonPanel: FC = () => {
  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] mt-4 flex w-full justify-center">
      <FloatingButton
        onClick={() => {
          setOpenedDialog('blockDisplaySelect')
        }}
      >
        <IoCubeOutline size={24} />
      </FloatingButton>
    </div>
  )
}

export default TopButtonPanel
