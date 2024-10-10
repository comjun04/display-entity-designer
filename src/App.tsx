import Sidebar from './Sidebar'
import Scene from './Scene'
import { IoCubeOutline } from 'react-icons/io5'

function App() {
  return (
    <div className="flex h-full w-full flex-row">
      <div className="relative grow">
        <Scene />

        {/* floating buttons */}
        <div className="absolute left-0 top-0 z-[5] mt-4 flex w-full justify-center">
          <button className="rounded-lg bg-black p-2 text-neutral-300">
            <IoCubeOutline size={32} />
          </button>
        </div>
      </div>

      <Sidebar />
    </div>
  )
}

export default App
