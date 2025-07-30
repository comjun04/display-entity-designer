import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import Sketch from '@uiw/react-color-sketch'
import { JSX, forwardRef } from 'react'

import '@/styles/colorpicker-darkmode.css'
import { cn } from '@/utils'

const ColorPickerInput = forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div'] & {
    mode: 'rgb' | 'rgba' | 'argb'
    value: number
    onValueChange?: (value: number) => void
  }
>(({ className, mode, value, onValueChange: onChange, ...props }, ref) => {
  let transformedValue = value
  if (mode === 'argb') {
    // transform input value (ARGB) to RGBA
    const alpha = (value >>> 24) & 0xff
    transformedValue = ((value << 8) | alpha) >>> 0 // ensure unsigned
  }

  const transformedValueHex = transformedValue
    .toString(16)
    .padStart(mode === 'rgb' ? 6 : 8, '0')

  return (
    <div
      {...props}
      className={cn('flex min-w-0 flex-row items-stretch', className)}
      ref={ref}
    >
      <input
        type="text"
        disabled
        className="min-w-0 rounded-l bg-neutral-800 py-1 pl-1 text-xs outline-none"
        value={'#' + transformedValueHex}
      />
      <Popover>
        <PopoverButton
          className="h-full rounded-r border-2 border-neutral-700 px-4"
          style={{
            backgroundColor: `#${transformedValueHex}`,
          }}
        />
        <PopoverPanel
          transition
          anchor="top end"
          className="z-50 transition duration-200 data-[closed]:translate-y-1 data-[closed]:opacity-0"
        >
          <Sketch
            color={transformedValueHex}
            presetColors={false}
            disableAlpha={mode === 'rgb'}
            onChange={(color) => {
              const newColorRGBA = parseInt(color.hexa.slice(1), 16)
              if (mode === 'argb') {
                const alpha = newColorRGBA & 0xff
                const rest = newColorRGBA >>> 8
                const newColorARGB = (rest | (alpha << 24)) >>> 0
                onChange?.(newColorARGB)
              } else if (mode === 'rgb') {
                const newColorRGB = newColorRGBA >>> 8
                onChange?.(newColorRGB)
              } else {
                onChange?.(newColorRGBA)
              }
            }}
          />
        </PopoverPanel>
      </Popover>
    </div>
  )
})
ColorPickerInput.displayName = 'ColorPickerInput'

export { ColorPickerInput }
