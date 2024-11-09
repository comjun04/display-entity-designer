import { cn } from '@/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const FloatingButton = forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ children, active = false, onClick }, ref) => {
    return (
      <button
        className={cn(
          'rounded-lg p-2 outline-none',
          active ? 'bg-neutral-300 text-black' : 'bg-black text-neutral-300',
        )}
        onClick={onClick}
        ref={ref}
      >
        {children}
      </button>
    )
  },
)
FloatingButton.displayName = 'FloatingButton'

export default FloatingButton
