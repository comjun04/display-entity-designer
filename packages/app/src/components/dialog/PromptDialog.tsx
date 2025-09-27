import type { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'

import Dialog from './Dialog'

const PromptDialog: FC = () => {
  const { isOpen, setOpenedDialog, promptDialogData } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'prompt',
      setOpenedDialog: state.setOpenedDialog,
      promptDialogData: state.promptDialogData,
    })),
  )

  const closeDialog = () => {
    promptDialogData.onChoice?.(false)
    setOpenedDialog(null)
  }

  return (
    <Dialog
      title={promptDialogData.title}
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
      useLargeStaticSize={false}
    >
      <div className="flex flex-col">
        <div>{promptDialogData.content}</div>
        <div className="flex flex-row-reverse gap-2">
          <button
            className="rounded bg-blue-500 px-4 py-2"
            onClick={() => {
              promptDialogData.onChoice?.(true)
              setOpenedDialog(null)
            }}
          >
            {promptDialogData.buttonText.positive}
          </button>
          <button
            className="rounded bg-gray-700 px-4 py-2"
            onClick={closeDialog}
          >
            {promptDialogData.buttonText.negative}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default PromptDialog
