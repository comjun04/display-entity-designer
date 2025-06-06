import { FC, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'
import { LogLevel } from '@/types'
import { cn } from '@/utils'

import Dialog from './Dialog'

type SettingsPageType = 'hotkeys' | 'programInfo' | 'debug'

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
            <option value="hotkeys">Hotkeys</option>
            <option value="programInfo">Program Info</option>
            <option value="debug">Debug Options</option>
          </select>
        </div>

        <div className="h-full w-full py-4 xs:px-4">
          {/* Hotkeys */}
          {selectedPage === 'hotkeys' && (
            <div>
              <h3 className="text-xl font-bold">Hotkeys</h3>
              <div className="mt-2 text-sm text-neutral-500">
                *Changing hotkeys are not yet supported.
              </div>
              <div className="mt-2">
                <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
                  General
                </div>
                <div className="flex flex-col">
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Open from file</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      Ctrl + O
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Save to file</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      Ctrl + S
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Open Settings</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      Ctrl + ,
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-1">
                <div className="rounded bg-neutral-800 px-3 py-1 text-gray-400">
                  Editor
                </div>
                <div className="flex flex-col">
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Translate mode</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      T
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Rotate mode</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      R
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Scale mode</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      S
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Group/Ungroup</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      G
                    </div>
                  </div>
                  <div className="mt-1 flex flex-row items-center gap-2">
                    <span className="grow px-3">Delete Entity</span>
                    <div className="w-full max-w-[12rem] rounded bg-neutral-700/70 px-2 py-1">
                      Delete
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Program Info */}
          {selectedPage === 'programInfo' && (
            <div>
              <h3 className="text-xl font-bold">Display Entity Platform</h3>
              <div>Graphical editor for Minecraft display entities</div>
              <div className="mt-4 flex flex-row items-center gap-2">
                <span>v{__VERSION__}</span>
                <span className="font-mono">{__COMMIT_HASH__}</span>
                {__IS_DEV__ && <span>(Development Build)</span>}
              </div>

              {/* Disclaimer */}
              <div className="mt-4 text-sm text-neutral-500">
                This website or tool is not an official Minecraft product.
                Minecraft is a trademark of Mojang AB. All rights related to
                Minecraft and its intellectual property are owned by Mojang AB.
              </div>
            </div>
          )}

          {/* Debug */}
          {selectedPage === 'debug' && (
            <div>
              <h3 className="text-xl font-bold">Debug Options</h3>
              <div className="mt-4 flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  id="settings_debug_testoption"
                  checked={settings.debug.testOption}
                  onChange={(evt) => {
                    setSettings({
                      debug: { testOption: evt.target.checked },
                    })
                  }}
                />
                <label htmlFor="settings_debug_testoption">Test Option</label>
              </div>
              <div className="mt-4 flex flex-row items-center gap-2">
                <label htmlFor="settings_debug_minloglevel">
                  Minimum Log Level
                </label>
                <select
                  id="settings_debug_minloglevel"
                  className="flex-none rounded bg-neutral-900 px-2 py-1"
                  value={settings.debug.minLogLevel}
                  onChange={(evt) => {
                    setSettings({
                      debug: { minLogLevel: evt.target.value as LogLevel },
                    })
                  }}
                >
                  <option>error</option>
                  <option>warn</option>
                  <option>info</option>
                  <option>debug</option>
                </select>
              </div>
              <div className="mt-4 flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  id="settings_debug_perfMonitorEnabled"
                  checked={settings.debug.perfMonitorEnabled}
                  onChange={(evt) => {
                    setSettings({
                      debug: { perfMonitorEnabled: evt.target.checked },
                    })
                  }}
                />
                <label htmlFor="settings_debug_perfMonitorEnabled">
                  Enable Performance Monitor
                </label>
              </div>
              <div className="mt-4 flex flex-row items-center gap-2">
                <input
                  type="checkbox"
                  id="settings_debug_alertUncaughtError"
                  checked={settings.debug.alertUncaughtError}
                  onChange={(evt) => {
                    setSettings({
                      debug: { alertUncaughtError: evt.target.checked },
                    })
                  }}
                />
                <label htmlFor="settings_debug_alertUncaughtError">
                  Notify uncaught errors with window.alert()
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}

export default SettingsDialog
