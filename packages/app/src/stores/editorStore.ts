import { Number3Tuple } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// ==========
type EditorMode = 'translate' | 'rotate' | 'scale'
type TransformationData = {
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
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
  setSelectionBaseTransformation: (data: Partial<TransformationData>) => void
}

export const useEditorStore = create(
  immer<EditorState>((set) => ({
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
          state.selectionBaseTransformation.position = data.position
        }
        if (data?.rotation != null) {
          state.selectionBaseTransformation.rotation = data.rotation
        }
        if (data?.size != null) {
          state.selectionBaseTransformation.size = data.size
        }
      }),
  })),
)
