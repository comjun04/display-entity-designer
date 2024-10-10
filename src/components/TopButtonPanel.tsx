import { useDisplayEntityStore } from '@/store'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useShallow } from 'zustand/shallow'

const TopButtonPanel: FC = () => {
  const { createNew } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
      createNew: state.createNew,
    })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] mt-4 flex w-full justify-center">
      <button
        className="rounded-lg bg-black p-2 text-neutral-300"
        onClick={() => {
          createNew()
        }}
      >
        <IoCubeOutline size={32} />
      </button>
    </div>
  )
}

export default TopButtonPanel
