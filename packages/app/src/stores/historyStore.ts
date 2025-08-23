import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { History } from '@/types'

interface HistoryStoreState {
  undoStack: History[]
  redoStack: History[]

  addHistory: (history: History) => void
  undoHistory: () => void
  redoHistory: () => void
}

export const useHistoryStore = create(
  immer<HistoryStoreState>((set, get) => ({
    // undo stack, pushed when user action, popped when undo
    undoStack: [],
    // redo stack, pushed when undo, popped when redo
    redoStack: [],

    addHistory: (history) =>
      set((state) => {
        state.undoStack.push(history)
        state.redoStack.length = 0
      }),
    undoHistory: () => {
      import('./displayEntityStore')
        .then(({ useDisplayEntityStore }) => {
          set((state) => {
            // get the last non-proxied history
            const history = get().undoStack.slice(-1)[0]
            if (history == null) return

            state.undoStack.pop()

            const { deleteEntities } = useDisplayEntityStore.getState()

            // TODO: apply beforeState
            switch (history.type) {
              case 'createEntities': {
                deleteEntities(
                  history.afterState.entities.map((entity) => entity.id),
                )
                break
              }
              case 'deleteEntities': {
                break
              }
            }

            // push non-proxied history to prevent errors
            // from proxy revocation
            state.redoStack.push(history)
          })
        })
        .catch(console.error)
    },
    redoHistory: () => {
      import('./displayEntityStore')
        .then(({ useDisplayEntityStore }) => {
          set((state) => {
            // get the last non-proxied history
            const history = get().redoStack.slice(-1)[0]
            if (history == null) return

            state.redoStack.pop()

            const { createNew } = useDisplayEntityStore.getState()

            // TODO: apply afterState
            switch (history.type) {
              case 'createEntities': {
                createNew(history.afterState.entities, true)
                break
              }
              case 'deleteEntities': {
                break
              }
            }
            // push non-proxied history to prevent errors
            // from proxy revocation
            state.undoStack.push(history)
          })
        })
        .catch(console.error)
    },
  })),
)
