import { FC } from 'react'
import ObjectsPanel from './components/sidebar/ObjectsPanel'

const Sidebar: FC = () => {
  return (
    <div className="w-[400px] p-1">
      <ObjectsPanel />
    </div>
  )
}

export default Sidebar
