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
  // whether to use large static size for dialog.
  // dialog will be fullscreen on mobile when this is set to true
  useLargeStaticSize?: boolean
  title?: string
  children?: ReactNode
}

const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  className,
  useLargeStaticSize = true,
  title,
  children,
}) => {
  return (
    <OriginalDialog
      open={open}
      onClose={() => onClose?.()}
      className={cn('relative z-50', className)}
    >
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/30 duration-200 ease-out data-[closed]:opacity-0',
          useLargeStaticSize ? 'xs:backdrop-blur-sm' : 'backdrop-blur-sm',
        )}
      />

      <div
        className={cn(
          'fixed inset-0 flex w-screen items-center justify-center',
          useLargeStaticSize ? 'xs:p-4' : 'p-4',
        )}
      >
        <DialogPanel
          transition
          className={cn(
            'flex w-full max-w-screen-md select-none flex-col gap-2 bg-neutral-800 p-4 duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0',
            useLargeStaticSize
              ? 'h-full xs:h-[75vh] xs:rounded-xl'
              : 'rounded-xl',
          )}
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
