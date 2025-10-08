import { type FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useEditorStore } from '@/stores/editorStore'
import { cn } from '@/utils'

import { SidePanel, SidePanelContent, SidePanelTitle } from '../SidePanel'
import { ColorPickerInput } from '../ui/ColorPicker'

const HeadPainterPanel: FC = () => {
  const { brushColor, layer } = useEditorStore(
    useShallow((state) => ({
      brushColor: state.headPainter.brushColor,
      layer: state.headPainter.layer,
    })),
  )

  return (
    <SidePanel>
      <SidePanelTitle>Head Painter</SidePanelTitle>
      <SidePanelContent>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <label className="flex-1 text-end">Brush Color</label>
            <ColorPickerInput
              className="flex-1"
              mode="rgb"
              value={brushColor}
              onValueChange={(color) => {
                useEditorStore.getState().headPainter.setBrushColor(color)
              }}
            />
          </div>

          <div className="flex flex-row items-center gap-2">
            <label className="flex-1 text-end">Layer</label>
            <div className="flex flex-1 flex-row gap-1 rounded bg-neutral-700 p-1">
              <button
                className={cn(
                  'rounded px-3 py-1',
                  layer === 'base' && 'bg-blue-500',
                )}
                onClick={() => {
                  useEditorStore.getState().headPainter.setLayer('base')
                }}
              >
                Base
              </button>
              <button
                className={cn(
                  'rounded px-3 py-1',
                  layer === 'second' && 'bg-blue-500',
                )}
                onClick={() => {
                  useEditorStore.getState().headPainter.setLayer('second')
                }}
              >
                Second
              </button>
            </div>
          </div>
        </div>
      </SidePanelContent>
    </SidePanel>
  )
}

export default HeadPainterPanel
