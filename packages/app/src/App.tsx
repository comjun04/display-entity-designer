import Scene from './Scene'
import Sidebar from './Sidebar'
import LeftButtonPanel from './components/LeftButtonPanel'
import TopButtonPanel from './components/TopButtonPanel'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import ExportToMinecraftDialog from './components/dialog/ExportToMinecraftDialog'
import ItemDisplaySelectDialog from './components/dialog/ItemDisplaySelectDialog'
import SettingsDialog from './components/dialog/SettingsDialog'

function App() {
  return (
    <div className="flex h-full w-full flex-row">
      <div className="relative flex-1 overflow-hidden">
        <Scene />

        {/* floating buttons */}
        <TopButtonPanel />
        <LeftButtonPanel />
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
