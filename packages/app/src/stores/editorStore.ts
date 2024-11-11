import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// ==========
type EditorMode = 'translate' | 'rotate' | 'scale'
type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void
}

export const useEditorStore = create(
  immer<EditorState>((set) => ({
    mode: 'translate',
    setMode: (newMode) =>
      set((state) => {
        state.mode = newMode
      }),
  })),
)
