import { FC } from 'react'

type XYZInputProps = {
  value: { x: number; y: number; z: number }
  allowNegative?: boolean
  onChange?: (xyz: [number, number, number]) => void
}

const XYZInput: FC<XYZInputProps> = ({
  value,
  allowNegative = false,
  onChange,
}) => {
  return (
    <div className="flex flex-row justify-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <span>X</span>
        <input
          type="number"
          min={allowNegative ? undefined : 0}
          value={value.x}
          onChange={(evt) => {
            const num = Number(evt.target.value)
            if (!isNaN(num) && isFinite(num)) {
              onChange?.([num, value.y, value.z])
            }
          }}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <input
          type="number"
          min={allowNegative ? undefined : 0}
          value={value.y}
          onChange={(evt) => {
            const num = Number(evt.target.value)
            if (!isNaN(num) && isFinite(num)) {
              onChange?.([value.x, num, value.z])
            }
          }}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <input
          type="number"
          min={allowNegative ? undefined : 0}
          value={value.z}
          onChange={(evt) => {
            const num = Number(evt.target.value)
            if (!isNaN(num) && isFinite(num)) {
              onChange?.([value.x, value.y, num])
            }
          }}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
