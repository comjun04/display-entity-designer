import { useEntityRefStore } from '@/stores/entityRefStore'
import { DisplayEntity, ModelDisplayPositionKey } from '@/types'
import { nanoid } from 'nanoid'
import { createRef, MutableRefObject } from 'react'
import { Object3D } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type DisplayEntityState = {
  entityIds: string[]
  entities: DisplayEntity[]
  selectedEntityIds: string[]

  createNew: (kind: DisplayEntity['kind'], type: string) => void
  setSelected: (ids: string[]) => void
  addToSelected: (id: string) => void
  setEntityTranslation: (
    id: string,
    translation: [number, number, number],
  ) => void
  setEntityRotation: (id: string, rotation: [number, number, number]) => void
  setEntityScale: (id: string, scale: [number, number, number]) => void
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
    entityIds: [],
    entities: [],
    selectedEntityIds: [],
    selectedEntities: [],

    createNew: (kind, type) => {
      const id = nanoid(16)

      return set((state) => {
        state.entityIds.push(id)
        useEntityRefStore
          .getState()
          .setEntityRef(id, createRef() as MutableRefObject<Object3D>)

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
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.position = translation
        }
      }),
    setEntityRotation: (id, rotation) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.rotation = rotation
        }
      }),
    setEntityScale: (id, scale) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.size = scale
        }
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
        const entityIdIdx = state.entityIds.findIndex(
          (entityId) => entityId === id,
        )
        if (entityIdIdx >= 0) {
          state.entityIds.splice(entityIdIdx, 1)
        }

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
