import { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { cn } from '@/utils'

import Dialog from './Dialog'
import AboutPage from './settings/AboutPage'
import DebugOptionsPage from './settings/DebugOptionsPage'
import GeneralPage from './settings/GeneralPage'
import HeadPainterPage from './settings/HeadPainterPage'
import HotkeysPage from './settings/HotkeysPage'
import PerformancePage from './settings/PerformancePage'

type SettingsPageType =
  | 'general'
  | 'performance'
  | 'hotkeys'
  | 'headPainter'
  | 'about'
  | 'debug'

const SettingsDialog: FC = () => {
  const { t } = useTranslation()

  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'settings',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )

  const [selectedPage, setSelectedPage] = useState<SettingsPageType>('general')

  const closeDialog = () => setOpenedDialog(null)

  return (
    <Dialog
      title={t(($) => $.dialog.settings.title)}
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
    >
      <div className="flex h-full w-full flex-col xs:flex-row">
        {/* Desktop - left side settings submenu list */}
        <div className="hidden w-[30%] border-r-2 border-neutral-700 p-4 xs:block">
          <div className="mt-2 flex flex-col gap-1">
            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'general'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('general')}
            >
              {t(($) => $.dialog.settings.page.general.title)}
            </button>

            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'performance'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('performance')}
            >
              {t(($) => $.dialog.settings.page.performance.title)}
            </button>
            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'hotkeys'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('hotkeys')}
            >
              {t(($) => $.dialog.settings.page.hotkeys.title)}
            </button>
            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'headPainter'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('headPainter')}
            >
              {t(($) => $.dialog.settings.page.headPainter.title)}
            </button>

            <hr className="border-t-2 border-neutral-700" />

            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'about'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('about')}
            >
              {t(($) => $.dialog.settings.page.about.title)}
            </button>
            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'debug'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('debug')}
            >
              {t(($) => $.dialog.settings.page.debugOptions.title)}
            </button>
          </div>
        </div>
        {/* Mobile - submenu <select> element on top */}
        <div className="xs:hidden">
          <select
            className="w-full rounded bg-neutral-900 p-2"
            value={selectedPage}
            onChange={(evt) =>
              setSelectedPage(evt.target.value as SettingsPageType)
            }
          >
            <option value="general">
              {t(($) => $.dialog.settings.page.general.title)}
            </option>
            <option value="performance">
              {t(($) => $.dialog.settings.page.performance.title)}
            </option>
            <option value="hotkeys">
              {t(($) => $.dialog.settings.page.hotkeys.title)}
            </option>
            <option value="headPainter">
              {t(($) => $.dialog.settings.page.headPainter.title)}
            </option>
            <option disabled>----------</option>
            <option value="about">
              {t(($) => $.dialog.settings.page.about.title)}
            </option>
            <option value="debug">
              {t(($) => $.dialog.settings.page.debugOptions.title)}
            </option>
          </select>
        </div>

        <div className="h-full w-full py-4 xs:px-4">
          {/* General */}
          {selectedPage === 'general' && <GeneralPage />}

          {/* Performance */}
          {selectedPage === 'performance' && <PerformancePage />}

          {/* Hotkeys */}
          {selectedPage === 'hotkeys' && <HotkeysPage />}

          {/* Head Painter */}
          {selectedPage === 'headPainter' && <HeadPainterPage />}

          {/* About */}
          {selectedPage === 'about' && <AboutPage />}

          {/* Debug */}
          {selectedPage === 'debug' && <DebugOptionsPage />}
        </div>
      </div>
    </Dialog>
  )
}

export default SettingsDialog
