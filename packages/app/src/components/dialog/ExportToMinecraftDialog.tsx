import { useDialogStore } from '@/store'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

const ExportToMinecraftDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'exportToMinecraft',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const closeDialog = () => setOpenedDialog(null)

  return (
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-sm duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="flex w-full max-w-screen-md select-none flex-col gap-2 rounded-xl bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-2xl font-bold">
            Export To Minecraft
          </DialogTitle>

          <textarea
            className="h-24 resize-none rounded-lg p-2 outline-none"
            readOnly
            value="/summon block_display ~ ~ ~" // test string
          />
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default ExportToMinecraftDialog
