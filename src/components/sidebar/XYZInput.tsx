import { FC, useState } from 'react'

type NumberInputProps = {
  value?: number
  allowNegative?: boolean
  onChange?: (num: number) => void
  className?: string
}

type XYZInputProps = {
  value: { x: number; y: number; z: number }
  allowNegative?: boolean
  onChange?: (xyz: [number, number, number]) => void
}

const NumberInput: FC<NumberInputProps> = ({
  value,
  allowNegative = false,
  onChange,
  className,
}) => {
  const [focused, setFocused] = useState(false)

  return (
    <input
      type="number"
      min={allowNegative ? undefined : 0}
      value={focused ? undefined : value}
      onChange={(evt) => {
        if (evt.target.value.length < 1) return

        const num = Number(evt.target.value)
        if (!isNaN(num) && isFinite(num)) {
          onChange?.(num)
        }
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={className}
    />
  )
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
        <NumberInput
          value={value.x}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([num, value.y, value.z])}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <NumberInput
          value={value.y}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([value.x, num, value.z])}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <NumberInput
          value={value.z}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([value.x, value.y, num])}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
