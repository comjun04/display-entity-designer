import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type DisplayEntity = {
  type: 'block'
  size: [number, number, number]
  location: [number, number, number]
  color: string | number
}

type DisplayEntityState = {
  entities: DisplayEntity[]
  createNew: () => void
}

export const useDisplayEntityStore = create(
  immer<DisplayEntityState>((set) => ({
    entities: [],
    createNew: () =>
      set((state) => {
        state.entities.push({
          type: 'block',
          size: [1, 1, 1],
          location: [0, 0, 0],
          color: 0x888888,
        })
      }),
  })),
)
