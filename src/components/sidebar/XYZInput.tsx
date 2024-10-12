import { FC } from 'react'

const XYZInput: FC = () => {
  return (
    <div className="flex flex-row justify-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <span>X</span>
        <input
          type="number"
          min={0}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <input
          type="number"
          min={0}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <input
          type="number"
          min={0}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
