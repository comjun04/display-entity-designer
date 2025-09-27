import type { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { cn } from '@/utils'

interface TitleProps {
  className?: string
}
export const Title: FC<TitleProps> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <div className={className}>
      <h2 className="text-3xl">
        <span className="text-sky-200">D</span>isplay{' '}
        <span className="text-sky-200">E</span>ntity{' '}
        <span className="text-sky-200">Pl</span>atform
      </h2>
      <span>{t(($) => $.branding.desc)}</span>
    </div>
  )
}

interface DisclaimerProps {
  className?: string
}
export const Disclaimer: FC<DisclaimerProps> = ({ className }) => {
  const { t } = useTranslation()

  return (
    <div className={cn('mt-4 text-sm text-neutral-500', className)}>
      {t(($) => $.branding.disclaimer)}
    </div>
  )
}

interface SpecialThanksProps {
  className?: string
}
export const SpecialThanks: FC<SpecialThanksProps> = ({ className }) => {
  return (
    <div className={cn('mt-4 text-sm text-neutral-500', className)}>
      <Trans i18nKey={($) => $.branding.specialThanks} ns="translation">
        Special Thanks to{' '}
        <a
          href="https://github.com/eszesbalint"
          target="_blank"
          className="underline"
          rel="noreferrer"
        >
          Eszes Bálint
        </a>{' '}
        for creating{' '}
        <a
          href="https://github.com/eszesbalint/bdstudio"
          target="_blank"
          className="underline"
          rel="noreferrer"
        >
          BDStudio
        </a>
        , the initial editor of Minecraft display entities, and inspiration of
        this project
      </Trans>
    </div>
  )
}
