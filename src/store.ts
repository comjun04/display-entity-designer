import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

type DisplayEntity = {
  type: 'block'
  id: string
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
          id: nanoid(16),
          size: [1, 1, 1],
          location: [0, 0, 0],
          color: 0x888888,
        })
      }),
  })),
)
