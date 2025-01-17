import { MutableRefObject } from 'react'
import { Group } from 'three'
import { create } from 'zustand'

import { RefCallbackWithMutableRefObject } from '@/types'

// ==========
type EntityRefStoreState = {
  entityRefs: Map<
    string,
    {
      id: string
      refAvailable: boolean
      objectRef: MutableRefObject<Group>
    }
  >
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

export const useEntityRefStore = create<EntityRefStoreState>((set, get) => {
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
    entityRefs: new Map(),
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

          // entity ref 데이터가 이미 삭제된 경우 다시 추가하지 말고 중단
          // 엔티티 삭제할 때 필요없는 데이터 재추가를 막아서 삭제 처리 시간을 줄임
          if (!get().entityRefs.has(id)) return

          set((state) => {
            if (state.entityRefs.has(id)) {
              const existingData = state.entityRefs.get(id)!
              const newMap = new Map(state.entityRefs)
              newMap.set(id, { ...existingData, refAvailable })
              return { entityRefs: newMap }
            }

            return {}
          })
        }) as RefCallbackWithMutableRefObject<Group>

        if (state.entityRefs.has(id)) {
          console.warn(
            `entityRefStore.createEntityRef(): creating entity ref data with entity id ${id} which already has one`,
          )
        }

        const newMap = new Map(state.entityRefs)
        newMap.set(id, {
          id,
          refAvailable: false,
          objectRef: ref,
        })
        return { entityRefs: newMap }
      }),
    deleteEntityRef: (id) =>
      set((state) => {
        const newMap = new Map(state.entityRefs)
        newMap.delete(id)
        return { entityRefs: newMap }
      }),
    // displayEntityStore.clearEntities() 호출 시(= 모든 엔티티 삭제 시)에만 호출할 것
    // 이외 호출 시 내부 엔티티 리스트와 맞지 않아 버그를 일으킬 수 있음
    clearEntityRefs: () =>
      set(() => ({
        entityRefs: new Map(),
      })),
  }
})
