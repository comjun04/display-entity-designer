import { MeshStandardMaterial } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { ModelDisplayPositionKey, ModelElement, Number3Tuple } from '@/types'

// ==========
type ModelData = {
  textures: Record<string, string>
  textureSize?: [number, number]
  display: Record<
    ModelDisplayPositionKey,
    {
      rotation?: Number3Tuple
      translation?: Number3Tuple
      scale?: Number3Tuple
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

  croppedTextureDataUrls: Record<string, string>
  setCroppedTextureDataUrl: (
    resourceLocation: string,
    imageDataUrl: string,
  ) => void
}
// 모델 데이터 캐시 저장소

export const useCacheStore = create(
  immer<ModelDataStoreState>((set) => ({
    modelData: {},
    setModelData: (resourceLocation, data, isBlockShapedItemModel) =>
      set((state) => {
        const modelData = state.modelData[resourceLocation]

        if (modelData == null) {
          state.modelData[resourceLocation] = { data, isBlockShapedItemModel }
        }
      }),

    croppedTextureDataUrls: {},
    setCroppedTextureDataUrl: (resourceLocation, imageDataUrl) =>
      set((state) => {
        state.croppedTextureDataUrls[resourceLocation] = imageDataUrl
      }),
  })),
)

type ClassObjectCacheStoreState = {
  materials: Map<string, MeshStandardMaterial>
  setMaterial: (key: string, material: MeshStandardMaterial) => void
}

// DO NOT USE IMMER ON THIS STORE
export const useClassObjectCacheStore = create<ClassObjectCacheStoreState>(
  (set) => ({
    materials: new Map(),
    setMaterial: (key, material) =>
      set((state) => {
        const newMap = new Map(state.materials)
        newMap.set(key, material)
        return { materials: newMap }
      }),
  }),
)
