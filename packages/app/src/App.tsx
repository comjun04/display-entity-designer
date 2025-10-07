import { QueryClientProvider } from '@tanstack/react-query'
import { type FC, useEffect } from 'react'

import Scene from './Scene'
import Sidebar from './Sidebar'
import LeftButtonPanel from './components/LeftButtonPanel'
import MobileBottomButtonPanel from './components/MobileBottomButtonPanel'
import QuickActionPanel from './components/QuickActionPanel.tsx'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import ExportToMinecraftDialog from './components/dialog/ExportToMinecraftDialog'
import ItemDisplaySelectDialog from './components/dialog/ItemDisplaySelectDialog'
import PromptDialog from './components/dialog/PromptDialog.tsx'
import SettingsDialog from './components/dialog/SettingsDialog'
import WelcomeDialog from './components/dialog/WelcomeDialog'
import { queryClient } from './query.ts'
import AutosaveService from './services/autosave'
import { useDialogStore } from './stores/dialogStore'
import { useEditorStore } from './stores/editorStore'
import { useProjectStore } from './stores/projectStore.ts'

const BrowserTitleHandler: FC = () => {
  const projectName = useProjectStore((state) => state.projectName)
  const projectDirty = useEditorStore((state) => state.projectDirty)

  useEffect(() => {
    document.title = `${projectDirty ? '● ' : ''}${projectName} - Display Entity Platform`
  }, [projectName, projectDirty])

  return null
}

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
        AutosaveService.instance.forceSave().catch(console.error)
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
    <QueryClientProvider client={queryClient}>
      <div className="relative flex h-full w-full overflow-hidden">
        <div className="relative h-full flex-1 overflow-hidden">
          {/* overflow-hidden is required to prevent child canvas width height from affecting parent div
              and correctly measure parent container size for canvas resizing */}
          <Scene />

          {/* floating buttons */}
          <LeftButtonPanel />
          <QuickActionPanel />
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

      <BrowserTitleHandler />
    </QueryClientProvider>
  )
}

export default App
