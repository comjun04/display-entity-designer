import { useSet } from '@react-hookz/web'
import {
  type FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

import type { Settings } from '@/services/settings'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils'

const SPECIAL_KEYS = ['Control', 'Alt', 'Shift']
const BLOCKED_KEYS = ['Unidentified']
function isValidKeyCombo(keys: string[]) {
  return (
    keys.some((key) => !SPECIAL_KEYS.includes(key)) &&
    keys.every((key) => !BLOCKED_KEYS.includes(key))
  )
}

const ShortcutSettingsContext = createContext<{
  currentlyEditingKeyId: string | null
  setCurrentlyEditingKeyId: (newKey: string | null) => void
}>({
  currentlyEditingKeyId: null,
  setCurrentlyEditingKeyId: () => {},
})

interface ShortcutKeyInputProps {
  id: keyof Settings['shortcuts']
}
const ShortcutKeyInput: FC<ShortcutKeyInputProps> = ({ id }) => {
  const rawKeysStr = useEditorStore((state) => state.settings.shortcuts[id])
  const shortcutUnset = rawKeysStr == null

  const { currentlyEditingKeyId, setCurrentlyEditingKeyId } = useContext(
    ShortcutSettingsContext,
  )
  const editMode = currentlyEditingKeyId === id

  const pressedKeys = useSet<string>()

  const keyList = editMode
    ? [...pressedKeys.values()]
    : (rawKeysStr ?? '').split(' ')
  const validKeyCombination = isValidKeyCombo(keyList)
  const formattedKeysStr = keyList
    .map((rawKey) => {
      if (rawKey === 'Control') {
        return 'Ctrl'
      }
      if (rawKey.length === 1) {
        // print single-character keys like alphabets as uppercase
        return rawKey.toUpperCase()
      }

      return rawKey
    })
    .join(' ')

  const saveChanges = useCallback(() => {
    const newKeys = [...pressedKeys.values()].map((key) => {
      if (key.length === 1) {
        return key.toLowerCase()
      }

      return key
    })
    if (newKeys.length > 0 && !isValidKeyCombo(newKeys)) {
      return false
    }

    const newKeysStr = newKeys.length > 0 ? newKeys.join(' ') : null
    useEditorStore.getState().setSettings({
      shortcuts: {
        [id]: newKeysStr,
      },
    })

    return true
  }, [id, pressedKeys])

  useEffect(() => {
    // pre-fill pressedKeys with current value
    // to avoid flickering between editMode change and this effect run
    if (!editMode) {
      pressedKeys.clear()
      if (rawKeysStr != null) {
        rawKeysStr.split(' ').forEach((key) => {
          pressedKeys.add(key)
        })
      }
    }
  }, [editMode, pressedKeys, rawKeysStr])

  // detect key input on edit mode
  useEffect(() => {
    const handler = (evt: KeyboardEvent) => {
      if (!editMode) return

      if (evt.key === 'Enter') {
        if (saveChanges()) {
          // if save successful, exit edit mode
          setCurrentlyEditingKeyId(null)
        }
        return
      } else if (evt.key === 'Escape') {
        // discard changes
        setCurrentlyEditingKeyId(null)
        return
      }

      pressedKeys.clear()
      if (evt.ctrlKey) {
        pressedKeys.add('Control')
      }
      if (evt.altKey) {
        pressedKeys.add('Alt')
      }
      if (evt.shiftKey) {
        pressedKeys.add('Shift')
      }
      pressedKeys.add(evt.key)
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [editMode, pressedKeys, setCurrentlyEditingKeyId, saveChanges])

  return (
    <div
      className={cn(
        'w-full max-w-[12rem] rounded border-2 border-transparent bg-neutral-700/70 px-2 py-1 transition',
        editMode && 'border-neutral-400',
        shortcutUnset && 'italic text-gray-500',
        !validKeyCombination && 'bg-red-500/30',
      )}
      onClick={() => {
        if (editMode) {
          saveChanges()
        }
        setCurrentlyEditingKeyId(editMode ? null : id)
      }}
    >
      {shortcutUnset ? 'unset' : formattedKeysStr}
    </div>
  )
}

const ShortcutsPage: FC = () => {
  const { t } = useTranslation()

  const [currentlyEditingKey, setCurrentlyEditingKey] = useState<string | null>(
    null,
  )

  return (
    <ShortcutSettingsContext.Provider
      value={{
        currentlyEditingKeyId: currentlyEditingKey,
        setCurrentlyEditingKeyId: setCurrentlyEditingKey,
      }}
    >
      <h3 className="text-xl font-bold">
        {t(($) => $.dialog.settings.page.shortcuts.title)}
      </h3>
      <div className="mt-2 text-sm text-neutral-500">
        {t(
          ($) => $.dialog.settings.page.shortcuts.changingShortcutNotSupported,
        )}
      </div>
      <div className="mt-2">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          {t(($) => $.dialog.settings.page.shortcuts.categories.general.title)}
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.general.items
                    .openFromFile,
              )}
            </span>
            <ShortcutKeyInput id="general.openFromFile" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.general.items
                    .saveToFile,
              )}
            </span>
            <ShortcutKeyInput id="general.saveToFile" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.general.items
                    .openSettings,
              )}
            </span>
            <ShortcutKeyInput id="general.openSettings" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.general.items
                    .undo,
              )}
            </span>
            <ShortcutKeyInput id="general.undo" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.general.items
                    .redo,
              )}
            </span>
            <ShortcutKeyInput id="general.redo" />
          </div>
        </div>
      </div>
      <div className="mt-1">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          {t(($) => $.dialog.settings.page.shortcuts.categories.editor.title)}
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .translateMode,
              )}
            </span>
            <ShortcutKeyInput id="editor.translateMode" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .rotateMode,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              R
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .scaleMode,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              S
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .duplicate,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              D
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .groupOrUngroup,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              G
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.shortcuts.categories.editor.items
                    .deleteEntity,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Delete
            </div>
          </div>
        </div>
      </div>
    </ShortcutSettingsContext.Provider>
  )
}

export default ShortcutsPage
