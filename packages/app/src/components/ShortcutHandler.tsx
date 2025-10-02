import { type FC, useEffect } from 'react'

import { toggleGroup } from '@/services/actions'
import { openFromFile, saveToFile } from '@/services/fileService'
import { getLogger } from '@/services/loggerService'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'

const logger = getLogger('ShortcutHandler')

const ShortcutHandler: FC = () => {
  useEffect(() => {
    const focusableElements = ['input', 'textarea']
    const { undoHistory, redoHistory } = useHistoryStore.getState()

    const handler = (evt: KeyboardEvent) => {
      const { openedDialog, setOpenedDialog } = useDialogStore.getState()

      // <input>이나 <textarea>에 focus가 잡혀 있다면 이벤트를 처리하지 않음
      if (
        focusableElements.includes(
          (document.activeElement?.tagName ?? '').toLowerCase(),
        )
      ) {
        return true
      }

      // dialog 창이 열려 있을 떄는 이벤트를 처리하지 않음
      if (openedDialog != null) {
        return true
      }

      const { selectedEntityIds, deleteEntities, duplicateSelected } =
        useDisplayEntityStore.getState()
      const { setMode } = useEditorStore.getState()

      // 단축키 처리
      switch (evt.key) {
        case 't':
          if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            setMode('translate')
          }
          break
        case 'r':
          if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            setMode('rotate')
          }
          break
        case 's':
          if (evt.ctrlKey) {
            evt.preventDefault()
            saveToFile().catch((...err) => {
              logger.error('Unexpected error when saving to file:', ...err)
            })
          } else if (!evt.altKey && !evt.shiftKey) {
            setMode('scale')
          }
          break
        case 'o':
          if (evt.ctrlKey) {
            evt.preventDefault()
            openFromFile()
          }
          break
        case 'd':
          if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            duplicateSelected()
          }
          break
        case 'g':
          if (!evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
            toggleGroup()
          }
          break
        case 'Delete':
          deleteEntities(selectedEntityIds)
          break
        case ',':
          if (evt.ctrlKey) {
            setOpenedDialog('settings')
          }
          break
        case 'z':
          if (evt.ctrlKey) {
            undoHistory()
          }
          break
        case 'y':
          if (evt.ctrlKey) {
            redoHistory()
          }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return null
}

export default ShortcutHandler
