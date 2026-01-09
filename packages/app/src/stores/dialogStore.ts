import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

// ==========
type DialogType =
  | 'welcome'
  | 'prompt'
  | 'settings'
  | 'blockDisplaySelect'
  | 'itemDisplaySelect'
  | 'exportToMinecraft'
  | 'bakingPlayerHeads'
  | null
type PromptDialogData = {
  title: string
  content: string
  buttonText: {
    positive: string
    negative: string
  }
  onChoice?: (choice: boolean) => void
}

type DialogState = {
  activeDialog: DialogType
  openDialog: (dialog: NonNullable<Exclude<DialogType, 'prompt'>>) => void
  closeActiveDialog: () => void

  promptDialogData: PromptDialogData
  openPromptDialog: (data: PromptDialogData) => void
}

export const useDialogStore = create(
  immer<DialogState>((set) => ({
    activeDialog: null,
    openDialog: (dialog) =>
      set((state) => {
        state.activeDialog = dialog
      }),
    closeActiveDialog: () =>
      set((state) => {
        state.activeDialog = null
      }),

    promptDialogData: {
      title: 'Sample Prompt Title',
      content: 'sample prompt content',
      buttonText: { positive: 'OK', negative: 'Cancel' },
    },
    openPromptDialog: (data) =>
      set((state) => {
        state.promptDialogData = data
        state.activeDialog = 'prompt'
      }),
  })),
)
