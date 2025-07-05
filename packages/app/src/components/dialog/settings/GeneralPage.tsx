import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'

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
