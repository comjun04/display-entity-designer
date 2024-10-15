import { useDialogStore } from '@/store'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

const BlockDisplaySelectDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'blockDisplaySelect',
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
          className="h-[75vh] w-full max-w-screen-md space-y-2 rounded-xl bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <DialogTitle className="text-2xl font-bold">
            Add Block Display
          </DialogTitle>

          <div className="flex flex-row items-center gap-4">
            <span>Search</span>
            <input
              type="text"
              className="grow rounded px-2 py-1 text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 rounded-lg p-1">
            <button className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50">
              test_block_name
            </button>
            <button className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50">
              smooth_stone
            </button>
            <button className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50">
              structure_block
            </button>
            <button className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50">
              bedrock
            </button>
            <button className="rounded-lg bg-neutral-700 p-1 text-center text-xs transition duration-150 hover:bg-neutral-700/50">
              asdfasdf
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default BlockDisplaySelectDialog
