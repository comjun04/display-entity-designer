import { MutableRefObject } from 'react'
import { Group } from 'three'
import { create } from 'zustand'

import { RefCallbackWithMutableRefObject } from '@/types'

// ==========
type EntityRefStoreState = {
  entityRefs: {
    id: string
    refAvailable: boolean
    objectRef: MutableRefObject<Group>
  }[]
  rootGroupRefData: {
    refAvailable: boolean
    objectRef: MutableRefObject<Group>
  }

  createEntityRef: (id: string) => void
  deleteEntityRef: (id: string) => void
  clearEntityRefs: () => void
}
// DisplayEntity#objectRef는 mutable해야 하므로(object 내부 property를 수정할 수 있어야 하므로)
// immer middleware로 전체 적용하지 않고 필요한 부분만 produce로 따로 적용
// DO NOT USE IMMER ON THIS STORE

export const useEntityRefStore = create<EntityRefStoreState>((set) => {
  const rootGroupRef = ((node: Group) => {
    rootGroupRef.current = node

    set((state) => ({
      rootGroupRefData: {
        ...state.rootGroupRefData,
        refAvailable: node != null,
      },
    }))
  }) as RefCallbackWithMutableRefObject<Group>

  return {
    entityRefs: [],
    rootGroupRefData: {
      refAvailable: false,
      objectRef: rootGroupRef,
    },

    createEntityRef: (id) =>
      set((state) => {
        const ref = ((node: Group) => {
          ref.current = node

          const refAvailable = node != null

          // console.log(`id: ${id}, refAvailable: ${refAvailable}`, node)

          set((state) => {
            const entityIdx = state.entityRefs.findIndex((e) => e.id === id)
            if (entityIdx >= 0) {
              const originalEntityRefData = state.entityRefs[entityIdx]
              return {
                entityRefs: state.entityRefs.toSpliced(entityIdx, 1, {
                  ...originalEntityRefData,
                  refAvailable,
                }),
              }
            }

            return {}
          })
        }) as RefCallbackWithMutableRefObject<Group>

        const entityIdx = state.entityRefs.findIndex((e) => e.id === id)
        if (entityIdx >= 0) {
          return {
            entityRefs: state.entityRefs.toSpliced(entityIdx, 1, {
              id,
              refAvailable: false,
              objectRef: ref,
            }),
          }
        } else {
          return {
            entityRefs: [
              ...state.entityRefs,
              {
                id,
                refAvailable: false,
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
    // displayEntityStore.clearEntities() 호출 시(= 모든 엔티티 삭제 시)에만 호출할 것
    // 이외 호출 시 내부 엔티티 리스트와 맞지 않아 버그를 일으킬 수 있음
    clearEntityRefs: () =>
      set(() => ({
        entityRefs: [],
      })),
  }
})
