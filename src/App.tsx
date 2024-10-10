import Sidebar from './Sidebar'
import Scene from './Scene'
import TopButtonPanel from './components/TopButtonPanel'

function App() {
  return (
    <div className="flex h-full w-full flex-row">
      <div className="relative flex-1 overflow-hidden">
        <Scene />

        {/* floating buttons */}
        <TopButtonPanel />
      </div>

      <Sidebar />
    </div>
  )
}

export default App
