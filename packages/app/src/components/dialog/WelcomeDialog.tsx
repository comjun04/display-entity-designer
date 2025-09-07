import { FC, useState } from 'react'
import { LuArchiveRestore, LuFilePlus, LuFolderOpen } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { Disclaimer, SpecialThanks, Title } from '@/components/brandings'
import { newProject } from '@/services/actions'
import AutosaveService from '@/services/autosave'
import { openFromFile } from '@/services/fileService'
import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'

import Dialog from './Dialog'

const WelcomeDialog: FC = () => {
  const { isOpen, setOpenedDialog } = useDialogStore(
    useShallow((state) => ({
      isOpen: state.openedDialog === 'welcome',
      setOpenedDialog: state.setOpenedDialog,
    })),
  )
  const { showWelcomeOnStartup, setSettings } = useEditorStore(
    useShallow((state) => ({
      showWelcomeOnStartup: state.settings.general.showWelcomeOnStartup,
      setSettings: state.setSettings,
    })),
  )

  const autosaveService = AutosaveService.instance

  const [showRecoverSessionSection, setShowRecoverSessionSection] = useState(
    autosaveService.saveExist,
  )

  const closeDialog = () => {
    setShowRecoverSessionSection(false)
    setOpenedDialog(null)
  }

  return (
    <Dialog
      title=""
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
    >
      <div className="flex h-full flex-col gap-2">
        <Title />
        <div className="h-full overflow-y-auto pb-8 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              {/* v1.3.0 */}
              <div className="text-2xl text-sky-200">v{__VERSION__}</div>
              <div className="ml-4 text-sm text-neutral-400">
                <ul className="list-disc">
                  <li>Added Welcome screen - This screen!</li>
                  <li>
                    Improved loading and rendering performance, reducing loading
                    time to half on large projects, and increase FPS when
                    entities are moved offscreen.
                  </li>
                  <li>
                    Now you can undo/redo each edit, allows you to quickly fix
                    wrong move.
                  </li>
                  <li>
                    Added autosave feature, which saves current project to the
                    browser on every 5 edits or 10 seconds after last edit. If
                    you closed the editor without saving, don&apos;t worry -
                    there&apos;s a backup for you.
                  </li>
                  <li>Added menu to create new project.</li>
                  <li>...and several fixes to improve the app!</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <button
                className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
                onClick={() => {
                  closeDialog()
                  newProject()
                }}
              >
                <LuFilePlus size={24} />
                <span>Start with something new</span>
              </button>
              <button
                className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
                onClick={() => {
                  openFromFile()
                  closeDialog()
                }}
              >
                <LuFolderOpen size={24} />
                <span>Open from device</span>
              </button>
              {showRecoverSessionSection && (
                <div className="flex flex-col gap-2 rounded bg-neutral-700 p-4">
                  <div>
                    DEPL was closed without saving. Do you want to recover from
                    autosaved data?
                  </div>

                  <button
                    className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
                    onClick={() => {
                      closeDialog()
                      autosaveService.loadSave().catch(console.error)
                    }}
                  >
                    <LuArchiveRestore size={24} />
                    <span>Recover Project</span>
                  </button>
                  <button
                    className="self-start text-start text-sm underline"
                    onClick={() => {
                      autosaveService.deleteSave()
                      setShowRecoverSessionSection(false)
                    }}
                  >
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-row items-center gap-2">
            <input
              type="checkbox"
              id="settings_showWelcomeOnStartup"
              checked={showWelcomeOnStartup}
              onChange={(evt) => {
                setSettings({
                  general: { showWelcomeOnStartup: evt.target.checked },
                })
              }}
            />
            <label htmlFor="settings_showWelcomeOnStartup">
              Show Welcome on Startup
            </label>
          </div>
          <Disclaimer />
          <SpecialThanks />
        </div>
      </div>
    </Dialog>
  )
}

export default WelcomeDialog
