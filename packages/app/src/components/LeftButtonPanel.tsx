import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { FC } from 'react'
import { IoMove } from 'react-icons/io5'
import { LuMenu, LuMoveDiagonal, LuRotate3D } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'

import FloatingButton from './FloatingButton'

const LeftButtonPanel: FC = () => {
  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )
  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({ setOpenedDialog: state.setOpenedDialog })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] ml-4 mt-4 flex flex-col gap-2">
      <Menu>
        <MenuButton as={FloatingButton}>
          <LuMenu size={24} />
        </MenuButton>
        <MenuItems
          transition
          anchor="right start"
          className="z-10 ml-2 flex min-w-64 origin-top-left flex-col rounded-lg bg-neutral-900 p-2 outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <MenuItem>
            <button
              className="rounded-lg px-2 py-1 text-start transition hover:bg-white/10 data-[focus]:bg-white/10"
              onClick={() => setOpenedDialog('exportToMinecraft')}
            >
              <div>Export to Minecraft</div>
              <div className="text-xs text-neutral-500">
                Export this project to Minecraft
              </div>
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="rounded-lg px-2 py-1 text-start transition hover:bg-white/10 data-[focus]:bg-white/10"
              onClick={() => setOpenedDialog('settings')}
            >
              <div>Settings</div>
              <div className="text-xs text-neutral-500">
                Configure the program to your liking
              </div>
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>

      <FloatingButton
        active={mode === 'translate'}
        onClick={() => setMode('translate')}
      >
        <IoMove size={24} />
      </FloatingButton>

      <FloatingButton
        active={mode === 'rotate'}
        onClick={() => setMode('rotate')}
      >
        <LuRotate3D size={24} />
      </FloatingButton>

      <FloatingButton
        active={mode === 'scale'}
        onClick={() => setMode('scale')}
      >
        <LuMoveDiagonal size={24} />
      </FloatingButton>
    </div>
  )
}

export default LeftButtonPanel
