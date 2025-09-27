import { type ButtonHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/utils'

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ children, active = false, className, ...props }, ref) => {
    return (
      <button
        className={cn(
          'rounded-lg p-2 outline-none',
          active ? 'bg-neutral-300 text-black' : 'bg-black text-neutral-300',
          className,
        )}
        {...props}
        ref={ref}
      >
        {children}
      </button>
    )
  },
)
FloatingButton.displayName = 'FloatingButton'

export default FloatingButton
