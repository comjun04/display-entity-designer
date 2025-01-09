import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// ==========
type DialogType =
  | 'settings'
  | 'blockDisplaySelect'
  | 'itemDisplaySelect'
  | 'exportToMinecraft'
  | null
type DialogState = {
  openedDialog: DialogType
  setOpenedDialog: (dialog: DialogType) => void
}

export const useDialogStore = create(
  immer<DialogState>((set) => ({
    openedDialog: null,
    setOpenedDialog: (dialog) =>
      set((state) => {
        state.openedDialog = dialog
      }),
  })),
)
