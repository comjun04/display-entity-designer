import { cn } from '@/utils'
import { FC, ReactNode } from 'react'

type FloatingButtonProps = {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}

const FloatingButton: FC<FloatingButtonProps> = ({
  children,
  active = false,
  onClick,
}) => {
  return (
    <button
      className={cn(
        'rounded-lg p-2',
        active ? 'bg-neutral-300 text-black' : 'bg-black text-neutral-300',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default FloatingButton
