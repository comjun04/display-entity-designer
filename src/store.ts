import { nanoid } from 'nanoid'
import { createRef, MutableRefObject } from 'react'
import { Object3D } from 'three'
import { create } from 'zustand'
import { produce } from 'immer'

type DisplayEntity = {
  type: 'block'
  id: string
  objectRef: MutableRefObject<Object3D>
  size: [number, number, number]
  location: [number, number, number]
  color: string | number
}

type DisplayEntityState = {
  entities: DisplayEntity[]
  selectedEntity: DisplayEntity | null
  createNew: () => void
  setSelected: (id: string) => void
}

// DisplayEntity#objectRef는 mutable해야 하므로(object 내부 property를 수정할 수 있어야 하므로)
// immer middleware로 전체 적용하지 않고 필요한 부분만 produce로 따로 적용
export const useDisplayEntityStore = create<DisplayEntityState>((set) => ({
  entities: [],
  selectedEntity: null,
  createNew: () =>
    set((state) => ({
      // entites 배열 안에 들어가는 DisplayEntity#objectRef는 mutable해야 하므로 immer 적용 안함
      // (적용될 경우 ref.current을 수정하는 과정에서 readonly property를 수정하려 시도했다고 오류 발생)
      entities: [
        ...state.entities,
        {
          type: 'block',
          id: nanoid(16),
          objectRef: createRef() as MutableRefObject<Object3D>,
          size: [1, 1, 1],
          location: [0, 0, 0],
          color: 0x888888,
        },
      ],
    })),
  setSelected: (id) =>
    set(
      produce((state: DisplayEntityState) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          state.selectedEntity = entity
        }
      }),
    ),
}))
