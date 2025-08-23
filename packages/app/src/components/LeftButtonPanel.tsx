import { Tooltip } from '@heroui/tooltip'
import { FC } from 'react'
import { IoMove } from 'react-icons/io5'
import {
  LuMenu,
  LuMoveDiagonal,
  LuRedo,
  LuRotate3D,
  LuUndo,
} from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

import { openFromFile, saveToFile } from '@/services/fileService'
import { getLogger } from '@/services/loggerService'
import { useDialogStore } from '@/stores/dialogStore'
import { useEditorStore } from '@/stores/editorStore'

import FloatingButton from './FloatingButton'
import MobileDragHoldButton from './MobileDragHoldButton'
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

const logger = getLogger('LeftButtonPanel')

const LeftButtonPanel: FC = () => {
  const { mode, setMode, undoHistory, redoHistory } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
      undoHistory: state.undoHistory,
      redoHistory: state.redoHistory,
    })),
  )
  const { setOpenedDialog } = useDialogStore(
    useShallow((state) => ({ setOpenedDialog: state.setOpenedDialog })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] ml-4 mt-4 flex flex-col items-start gap-2">
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
          className="origin-top-left data-[state=open]:slide-in-from-left-0 sm:min-w-52"
        >
          <DropdownMenuItem className="w-full" onClick={openFromFile}>
            <div className="flex w-full flex-row items-center gap-2 text-sm">
              <span className="grow">Open</span>
              <span className="text-xs text-neutral-500">Ctrl + O</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="w-full"
            onClick={() => {
              saveToFile().catch((...err) => {
                logger.error('Unexpected error when saving to file:', ...err)
              })
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
            <div className="flex w-full flex-row items-center gap-2 text-sm">
              <div className="grow">Settings</div>
              <span className="text-xs text-neutral-500">Ctrl + ,</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-row gap-2">
        <Tooltip content="Undo" placement="right" delay={300} closeDelay={0}>
          <FloatingButton onClick={() => undoHistory()}>
            <LuUndo size={24} />
          </FloatingButton>
        </Tooltip>
        <Tooltip content="Rndo" placement="right" delay={300} closeDelay={0}>
          <FloatingButton onClick={() => redoHistory()}>
            <LuRedo size={24} />
          </FloatingButton>
        </Tooltip>
      </div>

      <Tooltip
        content="Translate mode"
        placement="right"
        delay={300}
        closeDelay={0}
      >
        <FloatingButton
          active={mode === 'translate'}
          onClick={() => setMode('translate')}
        >
          <IoMove size={24} />
        </FloatingButton>
      </Tooltip>

      <Tooltip
        content="Rotate mode"
        placement="right"
        delay={300}
        closeDelay={0}
      >
        <FloatingButton
          active={mode === 'rotate'}
          onClick={() => setMode('rotate')}
        >
          <LuRotate3D size={24} />
        </FloatingButton>
      </Tooltip>

      <Tooltip
        content="Scale mode"
        placement="right"
        delay={300}
        closeDelay={0}
      >
        <FloatingButton
          active={mode === 'scale'}
          onClick={() => setMode('scale')}
        >
          <LuMoveDiagonal size={24} />
        </FloatingButton>
      </Tooltip>

      <div />

      <Tooltip>
        <MobileDragHoldButton />
      </Tooltip>
    </div>
  )
}

export default LeftButtonPanel
