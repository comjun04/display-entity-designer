import { useEditorStore } from '@/store'
import cn from '@/utils'
import { FC } from 'react'
import { IoMove } from 'react-icons/io5'
import { LuMoveDiagonal, LuRotate3D } from 'react-icons/lu'
import { useShallow } from 'zustand/shallow'

const LeftButtonPanel: FC = () => {
  const { mode, setMode } = useEditorStore(
    useShallow((state) => ({
      mode: state.mode,
      setMode: state.setMode,
    })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] ml-4 mt-4 flex flex-col gap-2">
      <button
        className={cn(
          'rounded-lg p-2',
          mode === 'translate'
            ? 'bg-neutral-300 text-black'
            : 'bg-black text-neutral-300',
        )}
        onClick={() => setMode('translate')}
      >
        <IoMove size={32} />
      </button>

      <button
        className={cn(
          'rounded-lg p-2',
          mode === 'rotate'
            ? 'bg-neutral-300 text-black'
            : 'bg-black text-neutral-300',
        )}
        onClick={() => setMode('rotate')}
      >
        <LuRotate3D size={32} />
      </button>

      <button
        className={cn(
          'rounded-lg p-2',
          mode === 'scale'
            ? 'bg-neutral-300 text-black'
            : 'bg-black text-neutral-300',
        )}
        onClick={() => setMode('scale')}
      >
        <LuMoveDiagonal size={32} />
      </button>
    </div>
  )
}

export default LeftButtonPanel
