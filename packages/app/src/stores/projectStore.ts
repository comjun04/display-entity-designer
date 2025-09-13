import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface ProjectStoreState {
  targetGameVersion: string
  setTargetGameVersion: (version: string) => void
}

export const useProjectStore = create(
  immer<ProjectStoreState>((set) => ({
    targetGameVersion: '1.21',
    setTargetGameVersion: (version) =>
      set((state) => {
        state.targetGameVersion = version
      }),
  })),
)
