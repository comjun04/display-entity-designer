import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { LatestGameVersion } from '@/constants'

import { useDisplayEntityStore } from './displayEntityStore'

interface ProjectStoreState {
  targetGameVersion: string
  setTargetGameVersion: (version: string) => void
}

export const useProjectStore = create(
  immer<ProjectStoreState>((set) => ({
    targetGameVersion: LatestGameVersion,
    setTargetGameVersion: (version) => {
      set((state) => {
        state.targetGameVersion = version
      })

      useDisplayEntityStore
        .getState()
        .purgeInvalidEntities()
        .catch(console.error)
    },
  })),
)
