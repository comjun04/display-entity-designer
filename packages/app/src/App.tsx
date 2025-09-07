import { useEffect } from 'react'

import Scene from './Scene'
import Sidebar from './Sidebar'
import LeftButtonPanel from './components/LeftButtonPanel'
import MobileBottomButtonPanel from './components/MobileBottomButtonPanel'
import TopButtonPanel from './components/TopButtonPanel'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import ExportToMinecraftDialog from './components/dialog/ExportToMinecraftDialog'
import ItemDisplaySelectDialog from './components/dialog/ItemDisplaySelectDialog'
import PromptDialog from './components/dialog/PromptDialog.tsx'
import SettingsDialog from './components/dialog/SettingsDialog'
import WelcomeDialog from './components/dialog/WelcomeDialog'
import AutosaveService from './services/autosave'
import { useDialogStore } from './stores/dialogStore'
import { useEditorStore } from './stores/editorStore'

function App() {
  useEffect(() => {
    const { showWelcomeOnStartup } = useEditorStore.getState().settings.general
    if (showWelcomeOnStartup) {
      useDialogStore.getState().setOpenedDialog('welcome')
    }
  }, [])

  useEffect(() => {
    const listener = (evt: BeforeUnloadEvent) => {
      const { projectDirty } = useEditorStore.getState()
      if (projectDirty) {
        AutosaveService.instance.forceSave()
        evt.preventDefault()
        evt.returnValue = 'string' // legacy method to trigger confirmation dialog
      }
    }

    window.addEventListener('beforeunload', listener)
    return () => {
      window.removeEventListener('beforeunload', listener)
    }
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden xs:flex xs:flex-row">
      <div className="relative h-full w-full flex-1">
        <Scene />

        {/* floating buttons */}
        <LeftButtonPanel />
        <TopButtonPanel />
        <MobileBottomButtonPanel />
      </div>

      <Sidebar />

      <WelcomeDialog />
      <PromptDialog />
      <SettingsDialog />
      <BlockDisplaySelectDialog />
      <ItemDisplaySelectDialog />
      <ExportToMinecraftDialog />
    </div>
  )
}

export default App
