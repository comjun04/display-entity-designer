import { FC } from 'react'
import { useTranslation } from 'react-i18next'

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
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + O
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items
                    .saveToFile,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + S
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items
                    .openSettings,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + ,
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items.undo,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + Z
            </div>
          </div>
          <div className="mt-1 flex flex-row items-center gap-2">
            <span className="grow px-3">
              {t(
                ($) =>
                  $.dialog.settings.page.hotkeys.categories.general.items.redo,
              )}
            </span>
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              Ctrl + Y
            </div>
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
            <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
              T
            </div>
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
