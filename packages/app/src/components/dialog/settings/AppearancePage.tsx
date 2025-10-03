import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

const AppearancePage: FC = () => {
  const { t } = useTranslation()

  return (
    <>
      <h3 className="text-xl font-bold">
        {t(($) => $.dialog.settings.page.appearance.title)}
      </h3>
    </>
  )
}

export default AppearancePage
