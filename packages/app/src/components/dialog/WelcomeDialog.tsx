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

  const closeDialog = () => setOpenedDialog(null)

  return (
    <Dialog
      title=""
      open={isOpen}
      onClose={closeDialog}
      className="relative z-50"
    >
      <div className="flex flex-col">
        <Title />
        <div className="mt-8 flex flex-col gap-2 sm:w-1/2">
          <button
            className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
            onClick={() => {
              closeDialog()
              newProject()
              setShowRecoverSessionSection(false)
            }}
          >
            <LuFilePlus size={24} />
            <span>Start with something new</span>
          </button>
          <button
            className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
            onClick={() => {
              openFromFile()
              setShowRecoverSessionSection(false)
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
                onClick={async () => {
                  closeDialog()
                  await autosaveService.loadSave()
                  setShowRecoverSessionSection(false)
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
    </Dialog>
  )
}

export default WelcomeDialog
