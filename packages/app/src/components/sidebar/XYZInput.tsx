import { Number3Tuple } from '@/types'
import { FC, useState } from 'react'

type NumberInputProps = {
  value?: number
  allowNegative?: boolean
  onChange?: (num: number) => void
  className?: string
}

type XYZInputProps = {
  value: Number3Tuple
  allowNegative?: boolean
  onChange?: (xyz: Number3Tuple) => void
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
        if (!isNaN(num) && isFinite(num) && (allowNegative || num > 0)) {
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
  const [x, y, z] = value
  return (
    <div className="flex flex-row justify-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <span>X</span>
        <NumberInput
          value={x}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([num, y, z])}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <NumberInput
          value={y}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([x, num, z])}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <NumberInput
          value={z}
          allowNegative={allowNegative}
          onChange={(num) => onChange?.([x, y, num])}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
