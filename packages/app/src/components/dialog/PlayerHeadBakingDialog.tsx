import { type FC, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { isItemDisplayPlayerHead } from '@/types'
import type {
  HeadBakerWorkerMessage,
  HeadBakerWorkerResponse,
} from '@/types/workers'

import Dialog from './Dialog'

const PlayerHeadBakingDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'bakingPlayerHeads',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({
    generating: 0,
    error: 0,
    completed: 0,
  })

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
      setTotal(unbakedHeads.length)
      // reset stats
      setStats({
        generating: 0,
        error: 0,
        completed: 0,
      })

      workerRef.current?.postMessage({
        cmd: 'run',
        mineskinApiKey:
          useEditorStore.getState().settings.headPainter.mineskinApiKey,
        heads: unbakedHeads,
      } satisfies HeadBakerWorkerMessage)

      workerRef.current?.addEventListener(
        'message',
        (evt: MessageEvent<HeadBakerWorkerResponse>) => {
          console.log(evt.data)

          if (evt.data.type === 'update') {
            setStats({
              generating: evt.data.stats.generating,
              error: evt.data.stats.error,
              completed: evt.data.stats.completed,
            })
          }
        },
      )
    }
  }, [isOpen])

  return (
    <Dialog
      title="Baking Player Heads..."
      useLargeStaticSize={false}
      // modal
      open={isOpen}
      onClose={() => setOpenedDialog(null)}
    >
      <div>Total: {total}</div>
      <div>Generating: {stats.generating}</div>
      <div>Error: {stats.error}</div>
      <div>Completed: {stats.completed}</div>
    </Dialog>
  )
}

export default PlayerHeadBakingDialog
