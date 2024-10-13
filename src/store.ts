import { nanoid } from 'nanoid'
import { createRef, MutableRefObject } from 'react'
import { Object3D } from 'three'
import { create } from 'zustand'
import { produce } from 'immer'
import { immer } from 'zustand/middleware/immer'

type DisplayEntity = {
  type: 'block'
  id: string
  size: [number, number, number]
  position: [number, number, number]
  color: string | number
}

type DisplayEntityState = {
  entities: DisplayEntity[]

  // ref는 mutable해야 하므로 immer 적용을 하지 않기 위해 별도로 분리
  // (적용될 경우 ref.current을 수정하는 과정에서 readonly property를 수정하려 시도했다고 오류 발생)
  entityRefs: { id: string; objectRef: MutableRefObject<Object3D> }[]

  selectedEntityId: string | null
  createNew: () => void
  setEntityRef: (id: string, ref: MutableRefObject<Object3D>) => void
  setSelected: (id: string) => void
  getSelectedEntity: () => DisplayEntity | null
  setEntityTranslation: (
    id: string,
    translation: [number, number, number],
  ) => void
}

// DisplayEntity#objectRef는 mutable해야 하므로(object 내부 property를 수정할 수 있어야 하므로)
// immer middleware로 전체 적용하지 않고 필요한 부분만 produce로 따로 적용
export const useDisplayEntityStore = create<DisplayEntityState>((set, get) => ({
  entities: [],
  entityRefs: [],
  selectedEntityId: null,

  // immer를 사용하면 안 되는 데이터 (ref)들을 수정해야 하는 경우 다른 데이터들도 immer를 사용하지 않고 변경할 것
  createNew: () => {
    const id = nanoid(16)

    return set((state: DisplayEntityState) => {
      state.setEntityRef(id, createRef() as MutableRefObject<Object3D>)
      return {
        entities: [
          ...state.entities,
          {
            type: 'block',
            id,
            size: [1, 1, 1],
            position: [0, 0, 0],
            color: 0x888888,
          },
        ],
      }
    })
  },
  setEntityRef: (id, ref) =>
    set((state) => {
      const entityIdx = state.entities.findIndex((e) => e.id === id)
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
  setSelected: (id) =>
    set(
      produce((state: DisplayEntityState) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          state.selectedEntityId = entity.id
        }
      }),
    ),
  getSelectedEntity: () => {
    const { entities, selectedEntityId } = get()
    return entities.find((e) => e.id === selectedEntityId) ?? null
  },
  setEntityTranslation: (id, translation) =>
    set(
      produce((state: DisplayEntityState) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.position = translation
        }
      }),
    ),
}))

// ==========

type EditorMode = 'translate' | 'rotate' | 'scale'

type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void
}

export const useEditorStore = create(
  immer<EditorState>((set) => ({
    mode: 'translate',
    setMode: (newMode) =>
      set((state) => {
        state.mode = newMode
      }),
  })),
)
