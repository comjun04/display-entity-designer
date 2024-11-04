import Sidebar from './Sidebar'
import Scene from './Scene'
import TopButtonPanel from './components/TopButtonPanel'
import LeftButtonPanel from './components/LeftButtonPanel'
import BlockDisplaySelectDialog from './components/dialog/BlockDisplaySelectDialog'
import AppInfoDialog from './components/dialog/AppInfoDialog'

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

      <AppInfoDialog />
      <BlockDisplaySelectDialog />
    </div>
  )
}

export default App
