import { FC, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'
import { LogLevel } from '@/types'
import { cn } from '@/utils'

import Dialog from './Dialog'
import DebugOptionsPage from './settings/DebugOptionsPage'
import HotkeysPage from './settings/HotkeysPage'
import PerformancePage from './settings/PerformancePage'
import ProgramInfoPage from './settings/ProgramInfoPage'

type SettingsPageType = 'performance' | 'hotkeys' | 'programInfo' | 'debug'

const SettingsDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'settings',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { settings, setSettings } = useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  )

  const [selectedPage, setSelectedPage] =
    useState<SettingsPageType>('programInfo')

  const closeDialog = () => setOpenedDialog(null)

  return (
    <Dialog
      title="Settings"
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
                selectedPage === 'performance'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('performance')}
            >
              Performance
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
              Hotkeys
            </button>
            <button
              className={cn(
                'w-full rounded px-2 py-1 text-start text-sm transition duration-150',
                selectedPage === 'programInfo'
                  ? 'bg-neutral-700'
                  : 'hover:bg-neutral-700/50',
              )}
              onClick={() => setSelectedPage('programInfo')}
            >
              Program Info
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
              Debug Options
            </button>
          </div>
        </div>
        {/* Mobile - submenu <select> element on top */}
        <div className="xs:hidden">
          <select
            className="w-full rounded bg-neutral-900 p-2"
            value={selectedPage}
            onChange={(evt) => setSelectedPage(evt.target.value)}
          >
            <option value="performance">Performance</option>
            <option value="hotkeys">Hotkeys</option>
            <option value="programInfo">Program Info</option>
            <option value="debug">Debug Options</option>
          </select>
        </div>

        <div className="h-full w-full py-4 xs:px-4">
          {/* Hotkeys */}
          {selectedPage === 'performance' && <PerformancePage />}

          {/* Hotkeys */}
          {selectedPage === 'hotkeys' && <HotkeysPage />}

          {/* Program Info */}
          {selectedPage === 'programInfo' && <ProgramInfoPage />}

          {/* Debug */}
          {selectedPage === 'debug' && <DebugOptionsPage />}
        </div>
      </div>
    </Dialog>
  )
}

export default SettingsDialog
