import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'

const AppearancePage: FC = () => {
  const { t } = useTranslation()

  const { settings, setSettings } = useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  )

  return (
    <>
      <h3 className="text-xl font-bold">
        {t(($) => $.dialog.settings.page.appearance.title)}
      </h3>

      <div className="mt-4 flex flex-col gap-2">
        <div className="text-lg font-bold">
          {t(
            ($) =>
              $.dialog.settings.page.appearance.sections.quickActionPanel.title,
          )}
        </div>
        <div className="flex flex-row items-center gap-2">
          <label htmlFor="settings_appearance_quickActionPanel_location">
            {t(
              ($) =>
                $.dialog.settings.page.appearance.sections.quickActionPanel
                  .options.location.title,
            )}
          </label>
          <select
            id="settings_appearance_quickActionPanel_location"
            className="flex-none rounded bg-neutral-900 px-2 py-1"
            value={settings.appearance.quickActionPanel.location}
            onChange={(evt) => {
              setSettings({
                appearance: {
                  quickActionPanel: {
                    location: evt.target
                      .value as Settings['appearance']['quickActionPanel']['location'],
                  },
                },
              })
            }}
          >
            <option value="top">
              {t(
                ($) =>
                  $.dialog.settings.page.appearance.sections.quickActionPanel
                    .options.location.values.top,
              )}
            </option>
            <option value="bottom">
              {t(
                ($) =>
                  $.dialog.settings.page.appearance.sections.quickActionPanel
                    .options.location.values.bottom,
              )}
            </option>
          </select>
        </div>
      </div>
    </>
  )
}

export default AppearancePage
