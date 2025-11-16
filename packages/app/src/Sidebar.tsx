import { type FC, useEffect, useState } from 'react'
import { LuEllipsisVertical } from 'react-icons/lu'
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

  const [desktopSidebarWidth, setDesktopSidebarWidth] = useState(400)
  const [handlerDragging, setHandlerDragging] = useState(false)

  useEffect(() => {
    const handlePointerMove = (evt: PointerEvent) => {
      setDesktopSidebarWidth(document.body.clientWidth - evt.clientX)
    }
    const handlePointerUp = () => {
      setHandlerDragging(false)
    }

    if (handlerDragging) {
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
    } else {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [handlerDragging])

  return (
    <>
      {/* backdrop, used when sidebar shows like overlay (mobile) */}
      <div
        className={cn(
          'absolute right-0 top-0 z-40 h-full w-full bg-black/50 transition duration-200 sm:hidden',
          mobileSidebarOpened ? 'opacity-1' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileSidebarOpened(false)}
      />

      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-[300px] bg-neutral-800 p-2 transition duration-200 ease-out sm:relative sm:max-w-none',
          !mobileSidebarOpened && 'translate-x-full sm:translate-x-0',
        )}
        style={{
          width: desktopSidebarWidth,
        }}
      >
        {/* sidebar resize handler */}
        <div
          className="fixed left-0 top-[20%] hidden h-12 w-3 -translate-x-3 cursor-ew-resize touch-none flex-col items-center justify-center rounded-l-lg bg-neutral-900 text-gray-500 sm:flex"
          onPointerDownCapture={() => {
            setHandlerDragging(true)
          }}
          onPointerUpCapture={() => {
            setHandlerDragging(false)
          }}
        >
          <LuEllipsisVertical />
        </div>

        <div className="flex h-full flex-col gap-2 overflow-y-auto">
          <ObjectsPanel />
          <TransformsPanel />
          <PropertiesPanel />
        </div>
      </div>
    </>
  )
}

export default Sidebar
