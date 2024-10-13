import { useEditorStore } from '@/store'
import { FC } from 'react'
import { IoMove } from 'react-icons/io5'
import { LuMoveDiagonal, LuRotate3D } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'
import FloatingButton from './FloatingButton'

const LeftButtonPanel: FC = () => {
  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] ml-4 mt-4 flex flex-col gap-2">
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
