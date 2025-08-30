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
  openedDialog: DialogType
  setOpenedDialog: (dialog: Exclude<DialogType, 'prompt'>) => void

  promptDialogData: PromptDialogData
  openPromptDialog: (data: PromptDialogData) => void
}

export const useDialogStore = create(
  immer<DialogState>((set) => ({
    openedDialog: null,
    setOpenedDialog: (dialog) =>
      set((state) => {
        state.openedDialog = dialog
      }),

    promptDialogData: {
      title: 'Sample Prompt Title',
      content: 'sample prompt content',
      buttonText: { positive: 'OK', negative: 'Cancel' },
    },
    openPromptDialog: (data) =>
      set((state) => {
        state.promptDialogData = data
        state.openedDialog = 'prompt'
      }),
  })),
)
