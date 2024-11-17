import { MutableRefObject, RefObject } from 'react'
import { Group, Object3D } from 'three'
import { create } from 'zustand'

// ==========
type EntityRefStoreState = {
  entityRefs: { id: string; objectRef: MutableRefObject<Object3D> }[]
  setEntityRef: (id: string, ref: MutableRefObject<Object3D>) => void
  deleteEntityRef: (id: string) => void

  selectedEntityGroupRef?: RefObject<Group>
  setSelectedEntityGroupRef: (ref: RefObject<Group>) => void
}
// DisplayEntity#objectRef는 mutable해야 하므로(object 내부 property를 수정할 수 있어야 하므로)
// immer middleware로 전체 적용하지 않고 필요한 부분만 produce로 따로 적용
// DO NOT USE IMMER ON THIS STORE

export const useEntityRefStore = create<EntityRefStoreState>((set) => ({
  entityRefs: [],
  setEntityRef: (id, ref) =>
    set((state) => {
      const entityIdx = state.entityRefs.findIndex((e) => e.id === id)
      if (entityIdx >= 0) {
        return {
          entityRefs: state.entityRefs.toSpliced(entityIdx, 1, {
            id,
            objectRef: ref,
          }),
        }
      } else {
        return {
          entityRefs: [
            ...state.entityRefs,
            {
              id,
              objectRef: ref,
            },
          ],
        }
      }
    }),
  deleteEntityRef: (id) =>
    set((state) => {
      const entityIdx = state.entityRefs.findIndex((e) => e.id === id)
      if (entityIdx >= 0) {
        return { entityRefs: state.entityRefs.toSpliced(entityIdx, 1) }
      }

      return {}
    }),

  setSelectedEntityGroupRef: (ref) =>
    set(() => ({
      selectedEntityGroupRef: ref,
    })),
}))
