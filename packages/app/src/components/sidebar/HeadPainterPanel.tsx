import { type FC } from 'react'

import { useEditorStore } from '@/stores/editorStore'

import { SidePanel, SidePanelContent, SidePanelTitle } from '../SidePanel'
import { ColorPickerInput } from '../ui/ColorPicker'

const HeadPainterPanel: FC = () => {
  const brushColor = useEditorStore((state) => state.headPainter.brushColor)

  return (
    <SidePanel>
      <SidePanelTitle>Head Painter</SidePanelTitle>
      <SidePanelContent>
        <div className="flex flex-row items-center gap-2">
          <label className="flex-1 text-end">Brush Color</label>
          <ColorPickerInput
            className="flex-[2]"
            mode="rgb"
            value={brushColor}
            onValueChange={(color) => {
              useEditorStore.getState().headPainter.setBrushColor(color)
            }}
          />
        </div>
      </SidePanelContent>
    </SidePanel>
  )
}

export default HeadPainterPanel
