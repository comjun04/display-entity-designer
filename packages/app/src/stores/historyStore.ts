import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getLogger } from '@/services/loggerService'
import { History, Number3Tuple } from '@/types'

const logger = getLogger('historyStore')

interface HistoryStoreState {
  undoStack: History[]
  redoStack: History[]

  addHistory: (history: History) => void
  undoHistory: () => void
  redoHistory: () => void
  clearHistory: () => void
}

export const useHistoryStore = create(
  immer<HistoryStoreState>((set, get) => ({
    // undo stack, pushed when user action, popped when undo
    undoStack: [],
    // redo stack, pushed when undo, popped when redo
    redoStack: [],

    addHistory: (history) =>
      set((state) => {
        logger.debug('addHistory():', history)
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

            logger.debug('undoHistory():', history)

            state.undoStack.pop()

            const {
              createNew,
              deleteEntities,
              groupEntities,
              ungroupEntityGroup,
            } = useDisplayEntityStore.getState()

            // TODO: apply beforeState
            switch (history.type) {
              case 'createEntities': {
                deleteEntities(
                  history.afterState.entities.map((entity) => entity.id),
                )
                break
              }
              case 'deleteEntities': {
                createNew(history.beforeState.entities, true)
                break
              }
              case 'group': {
                ungroupEntityGroup(history.parentGroupId, true)
                break
              }
              case 'ungroup': {
                groupEntities(
                  history.childrenEntityIds,
                  history.parentGroupId,
                  true,
                )
                break
              }
              case 'changeProperties': {
                applyHistoryPropertyChange(
                  history,
                  'undo',
                  useDisplayEntityStore,
                )
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

            logger.debug('redoHistory():', history)

            state.redoStack.pop()

            const {
              createNew,
              deleteEntities,
              groupEntities,
              ungroupEntityGroup,
            } = useDisplayEntityStore.getState()

            // TODO: apply afterState
            switch (history.type) {
              case 'createEntities': {
                createNew(history.afterState.entities, true)
                break
              }
              case 'deleteEntities': {
                deleteEntities(
                  history.beforeState.entities.map((entity) => entity.id),
                  true,
                )
                break
              }
              case 'group': {
                groupEntities(
                  history.childrenEntityIds,
                  history.parentGroupId,
                  true,
                )
                break
              }
              case 'ungroup': {
                ungroupEntityGroup(history.parentGroupId, true)
                break
              }
              case 'changeProperties': {
                applyHistoryPropertyChange(
                  history,
                  'redo',
                  useDisplayEntityStore,
                )
              }
            }
            // push non-proxied history to prevent errors
            // from proxy revocation
            state.undoStack.push(history)
          })
        })
        .catch(console.error)
    },
    clearHistory: () =>
      set((state) => {
        state.undoStack.length = 0
        state.redoStack.length = 0
      }),
  })),
)

function applyHistoryPropertyChange(
  history: History,
  type: 'undo' | 'redo',
  displayEntityStore: (typeof import('./displayEntityStore'))['useDisplayEntityStore'],
) {
  if (history.type !== 'changeProperties') {
    logger.warn(
      `applyHistoryPropertyChange(): Expected history type 'changeProperties' but got ${history.type}. Skipping.`,
    )
    return
  }

  const {
    batchSetEntityTransformation,
    setEntityDisplayType,
    setBDEntityBlockstates,
  } = displayEntityStore.getState()

  const transformationChanges = new Map<
    string,
    { id: string } & Partial<{
      translation: Number3Tuple
      rotation: Number3Tuple
      scale: Number3Tuple
    }>
  >()

  for (const record of history.entities) {
    // check for transformation change
    const transformationChange: Partial<{
      translation: Number3Tuple
      rotation: Number3Tuple
      scale: Number3Tuple
    }> = {}

    const stateToUse = type === 'redo' ? record.afterState : record.beforeState

    if ('position' in stateToUse) {
      transformationChange.translation = stateToUse.position
    }
    if ('rotation' in stateToUse) {
      transformationChange.rotation = stateToUse.rotation
    }
    if ('size' in stateToUse) {
      transformationChange.scale = stateToUse.size
    }

    if (Object.keys(transformationChange).length > 0) {
      transformationChanges.set(record.id, {
        id: record.id,
        ...transformationChange,
      })
    }

    // apply item_display display property
    if (stateToUse.kind === 'item' && stateToUse.display !== undefined) {
      setEntityDisplayType(record.id, stateToUse.display, true)
    }

    // apply block_display blockstates
    if (stateToUse.kind === 'block' && stateToUse.blockstates != null) {
      setBDEntityBlockstates(record.id, stateToUse.blockstates, true)
    }
  }

  // apply transformation change
  if (transformationChanges.size > 0) {
    batchSetEntityTransformation([...transformationChanges.values()], true)
  }
}
