import { FC } from 'react'

type XYZInputProps = {
  value: { x: number; y: number; z: number }
  onChange?: (xyz: [number, number, number]) => void
}

const XYZInput: FC<XYZInputProps> = ({ value, onChange }) => {
  const handleChange = (data: { x?: string; y?: string; z?: string }) => {
    onChange?.([
      data.x != null ? (parseInt(data.x) ?? value.x) : value.x,
      data.y != null ? (parseInt(data.y) ?? value.y) : value.y,
      data.z != null ? (parseInt(data.z) ?? value.z) : value.z,
    ])
  }

  return (
    <div className="flex flex-row justify-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <span>X</span>
        <input
          type="number"
          min={0}
          value={value.x}
          onChange={(evt) => handleChange({ x: evt.target.value })}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <input
          type="number"
          min={0}
          value={value.y}
          onChange={(evt) => handleChange({ y: evt.target.value })}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <input
          type="number"
          min={0}
          value={value.z}
          onChange={(evt) => handleChange({ z: evt.target.value })}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
