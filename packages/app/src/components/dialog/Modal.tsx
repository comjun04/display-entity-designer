import type { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'

import Dialog from './Dialog'

const PromptDialog: FC = () => {
  const { isOpen, modalData, setModalResponse } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.activeDialog === 'modal',
      modalData: state.modalData,
      setModalResponse: state._setModalResponse,
    })),
  )

  const closeDialog = () => {
    setModalResponse(false)
  }

  return (
    <Dialog
      title={modalData.title}
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
      useLargeStaticSize={false}
    >
      <div className="flex flex-col">
        <div>{modalData.content}</div>
        <div className="flex flex-row-reverse gap-2">
          <button
            className="rounded-sm bg-blue-500 px-4 py-2"
            onClick={() => {
              setModalResponse(true)
            }}
          >
            {modalData.buttonText.positive}
          </button>
          <button
            className="rounded-sm bg-gray-700 px-4 py-2"
            onClick={closeDialog}
          >
            {modalData.buttonText.negative}
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default PromptDialog
