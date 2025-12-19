import { type FC, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import type { HeadBakerWorkerMessage } from '@/types/workers'

import Dialog from './Dialog'

const PlayerHeadBakingDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'bakingPlayerHeads',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const workerRef = useRef<Worker>()
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../workers/headBaker.worker.ts', import.meta.url),
      { type: 'module' },
    )
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      workerRef.current?.postMessage({
        cmd: 'run',
        heads: ['asdf'],
      } satisfies HeadBakerWorkerMessage)
    }
  }, [isOpen])

  return (
    <Dialog
      title="Baking Player Heads..."
      useLargeStaticSize={false}
      modal
      open={isOpen}
      onClose={() => setOpenedDialog(null)}
    ></Dialog>
  )
}

export default PlayerHeadBakingDialog
