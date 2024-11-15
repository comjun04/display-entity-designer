import { Number3Tuple } from '@/types'
import { FC, useCallback, useEffect, useState } from 'react'

type NumberInputProps = {
  value?: number
  allowNegative?: boolean
  onChange?: (num: number) => void
  className?: string
}

type XYZInputProps = {
  value: Number3Tuple
  allowNegative?: boolean
  onChange?: (
    xyz: [number | undefined, number | undefined, number | undefined],
  ) => void
}

const NumberInput: FC<NumberInputProps> = ({
  value,
  allowNegative = false,
  onChange,
  className,
}) => {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    if (localValue.length < 1) return

    const num = Number(localValue)
    if (!isNaN(num) && isFinite(num) && (allowNegative || num > 0)) {
      onChange?.(num)
    }
  }, [localValue, allowNegative, onChange])

  useEffect(() => {
    if (value != null) {
      setLocalValue(value.toString())
    }
  }, [value])

  return (
    <input
      type="number"
      min={allowNegative ? undefined : 0}
      // value={focused ? undefined : value}
      value={localValue}
      onChange={(evt) => setLocalValue(evt.target.value)}
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
  const xUpdateFn = useCallback(
    (num: number) => {
      onChange?.([num, undefined, undefined])
    },
    [onChange],
  )
  const yUpdateFn = useCallback(
    (num: number) => {
      onChange?.([undefined, num, undefined])
    },
    [onChange],
  )
  const zUpdateFn = useCallback(
    (num: number) => {
      onChange?.([undefined, undefined, num])
    },
    [onChange],
  )

  return (
    <div className="flex flex-row justify-stretch gap-2">
      <div className="flex flex-row items-center gap-2">
        <span>X</span>
        <NumberInput
          value={x}
          allowNegative={allowNegative}
          onChange={xUpdateFn}
          className="w-full rounded border-l-4 border-red-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Y</span>
        <NumberInput
          value={y}
          allowNegative={allowNegative}
          onChange={yUpdateFn}
          className="w-full rounded border-l-4 border-green-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span>Z</span>
        <NumberInput
          value={z}
          allowNegative={allowNegative}
          onChange={zUpdateFn}
          className="w-full rounded border-l-4 border-blue-500 bg-neutral-800 py-1 pl-1 text-xs outline-none"
        />
      </div>
    </div>
  )
}

export default XYZInput
