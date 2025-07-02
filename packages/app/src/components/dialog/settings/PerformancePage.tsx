import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'

const PerformancePage: FC = () => {
  const { settings, setSettings } = useEditorStore(
    useShallow((state) => ({
      settings: state.settings,
      setSettings: state.setSettings,
    })),
  )

  return (
    <>
      <h3 className="text-xl font-bold">Performance</h3>
      <div className="mt-4 flex flex-row items-center gap-2">
        <input
          type="checkbox"
          id="settings_performance_reducePixelRatio"
          checked={settings.performance.reducePixelRatio}
          onChange={(evt) => {
            setSettings({
              performance: { reducePixelRatio: evt.target.checked },
            })
          }}
        />
        <label htmlFor="settings_performance_reducePixelRatio">
          Reduce Pixel Ratio to 1
        </label>
      </div>
    </>
  )
}

export default PerformancePage
