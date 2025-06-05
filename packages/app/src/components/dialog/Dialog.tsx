import {
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Dialog as OriginalDialog,
} from '@headlessui/react'
import { FC, ReactNode } from 'react'
import { LuX } from 'react-icons/lu'

import { cn } from '@/utils'

type DialogProps = {
  open: boolean
  onClose?: () => void
  className?: string
  title?: string
  children?: ReactNode
}

const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  className,
  title,
  children,
}) => {
  return (
    <OriginalDialog
      open={open}
      onClose={onClose}
      className={cn('relative z-50', className)}
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 duration-200 ease-out data-[closed]:opacity-0 xs:backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex w-screen items-center justify-center xs:p-4">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-screen-md select-none flex-col gap-2 bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 xs:h-[75vh] xs:rounded-xl"
        >
          <DialogTitle className="flex flex-row items-center">
            <span className="grow text-2xl font-bold">{title}</span>
            <button onClick={onClose}>
              <LuX size={24} />
            </button>
          </DialogTitle>

          {children}
        </DialogPanel>
      </div>
    </OriginalDialog>
  )
}

export default Dialog
