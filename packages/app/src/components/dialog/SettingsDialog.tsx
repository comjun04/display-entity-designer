import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { FC, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils'

type SettingsPageType = 'hotkeys' | 'programInfo' | 'test'

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
    <Dialog open={isOpen} onClose={closeDialog} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 backdrop-blur-sm duration-200 ease-out data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          transition
          className="flex h-full max-h-[80%] w-full max-w-screen-xl select-none flex-col gap-2 rounded-xl bg-neutral-800 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="flex h-full w-full flex-row">
            <div className="w-[30%] rounded-xl p-4">
              <DialogTitle className="text-xl font-semibold">
                Settings
              </DialogTitle>
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
                    selectedPage === 'test'
                      ? 'bg-neutral-700'
                      : 'hover:bg-neutral-700/50',
                  )}
                  onClick={() => setSelectedPage('test')}
                >
                  test menu
                </button>
              </div>
            </div>

            <div className="h-full w-full rounded-xl bg-neutral-900/70 p-6">
              {/* Hotkeys */}
              {selectedPage === 'hotkeys' && (
                <div>
                  <h3 className="text-2xl font-bold">Hotkeys</h3>
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
                  <h3 className="text-2xl font-bold">
                    Display Entity Platform
                  </h3>
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
                    Minecraft and its intellectual property are owned by Mojang
                    AB.
                  </div>
                </div>
              )}

              {/* test page */}
              {selectedPage === 'test' && (
                <div>
                  <div className="flex flex-row gap-2">
                    <input
                      type="checkbox"
                      id="settings_test_testoption"
                      checked={settings.testOption}
                      onChange={(evt) => {
                        setSettings({ testOption: evt.target.checked })
                      }}
                    />
                    <label htmlFor="settings_test_testoption">
                      Test Option
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default SettingsDialog
