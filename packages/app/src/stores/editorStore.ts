import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { Number3Tuple, PartialNumber3Tuple } from '@/types'

// ==========
type EditorMode = 'translate' | 'rotate' | 'scale'
type TransformationData = {
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
}

type Settings = {
  testOption: boolean
}

type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void

  usingTransformControl: boolean
  setUsingTransformControl: (value: boolean) => void

  /**
   * 선택된 display entity transformation 실시간 업데이트용
   */
  selectionBaseTransformation: TransformationData
  setSelectionBaseTransformation: (data: {
    position?: PartialNumber3Tuple
    rotation?: PartialNumber3Tuple
    size?: PartialNumber3Tuple
  }) => void

  settings: Settings
  setSettings: (newSettings: Partial<Settings>) => void
}

function getStoredSettings() {
  try {
    const settingsString = window.localStorage.getItem('settings')
    return settingsString != null
      ? (JSON.parse(settingsString) as Settings)
      : null
  } catch (err) {
    console.error(err)
    return null
  }
}

export const useEditorStore = create(
  immer<EditorState>((set) => {
    const initialSettings = getStoredSettings() ?? {
      testOption: false,
    }

    return {
      mode: 'translate',
      setMode: (newMode) =>
        set((state) => {
          state.mode = newMode
        }),

      usingTransformControl: false,
      setUsingTransformControl: (value) =>
        set((state) => {
          state.usingTransformControl = value
        }),

      selectionBaseTransformation: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        size: [1, 1, 1],
      },
      setSelectionBaseTransformation: (data) =>
        set((state) => {
          if (data?.position != null) {
            const positionDraft =
              state.selectionBaseTransformation.position.slice() as Number3Tuple
            data.position.forEach((d, idx) => {
              if (d != null) {
                positionDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.position = positionDraft
          }
          if (data?.rotation != null) {
            const rotationDraft =
              state.selectionBaseTransformation.rotation.slice() as Number3Tuple
            data.rotation.forEach((d, idx) => {
              if (d != null) {
                rotationDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.rotation = rotationDraft
          }
          if (data?.size != null) {
            const scaleDraft =
              state.selectionBaseTransformation.size.slice() as Number3Tuple
            data.size.forEach((d, idx) => {
              if (d != null) {
                scaleDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.size = scaleDraft
          }
        }),

      settings: initialSettings,
      setSettings: (newSettings) =>
        set((state) => {
          state.settings = { ...state.settings, ...newSettings }

          try {
            window.localStorage.setItem(
              'settings',
              JSON.stringify(state.settings),
            )
          } catch (err) {
            console.error(err)
          }
        }),
    }
  }),
)
