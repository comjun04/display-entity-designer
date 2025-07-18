import { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { ModelDisplayPositionKey, TextDisplayAlignment } from '@/types'

import { SidePanel, SidePanelContent, SidePanelTitle } from '../SidePanel'
import { ColorPickerInput } from '../ui/ColorPicker'
import Switch from '../ui/Switch'

const displayValue: (ModelDisplayPositionKey | null)[] = [
  null,
  'ground',
  'head',
  'firstperson_righthand',
  'firstperson_lefthand',
  'thirdperson_righthand',
  'thirdperson_lefthand',
  'gui',
  'fixed',
]

const BlockDisplayProperties: FC = () => {
  const singleSelectedEntity = useDisplayEntityStore((state) => {
    const entity =
      state.selectedEntityIds.length === 1
        ? state.entities.get(state.selectedEntityIds[0])!
        : null
    return entity?.kind === 'block' ? entity : null
  })

  const { data: blockstatesData } = useBlockStates(singleSelectedEntity?.type)

  if (
    singleSelectedEntity == null ||
    blockstatesData == null ||
    blockstatesData.blockstates.size < 1
  ) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
        Blockstates
      </div>
      {[...blockstatesData.blockstates.entries()].map(([key, values]) => {
        return (
          <div key={key} className="flex flex-row items-center gap-2">
            <label className="flex-1 text-end">{key}</label>
            <select
              className="flex-[2] rounded bg-neutral-800 px-2 py-1"
              value={singleSelectedEntity.blockstates[key]}
              onChange={(evt) => {
                const { setBDEntityBlockstates } =
                  useDisplayEntityStore.getState()
                setBDEntityBlockstates(singleSelectedEntity.id, {
                  [key]: evt.target.value,
                })
              }}
            >
              {[...values.states.values()].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

const ItemDisplayProperties: FC = () => {
  const singleSelectedEntity = useDisplayEntityStore((state) => {
    const entity =
      state.selectedEntityIds.length === 1
        ? state.entities.get(state.selectedEntityIds[0])!
        : null
    return entity?.kind === 'item' ? entity : null
  })

  if (singleSelectedEntity == null) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
        Display
      </div>

      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">display</label>
        <select
          className="flex-[2] rounded bg-neutral-800 px-2 py-1"
          value={singleSelectedEntity.display ?? 'none'}
          onChange={(evt) => {
            const { setEntityDisplayType } = useDisplayEntityStore.getState()
            setEntityDisplayType(
              singleSelectedEntity.id,
              evt.target.value === 'none'
                ? null
                : (evt.target.value as ModelDisplayPositionKey),
            )
          }}
        >
          {displayValue.map((value) => (
            <option key={value ?? 'none'} value={value ?? 'none'}>
              {value ?? 'none'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

const TextDisplayProperties: FC = () => {
  const singleSelectedEntity = useDisplayEntityStore((state) => {
    const entity =
      state.selectedEntityIds.length === 1
        ? state.entities.get(state.selectedEntityIds[0])!
        : null
    return entity?.kind === 'text' ? entity : null
  })

  if (singleSelectedEntity == null) return null

  const { backgroundColor: bgColorARGB } = singleSelectedEntity
  const bgColorAlpha = bgColorARGB >>> 24 // get the first 2 bytes
  const bgColorRGBA = (bgColorARGB << 8) + bgColorAlpha // shift 2 bytes left and add alpha

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded bg-neutral-700 p-1 px-2 text-xs font-bold text-neutral-400">
        Text
      </div>

      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">text</label>
        <input
          className="min-w-0 flex-[2] rounded bg-neutral-800 py-1 pl-1 text-xs outline-none"
          value={singleSelectedEntity.text}
          onChange={(evt) => {
            useDisplayEntityStore
              .getState()
              .setTextDisplayProperties(singleSelectedEntity.id, {
                text: evt.target.value,
              })
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">line_width</label>
        <input
          type="number"
          min={0}
          className="min-w-0 flex-[2] rounded bg-neutral-800 py-1 pl-1 text-xs outline-none"
          value={singleSelectedEntity.lineWidth}
          onChange={(evt) => {
            const value = parseInt(evt.target.value)
            if (!isFinite(value) || value < 0) return

            useDisplayEntityStore
              .getState()
              .setTextDisplayProperties(singleSelectedEntity.id, {
                lineWidth: value,
              })
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">alignment</label>
        <select
          className="flex-[2] rounded bg-neutral-800 px-2 py-1"
          value={singleSelectedEntity.alignment}
          onChange={(evt) => {
            useDisplayEntityStore
              .getState()
              .setTextDisplayProperties(singleSelectedEntity.id, {
                alignment: evt.target.value as TextDisplayAlignment,
              })
          }}
        >
          <option>left</option>
          <option>center</option>
          <option>right</option>
        </select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">background_color</label>
        <ColorPickerInput
          className="flex-[2]"
          value={singleSelectedEntity.backgroundColor}
          useARGB
          onValueChange={(num) => {
            useDisplayEntityStore
              .getState()
              .setTextDisplayProperties(singleSelectedEntity.id, {
                backgroundColor: num,
              })
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">default_background</label>
        <div className="flex-[2]">
          <Switch
            checked={singleSelectedEntity.defaultBackground}
            onChange={(value) => {
              useDisplayEntityStore
                .getState()
                .setTextDisplayProperties(singleSelectedEntity.id, {
                  defaultBackground: value,
                })
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">see_through</label>
        <div className="flex-[2]">
          <Switch
            checked={singleSelectedEntity.seeThrough}
            onChange={(value) => {
              useDisplayEntityStore
                .getState()
                .setTextDisplayProperties(singleSelectedEntity.id, {
                  seeThrough: value,
                })
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">shadow</label>
        <div className="flex-[2]">
          <Switch
            checked={singleSelectedEntity.shadow}
            onChange={(value) => {
              useDisplayEntityStore
                .getState()
                .setTextDisplayProperties(singleSelectedEntity.id, {
                  shadow: value,
                })
            }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="flex-1 text-end">text_opacity</label>
        <input
          type="number"
          min={0}
          max={255}
          className="min-w-0 flex-[2] rounded bg-neutral-800 py-1 pl-1 text-xs outline-none"
          value={singleSelectedEntity.textOpacity}
          onChange={(evt) => {
            const value = parseInt(evt.target.value)
            if (!isFinite(value) || value < 0 || value > 255) return

            useDisplayEntityStore
              .getState()
              .setTextDisplayProperties(singleSelectedEntity.id, {
                textOpacity: value,
              })
          }}
        />
      </div>
    </div>
  )
}

const PropertiesPanel: FC = () => {
  const { singleSelectedEntity } = useDisplayEntityStore(
    useShallow((state) => {
      return {
        singleSelectedEntity:
          state.selectedEntityIds.length === 1
            ? state.entities.get(state.selectedEntityIds[0])!
            : null,
      }
    }),
  )

  return (
    <SidePanel>
      <SidePanelTitle>Properties</SidePanelTitle>
      <SidePanelContent>
        {singleSelectedEntity?.kind === 'block' && <BlockDisplayProperties />}
        {singleSelectedEntity?.kind === 'item' && <ItemDisplayProperties />}

        {singleSelectedEntity?.kind === 'text' && <TextDisplayProperties />}
      </SidePanelContent>
    </SidePanel>
  )
}

export default PropertiesPanel
