import { FC, useEffect } from 'react'

import { openFromFile, saveToFile } from '@/services/fileService'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'

const ShortcutHandler: FC = () => {
  useEffect(() => {
    const focusableElements = ['input', 'textarea']
    const handler = (evt: KeyboardEvent) => {
      const { openedDialog } = useDialogStore.getState()

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

      const { selectedEntityIds, deleteEntities } =
        useDisplayEntityStore.getState()
      const { setMode } = useEditorStore.getState()

      // 단축키 처리
      switch (evt.key) {
        case 't':
          setMode('translate')
          break
        case 'r':
          setMode('rotate')
          break
        case 's':
          if (evt.ctrlKey) {
            evt.preventDefault()
            saveToFile().catch(console.error)
          } else {
            setMode('scale')
          }

          break
        case 'o':
          if (evt.ctrlKey) {
            evt.preventDefault()
            openFromFile()
          }
          break
        case 'Delete':
          deleteEntities(selectedEntityIds)
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return null
}

export default ShortcutHandler
