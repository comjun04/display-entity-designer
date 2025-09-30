import { type FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
                  {t(($) => $.dialog.welcome.changeLogs, {
                    returnObjects: true,
                  }).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
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
                <span>{t(($) => $.dialog.welcome.action.new)}</span>
              </button>
              <button
                className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
                onClick={() => {
                  openFromFile()
                  closeDialog()
                }}
              >
                <LuFolderOpen size={24} />
                <span>{t(($) => $.dialog.welcome.action.open)}</span>
              </button>
              {showRecoverSessionSection && (
                <div className="flex flex-col gap-2 rounded bg-neutral-700 p-4">
                  <div>{t(($) => $.dialog.welcome.recoverProject.desc)}</div>

                  <button
                    className="flex flex-row items-center gap-2 rounded bg-neutral-900 px-4 py-2"
                    onClick={() => {
                      closeDialog()
                      autosaveService.loadSave().catch(console.error)
                    }}
                  >
                    <LuArchiveRestore size={24} />
                    <span>
                      {t(($) => $.dialog.welcome.recoverProject.action.recover)}
                    </span>
                  </button>
                  <button
                    className="self-start text-start text-sm underline"
                    onClick={() => {
                      autosaveService.deleteSave()
                      setShowRecoverSessionSection(false)
                    }}
                  >
                    {t(($) => $.dialog.welcome.recoverProject.action.discard)}
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
              {t(($) => $.dialog.welcome.showWelcomeOnStartup)}
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
