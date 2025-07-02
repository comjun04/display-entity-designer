import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'
import { LogLevel } from '@/types'

const DebugOptionsPage: FC = () => {
  const { settings, setSettings } = useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  )

  return (
    <>
      <h3 className="text-xl font-bold">Debug Options</h3>
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
        <label htmlFor="settings_debug_testoption">Test Option</label>
      </div>
      <div className="mt-4 flex flex-row items-center gap-2">
        <label htmlFor="settings_debug_minloglevel">Minimum Log Level</label>
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
          Enable Performance Monitor
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
          Notify uncaught errors with window.alert()
        </label>
      </div>
    </>
  )
}

export default DebugOptionsPage
