import { useEffect } from 'react'

import Scene from './Scene'
import Sidebar from './Sidebar'
import LeftButtonPanel from './components/LeftButtonPanel'
import MobileBottomButtonPanel from './components/MobileBottomButtonPanel'
import TopButtonPanel from './components/TopButtonPanel'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import ExportToMinecraftDialog from './components/dialog/ExportToMinecraftDialog'
import ItemDisplaySelectDialog from './components/dialog/ItemDisplaySelectDialog'
import SettingsDialog from './components/dialog/SettingsDialog'
import WelcomeDialog from './components/dialog/WelcomeDialog'
import { useDialogStore } from './stores/dialogStore'

function App() {
  useEffect(() => {
    useDialogStore.getState().setOpenedDialog('welcome')
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
      <SettingsDialog />
      <BlockDisplaySelectDialog />
      <ItemDisplaySelectDialog />
      <ExportToMinecraftDialog />
    </div>
  )
}

export default App
