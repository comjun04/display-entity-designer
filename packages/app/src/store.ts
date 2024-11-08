import { nanoid } from 'nanoid'
import { createRef, MutableRefObject } from 'react'
import { Object3D } from 'three'
import { create } from 'zustand'
import { produce } from 'immer'
import { immer } from 'zustand/middleware/immer'
import { ModelDisplayPositionKey, ModelElement } from './types'

type DisplayEntity = {
  id: string
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  display: ModelDisplayPositionKey | null
} & (
  | {
      kind: 'block'
      blockstates: Record<string, string>
    }
  | {
      kind: 'item'
    }
)

type DisplayEntityState = {
  entities: DisplayEntity[]
  selectedEntityId: string | null
  createNew: (kind: DisplayEntity['kind'], type: string) => void
  setSelected: (id: string | null) => void
  getSelectedEntity: () => DisplayEntity | null
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

export const useDisplayEntityStore = create<DisplayEntityState>((set, get) => ({
  entities: [],
  selectedEntityId: null,

  // immer를 사용하면 안 되는 데이터 (ref)들을 수정해야 하는 경우 다른 데이터들도 immer를 사용하지 않고 변경할 것
  createNew: (kind, type) => {
    const id = nanoid(16)

    return set((state: DisplayEntityState) => {
      useEntityRefStore
        .getState()
        .setEntityRef(id, createRef() as MutableRefObject<Object3D>)

      if (kind === 'block') {
        return {
          entities: [
            ...state.entities,
            {
              kind: 'block',
              id,
              type,
              size: [1, 1, 1],
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              display: null,
              blockstates: {},
            },
          ],
        }
      } else if (kind === 'item') {
        return {
          entities: [
            ...state.entities,
            {
              kind: 'item',
              id,
              type,
              size: [1, 1, 1],
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              display: null,
            },
          ],
        }
      }

      return {}
    })
  },
  setSelected: (id) =>
    set(
      produce((state: DisplayEntityState) => {
        // selectedEntityId 삭제
        if (id == null) {
          state.selectedEntityId = null
          return
        }

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
  setEntityRotation: (id, rotation) =>
    set(
      produce((state: DisplayEntityState) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.rotation = rotation
        }
      }),
    ),
  setEntityScale: (id, scale) =>
    set(
      produce((state: DisplayEntityState) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity != null) {
          entity.size = scale
        }
      }),
    ),
  setEntityDisplayType: (id, display) =>
    set(
      produce((state: DisplayEntityState) => {
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
    ),
  setBDEntityBlockstates: (id, blockstates) =>
    set(
      produce((state: DisplayEntityState) => {
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
    ),
  deleteEntity: (id) =>
    set((state: DisplayEntityState) => {
      const entityIdx = state.entities.findIndex((e) => e.id === id)
      if (entityIdx >= 0) {
        useEntityRefStore.getState().deleteEntityRef(id)
        return { entities: state.entities.toSpliced(entityIdx, 1) }
      } else {
        return {}
      }
    }),
}))

// ==========

type EntityRefStoreState = {
  entityRefs: { id: string; objectRef: MutableRefObject<Object3D> }[]
  setEntityRef: (id: string, ref: MutableRefObject<Object3D>) => void
  deleteEntityRef: (id: string) => void
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
}))

// ==========

type ModelData = {
  textures: Record<string, string>
  display: Record<
    ModelDisplayPositionKey,
    {
      rotation?: [number, number, number]
      translation?: [number, number, number]
      scale?: [number, number, number]
    }
  >
  elements: ModelElement[]
}
type ModelDataStoreState = {
  modelData: Record<
    string,
    {
      data: ModelData
      isBlockShapedItemModel: boolean
    }
  >
  setModelData: (
    resourceLocation: string,
    data: ModelData,
    isBlockShapedItemModel: boolean,
  ) => void
}

// 모델 데이터 캐시 저장소
export const useModelDataStore = create(
  immer<ModelDataStoreState>((set) => ({
    modelData: {},
    setModelData: (resourceLocation, data, isBlockShapedItemModel) =>
      set((state) => {
        const modelData = state.modelData[resourceLocation]

        if (modelData == null) {
          state.modelData[resourceLocation] = { data, isBlockShapedItemModel }
        }
      }),
  })),
)

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

// ==========

type DialogType = 'appInfo' | 'blockDisplaySelect' | 'itemDisplaySelect' | null

type DialogState = {
  openedDialog: DialogType
  setOpenedDialog: (dialog: DialogType) => void
}

export const useDialogStore = create(
  immer<DialogState>((set) => ({
    openedDialog: null,
    setOpenedDialog: (dialog) =>
      set((state) => {
        state.openedDialog = dialog
      }),
  })),
)
