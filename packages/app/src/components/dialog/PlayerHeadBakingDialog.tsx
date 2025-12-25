import { type FC, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { isItemDisplayPlayerHead } from '@/types'
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
      const unbakedHeads = [
        ...useDisplayEntityStore.getState().entities.values(),
      ]
        .map((entity) => {
          const headPixels =
            isItemDisplayPlayerHead(entity) &&
            entity.playerHeadProperties.texture?.baked === false
              ? entity.playerHeadProperties.texture.paintTexturePixels
              : null
          if (headPixels == null) return null

          return {
            entityId: entity.id,
            texturePixels: headPixels,
          }
        })
        .filter((d) => d != null)

      workerRef.current?.postMessage({
        cmd: 'run',
        mineskinApiKey:
          useEditorStore.getState().settings.headPainter.mineskinApiKey,
        heads: unbakedHeads,
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
