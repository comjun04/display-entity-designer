import { type FC, useEffect, useMemo } from 'react'

import { toggleGroup } from '@/services/actions'
import { openFromFile, saveToFile } from '@/services/fileService'
import { getLogger } from '@/services/loggerService'
import type { HotkeyKeysEnum } from '@/services/settings'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'

const logger = getLogger('ShortcutHandler')

const SPECIAL_KEYS = ['Control', 'Alt', 'Shift']

const ShortcutHandler: FC = () => {
  const hotkeys = useEditorStore((state) => state.settings.hotkeys)
  // Record<hotkeyValue, hotkeyId[]>
  const shortcutRecord = useMemo(() => {
    const record: Record<string, HotkeyKeysEnum[]> = {}
    for (const [hotkeyId, hotkey] of Object.entries(hotkeys)) {
      if (hotkey == null) continue

      if (hotkey in record) {
        record[hotkey].push(hotkeyId as HotkeyKeysEnum)
      } else {
        record[hotkey] = [hotkeyId as HotkeyKeysEnum]
      }
    }

    return record
  }, [hotkeys])

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

      const hotkeyArr: string[] = []
      if (evt.ctrlKey) {
        hotkeyArr.push('Control')
      }
      if (evt.altKey) {
        hotkeyArr.push('Alt')
      }
      if (evt.shiftKey) {
        hotkeyArr.push('Shift')
      }

      if (!SPECIAL_KEYS.includes(evt.key)) {
        // single alphabetical keys can be detected as uppercase when combined with Shift key
        // so change to lowercase to match with savedata
        hotkeyArr.push(evt.key.length === 1 ? evt.key.toLowerCase() : evt.key)
      }

      const hotkeyStr = hotkeyArr.join(' ')

      const hotkeyAssociatedActions = shortcutRecord[hotkeyStr]
      if (hotkeyAssociatedActions == null) {
        return
      }

      // process shortcut associated action
      for (const action of hotkeyAssociatedActions) {
        switch (action) {
          // general
          case 'general.openFromFile':
            evt.preventDefault()
            openFromFile()
            break
          case 'general.saveToFile':
            evt.preventDefault()
            saveToFile().catch((...err) => {
              logger.error('Unexpected error when saving to file:', ...err)
            })
            break
          case 'general.openSettings':
            setOpenedDialog('settings')
            break
          case 'general.undo':
            undoHistory()
            break
          case 'general.redo':
            redoHistory()
            break

          // editor
          case 'editor.translateMode':
            setMode('translate')
            break
          case 'editor.rotateMode':
            setMode('rotate')
            break
          case 'editor.scaleMode':
            setMode('scale')
            break
          case 'editor.duplicate':
            duplicateSelected()
            break
          case 'editor.groupOrUngroup':
            toggleGroup()
            break
          case 'editor.deleteEntity':
            deleteEntities(selectedEntityIds)
            break

          default:
            logger.warn('unknown shortcut action:', action)
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcutRecord])

  return null
}

export default ShortcutHandler
