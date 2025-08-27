import Scene from './Scene'
import Sidebar from './Sidebar'
import LeftButtonPanel from './components/LeftButtonPanel'
import MobileBottomButtonPanel from './components/MobileBottomButtonPanel'
import TopButtonPanel from './components/TopButtonPanel'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import ExportToMinecraftDialog from './components/dialog/ExportToMinecraftDialog'
import ItemDisplaySelectDialog from './components/dialog/ItemDisplaySelectDialog'
import SettingsDialog from './components/dialog/SettingsDialog'

function App() {
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

      <SettingsDialog />
      <BlockDisplaySelectDialog />
      <ItemDisplaySelectDialog />
      <ExportToMinecraftDialog />
    </div>
  )
}

export default App
