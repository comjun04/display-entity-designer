import { type FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { isItemDisplayPlayerHead } from '@/types'
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
  const unbakedHeadsCount = useDisplayEntityStore((state) => {
    let count = 0
    for (const entity of state.entities.values()) {
      if (
        isItemDisplayPlayerHead(entity) &&
        entity.playerHeadProperties.texture?.baked === false
      ) {
        count++
      }
    }

    return count
  })

  return (
    <SidePanel>
      <SidePanelTitle>Head Painter</SidePanelTitle>
      <SidePanelContent>
        <div className="flex flex-col gap-2">
          <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
            Paint
          </div>
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

          <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
            Bake textures
          </div>
          <div className="flex flex-col gap-2">
            <div>
              Player heads with painted textures applied need to have their
              textures uploaded as Minecraft skin to use in-game.
            </div>
            {unbakedHeadsCount > 0 ? (
              <>
                <span>
                  There {unbakedHeadsCount === 1 ? 'is' : 'are'}{' '}
                  {unbakedHeadsCount}{' '}
                  {unbakedHeadsCount === 1 ? 'head' : 'heads'} with unbaked
                  texture.
                </span>
                <button className="rounded bg-stone-700 p-1">
                  Bake textures
                </button>
              </>
            ) : (
              <span className="text-gray-500">
                All textures used on player heads are baked.
              </span>
            )}
          </div>
        </div>
      </SidePanelContent>
    </SidePanel>
  )
}

export default HeadPainterPanel
