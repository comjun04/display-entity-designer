import { FC } from 'react'
import { IoCubeOutline } from 'react-icons/io5'
import { useDisplayEntityStore } from './store'
import { useShallow } from 'zustand/shallow'

const Sidebar: FC = () => {
  const { entities } = useDisplayEntityStore(
    useShallow((state) => ({ entities: state.entities })),
  )

  return (
    <div className="w-[400px] p-1">
      <div className="flex select-none flex-col gap-[2px] bg-neutral-900 p-1 text-sm">
        <span className="font-bold">Objects</span>

        {entities.map((_, idx) => (
          <div
            key={idx}
            className="flex cursor-pointer flex-row items-center gap-1"
          >
            <IoCubeOutline size={16} />
            <span>asdfasdf</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
