import { FC } from 'react'
import ObjectsPanel from './components/sidebar/ObjectsPanel'
import PropertiesPanel from './components/sidebar/PropertiesPanel'
import TransformsPanel from './components/sidebar/TransformsPanel'

const Sidebar: FC = () => {
  return (
    <div className="flex w-[400px] flex-col gap-2 p-2">
      <ObjectsPanel />
      <TransformsPanel />
      <PropertiesPanel />
    </div>
  )
}

export default Sidebar
