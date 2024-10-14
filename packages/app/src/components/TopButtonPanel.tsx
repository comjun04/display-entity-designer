import { useDisplayEntityStore } from '@/store'
import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useShallow } from 'zustand/shallow'
import FloatingButton from './FloatingButton'

const TopButtonPanel: FC = () => {
  const { createNew } = useDisplayEntityStore(
    useShallow((state) => ({
      entities: state.entities,
      createNew: state.createNew,
    })),
  )

  return (
    <div className="absolute left-0 top-0 z-[5] mt-4 flex w-full justify-center">
      <FloatingButton
        onClick={() => {
          createNew()
        }}
      >
        <IoCubeOutline size={24} />
      </FloatingButton>
    </div>
  )
}

export default TopButtonPanel
