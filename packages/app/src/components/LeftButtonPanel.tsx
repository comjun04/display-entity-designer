import { FC } from 'react'
import { IoMove } from 'react-icons/io5'
import { LuMenu, LuMoveDiagonal, LuRotate3D } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { openFromFile, saveToFile } from '@/services/fileService'
import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'

import FloatingButton from './FloatingButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './ui/DropdownMenu'

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <FloatingButton>
            <LuMenu size={24} />
          </FloatingButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="right"
          sideOffset={10}
          align="start"
          className="data-[state=open]:slide-in-from-left-0 min-w-52 origin-top-left p-2"
        >
          <DropdownMenuItem
            className="w-full"
            onClick={() => {
              const inputElement = document.createElement('input')
              inputElement.type = 'file'
              inputElement.onchange = (evt) => {
                const file = (evt.target as HTMLInputElement).files?.[0]
                if (file == null) {
                  return
                }

                openFromFile(file).catch(console.error)
              }

              inputElement.click()
            }}
          >
            <div className="flex w-full flex-row items-center gap-2 text-sm">
              <span className="grow">Open</span>
              <span className="text-xs text-neutral-500">Ctrl + O</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full"
            onClick={() => {
              saveToFile().catch(console.error)
            }}
          >
            <div className="flex w-full flex-row items-center gap-2 text-sm">
              <span className="grow">Save</span>
              <span className="text-xs text-neutral-500">Ctrl + S</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export to...</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="block"
                onClick={() => setOpenedDialog('exportToMinecraft')}
              >
                <div className="text-sm">Minecraft</div>
                <div className="text-xs text-neutral-500">
                  Export this project to Minecraft
                </div>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            className="w-full"
            onClick={() => setOpenedDialog('settings')}
          >
            <div className="text-sm">Settings</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
