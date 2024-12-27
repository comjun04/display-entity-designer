import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { useEntityRefStore } from '@/stores/entityRefStore'
import {
  DisplayEntity,
  ModelDisplayPositionKey,
  Number3Tuple,
  PartialNumber3Tuple,
} from '@/types'

export type DisplayEntityState = {
  entities: DisplayEntity[]
  selectedEntityIds: string[]

  createNew: (kind: DisplayEntity['kind'], type: string) => void
  setSelected: (ids: string[]) => void
  addToSelected: (id: string) => void
  setEntityTranslation: (id: string, translation: PartialNumber3Tuple) => void
  setEntityRotation: (id: string, rotation: PartialNumber3Tuple) => void
  setEntityScale: (id: string, scale: PartialNumber3Tuple) => void
  batchSetEntityTransformation: (
    data: {
      id: string
      translation?: PartialNumber3Tuple
      rotation?: PartialNumber3Tuple
      scale?: PartialNumber3Tuple
    }[],
  ) => void
  setEntityDisplayType: (
    id: string,
    display: ModelDisplayPositionKey | null,
  ) => void
  setBDEntityBlockstates: (
    id: string,
    blockstates: Record<string, string>,
  ) => void
  deleteEntity: (id: string) => void
}

export const useDisplayEntityStore = create(
  immer<DisplayEntityState>((set) => ({
    entities: [],
    selectedEntityIds: [],

    createNew: (kind, type) => {
      const id = nanoid(16)

      return set((state) => {
        useEntityRefStore.getState().createEntityRef(id)

        if (kind === 'block') {
          state.entities.push({
            kind: 'block',
            id,
            type,
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
            blockstates: {},
          })
        } else if (kind === 'item') {
          state.entities.push({
            kind: 'item',
            id,
            type,
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
          })
        }
      })
    },
    setSelected: (ids) =>
      set((state) => {
        state.selectedEntityIds = ids
      }),
    addToSelected: (id) =>
      set((state) => {
        if (!state.selectedEntityIds.includes(id)) {
          state.selectedEntityIds.push(id)
        }
      }),
    setEntityTranslation: (id, translation) =>
      set((state) => {
        console.debug(
          'displayEntityStore setEntityTranslation',
          id,
          translation,
        )

        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityTranslation(): unknown entity ${id}`,
          )
          return
        }

        const positionDraft = entity.position.slice() as Number3Tuple
        translation.forEach((d, idx) => {
          if (d != null) {
            positionDraft[idx] = d
          }
        })
        entity.position = positionDraft
      }),
    setEntityRotation: (id, rotation) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityRotation(): unknown entity ${id}`,
          )
          return
        }

        const rotationDraft = entity.rotation.slice() as Number3Tuple
        rotation.forEach((d, idx) => {
          if (d != null) {
            rotationDraft[idx] = d
          }
        })
        entity.rotation = rotationDraft
      }),
    setEntityScale: (id, scale) =>
      set((state) => {
        console.debug('displayEntityStore setEntityScale', id, scale)

        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityScale(): unknown entity ${id}`,
          )
          return
        }

        const scaleDraft = entity.size.slice() as Number3Tuple
        scale.forEach((d, idx) => {
          if (d != null) {
            scaleDraft[idx] = d
          }
        })
        entity.size = scaleDraft
      }),
    batchSetEntityTransformation: (data) =>
      set((state) => {
        console.debug('displayEntityStore batchSetEntityTransformation', data)

        data.forEach((item) => {
          const entity = state.entities.find((e) => e.id === item.id)
          if (entity == null) return

          if (item.translation != null) {
            const positionDraft = entity.position.slice() as Number3Tuple
            item.translation.forEach((d, idx) => {
              if (d != null) {
                positionDraft[idx] = d
              }
            })
            entity.position = positionDraft
          }
          if (item.rotation != null) {
            const rotationDraft = entity.rotation.slice() as Number3Tuple
            item.rotation.forEach((d, idx) => {
              if (d != null) {
                rotationDraft[idx] = d
              }
            })
            entity.rotation = rotationDraft
          }
          if (item.scale != null) {
            const scaleDraft = entity.size.slice() as Number3Tuple
            item.scale.forEach((d, idx) => {
              if (d != null) {
                scaleDraft[idx] = d
              }
            })
            entity.size = scaleDraft
          }
        })
      }),
    setEntityDisplayType: (id, display) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `Attempted to set display type for unknown display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'item') {
          console.error(
            `Attempted to set display type for non-item display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        entity.display = display
      }),
    setBDEntityBlockstates: (id, blockstates) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `Attempted to set blockstates for unknown block display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'block') {
          console.error(
            `Attempted to set blockstates for non-block display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        entity.blockstates = { ...entity.blockstates, ...blockstates }
      }),
    deleteEntity: (id) =>
      set((state) => {
        const entityIdx = state.entities.findIndex((e) => e.id === id)
        if (entityIdx >= 0) {
          useEntityRefStore.getState().deleteEntityRef(id)
          state.entities.splice(entityIdx, 1)
        }

        const selectedEntityIdIdx = state.selectedEntityIds.findIndex(
          (entityId) => entityId === id,
        )
        if (selectedEntityIdIdx >= 0) {
          state.selectedEntityIds.splice(selectedEntityIdIdx, 1)
        }
      }),
  })),
)
