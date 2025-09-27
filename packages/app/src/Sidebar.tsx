import type { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import ObjectsPanel from './components/sidebar/ObjectsPanel'
import PropertiesPanel from './components/sidebar/PropertiesPanel'
import TransformsPanel from './components/sidebar/TransformsPanel'
import { useEditorStore } from './stores/editorStore'
import { cn } from './utils'

const Sidebar: FC = () => {
  const { mobileSidebarOpened, setMobileSidebarOpened } = useEditorStore(
    useShallow((state) => ({
      mobileSidebarOpened: state.mobileSidebarOpened,
      setMobileSidebarOpened: state.setMobileSidebarOpened,
    })),
  )

  return (
    <>
      <div
        className={cn(
          'absolute right-0 top-0 z-40 h-full w-full bg-black/50 transition duration-200 sm:hidden',
          mobileSidebarOpened ? 'opacity-1' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileSidebarOpened(false)}
      />
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-[300px] flex-col gap-2 overflow-y-auto bg-neutral-800 p-2 transition duration-200 ease-out xs:static xs:max-w-[400px]',
          !mobileSidebarOpened && 'translate-x-full xs:translate-x-0',
        )}
      >
        <ObjectsPanel />
        <TransformsPanel />
        <PropertiesPanel />
      </div>
    </>
  )
}

export default Sidebar
