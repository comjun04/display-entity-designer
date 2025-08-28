import { FC } from 'react'

import { cn } from '@/utils'

interface TitleProps {
  className?: string
}
export const Title: FC<TitleProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2 className="text-3xl">
        <span className="text-sky-200">D</span>isplay{' '}
        <span className="text-sky-200">E</span>ntity{' '}
        <span className="text-sky-200">Pl</span>atform
      </h2>
      <span>Graphical editor for Minecraft Display entities</span>
    </div>
  )
}

interface DisclaimerProps {
  className?: string
}
export const Disclaimer: FC<DisclaimerProps> = ({ className }) => {
  return (
    <div className={cn('mt-4 text-sm text-neutral-500', className)}>
      This website or tool is not an official Minecraft product. Minecraft is a
      trademark of Mojang AB. All rights related to Minecraft and its
      intellectual property are owned by Mojang AB.
    </div>
  )
}
