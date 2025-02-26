import { JSX, forwardRef, useEffect, useState } from 'react'

import { cn } from '@/utils'

const ColorPickerInput = forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div'] & {
    onValueChange?: (value: number) => void
  }
>(({ className, onValueChange: onChange, ...props }, ref) => {
  const [localValue, setLocalValue] = useState('#000000')
  const [acceptedValue, setAcceptedValue] = useState('#000000')

  useEffect(() => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(localValue)) return
    setAcceptedValue(localValue)
  }, [localValue])

  useEffect(() => {
    const num = parseInt(acceptedValue.slice(1), 16)
    onChange?.(num)
  }, [acceptedValue, onChange])

  return (
    <div {...props} className={cn('flex flex-row', className)} ref={ref}>
      <input
        type="text"
        maxLength={7}
        className="grow rounded-l bg-neutral-800 py-1 pl-1 text-xs outline-none"
        value={localValue}
        onChange={(evt) => {
          const newLocalValue = evt.target.value.startsWith('#')
            ? evt.target.value
            : '#'
          setLocalValue(newLocalValue)
        }}
      />
      <input
        type="color"
        className="h-6 rounded-r border-2 border-neutral-600"
        value={acceptedValue}
        onChange={(evt) => {
          setLocalValue(evt.target.value)
          setAcceptedValue(evt.target.value)
        }}
      />
    </div>
  )
})
ColorPickerInput.displayName = 'ColorPickerInput'

export { ColorPickerInput }
