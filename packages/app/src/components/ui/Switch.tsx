import { Switch as HeadlessUISwitch } from '@headlessui/react'
import { FC } from 'react'

import { cn } from '@/utils'

type SwitchProps = {
  checked: boolean
  onChange?: (value: boolean) => void
  className?: string
  innerClassName?: string
}

const Switch: FC<SwitchProps> = ({
  checked,
  onChange,
  className,
  innerClassName,
}) => {
  return (
    <HeadlessUISwitch
      checked={checked}
      onChange={onChange}
      className={cn(
        'group relative flex h-6 w-12 cursor-pointer rounded-full bg-white/10 p-1 transition duration-200 ease-in-out data-[checked]:bg-white/50 data-[focus]:outline data-[focus]:outline-white',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block size-4 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-6',
          innerClassName,
        )}
      />
    </HeadlessUISwitch>
  )
}

export default Switch
