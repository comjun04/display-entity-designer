import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

import type { Settings } from '@/services/settings'
import { useEditorStore } from '@/stores/editorStore'

interface HotkeyInputProps {
  id: keyof Settings['hotkeys']
}
const HotkeyInput: FC<HotkeyInputProps> = ({ id }) => {
  const rawKeysStr = useEditorStore((state) => state.settings.hotkeys[id])

  const formattedKeysStr = rawKeysStr
    .split(' ')
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

  return (
    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
      {formattedKeysStr}
    </div>
  )
}

const HotkeysPage: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <h3 className="text-xl font-bold">
        {t(($) => $.dialog.settings.page.hotkeys.title)}
      </h3>
      <div className="mt-2 text-sm text-neutral-500">
        {t(($) => $.dialog.settings.page.hotkeys.changingHotkeyNotSupported)}
      </div>
      <div className="mt-2">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          {t(($) => $.dialog.settings.page.hotkeys.categories.general.title)}
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items
                    .openFromFile,
              )}
            </span>
            <HotkeyInput id="general.openFromFile" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items
                    .saveToFile,
              )}
            </span>
            <HotkeyInput id="general.saveToFile" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items
                    .openSettings,
              )}
            </span>
            <HotkeyInput id="general.openSettings" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items.undo,
              )}
            </span>
            <HotkeyInput id="general.undo" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items.redo,
              )}
            </span>
            <HotkeyInput id="general.redo" />
          </div>
        </div>
      </div>
      <div className="mt-1">
        <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
          {t(($) => $.dialog.settings.page.hotkeys.categories.editor.title)}
        </div>
        <div className="flex flex-col">
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.editor.items
                    .translateMode,
              )}
            </span>
            <HotkeyInput id="editor.translateMode" />
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.editor.items
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
                  $.dialog.settings.page.hotkeys.categories.editor.items
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
                  $.dialog.settings.page.hotkeys.categories.editor.items
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
                  $.dialog.settings.page.hotkeys.categories.editor.items
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
                  $.dialog.settings.page.hotkeys.categories.editor.items
                    .deleteEntity,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Delete
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default HotkeysPage
