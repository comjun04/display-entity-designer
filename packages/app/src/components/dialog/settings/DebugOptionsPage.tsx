import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'
import type { LogLevel } from '@/types'

const DebugOptionsPage: FC = () => {
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
        {t(($) => $.dialog.settings.page.debugOptions.title)}
      </h3>
      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_debug_testoption"
          checked={settings.debug.testOption}
          onChange={(evt) => {
            setSettings({
              debug: { testOption: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_debug_testoption">
          {t(
            ($) => $.dialog.settings.page.debugOptions.options.testOption.title,
          )}
        </label>
      </div>
      <div className="mt-4 flex flex-row items-center gap-2">
        <label htmlFor="settings_debug_minloglevel">
          {t(
            ($) =>
              $.dialog.settings.page.debugOptions.options.minLogLevel.title,
          )}
        </label>
        <select
          id="settings_debug_minloglevel"
          className="flex-none rounded bg-neutral-900 px-2 py-1"
          value={settings.debug.minLogLevel}
          onChange={(evt) => {
            setSettings({
              debug: { minLogLevel: evt.target.value as LogLevel },
            })
          }}
        >
          <option>error</option>
          <option>warn</option>
          <option>info</option>
          <option>debug</option>
        </select>
      </div>
      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_debug_perfMonitorEnabled"
          checked={settings.debug.perfMonitorEnabled}
          onChange={(evt) => {
            setSettings({
              debug: { perfMonitorEnabled: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_debug_perfMonitorEnabled">
          {t(
            ($) =>
              $.dialog.settings.page.debugOptions.options.perfMonitorEnabled
                .title,
          )}
        </label>
      </div>
      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_debug_alertUncaughtError"
          checked={settings.debug.alertUncaughtError}
          onChange={(evt) => {
            setSettings({
              debug: { alertUncaughtError: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_debug_alertUncaughtError">
          {t(
            ($) =>
              $.dialog.settings.page.debugOptions.options.alertUncaughtError
                .title,
          )}
        </label>
      </div>
    </>
  )
}

export default DebugOptionsPage
