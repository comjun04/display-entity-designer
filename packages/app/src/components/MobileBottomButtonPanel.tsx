import type { FC } from 'react'
import { LuPanelRightOpen } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'

import FullscreenToggle from './FullscreenToggle'

const MobileBottomButtonPanel: FC = () => {
  const { setMobileSidebarOpened } = useEditorStore(
    useShallow((state) => ({
      setMobileSidebarOpened: state.setMobileSidebarOpened,
    })),
  )

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 sm:hidden">
      <FullscreenToggle />
      <button
        className="rounded-lg bg-black p-2"
        onClick={() => setMobileSidebarOpened(true)}
      >
        <LuPanelRightOpen size={24} />
      </button>
    </div>
  )
}

export default MobileBottomButtonPanel
