import type { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'

import Dialog from './Dialog'

const PromptDialog: FC = () => {
  const { isOpen, closeActiveDialog, promptDialogData } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.activeDialog === 'prompt',
      closeActiveDialog: state.closeActiveDialog,
      promptDialogData: state.promptDialogData,
    })),
  )

  const closeDialog = () => {
    promptDialogData.onChoice?.(false)
    closeActiveDialog()
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
            className="rounded-sm bg-blue-500 px-4 py-2"
            onClick={() => {
              promptDialogData.onChoice?.(true)
              closeActiveDialog()
            }}
          >
            {promptDialogData.buttonText.positive}
          </button>
          <button
            className="rounded-sm bg-gray-700 px-4 py-2"
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
