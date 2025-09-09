import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { Settings, useEditorStore } from '@/stores/editorStore'

const GeneralPage: FC = () => {
  const { settings, setSettings } = useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  )

  return (
    <>
      <h3 className="text-xl font-bold">General</h3>

      <div className="mt-4 flex flex-row items-center gap-2">
        <label htmlFor="settings_general_language">Language</label>
        <select
          id="settings_general_language"
          className="flex-none rounded bg-neutral-900 px-2 py-1"
          value={settings.general.language}
          onChange={(evt) => {
            setSettings({
              general: {
                language: evt.target.value as Settings['general']['language'],
              },
            })
          }}
        >
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>

      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_general_showWelcomeOnStartup"
          checked={settings.general.showWelcomeOnStartup}
          onChange={(evt) => {
            setSettings({
              general: { showWelcomeOnStartup: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_general_showWelcomeOnStartup">
          Show Welcome on Startup
        </label>
      </div>

      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_general_forceUnifont"
          checked={settings.general.forceUnifont}
          onChange={(evt) => {
            setSettings({
              general: { forceUnifont: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_general_forceUnifont">
          Force Unicode font (Unifont)
        </label>
      </div>
    </>
  )
}

export default GeneralPage
