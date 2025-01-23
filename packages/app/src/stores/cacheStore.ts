import { MeshStandardMaterial } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { loadModel } from '@/services/resourceLoadService'
import { BlockstatesData, CDNModelResponse, ModelData } from '@/types'

// ==========

type CacheStoreState = {
  blockstatesData: Record<string, BlockstatesData>
  setBlockstateData: (blockType: string, data: BlockstatesData) => void

  modelJson: Record<string, CDNModelResponse>
  setModelJson: (
    resourceLocation: string,
    jsonContent: CDNModelResponse,
  ) => void

  modelData: Record<
    string,
    {
      data: ModelData
      isBlockShapedItemModel: boolean
    }
  >
  modelDataLoading: Set<string>
  loadModelData: (resourceLocation: string) => void
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

// 캐시 저장소

export const useCacheStore = create(
  immer<CacheStoreState>((set) => ({
    blockstatesData: {},
    setBlockstateData: (blockType, blockstatesData) =>
      set((state) => {
        state.blockstatesData[blockType] = blockstatesData
      }),

    modelJson: {},
    setModelJson: (resourceLocation, jsonContent) =>
      set((state) => {
        state.modelJson[resourceLocation] = jsonContent
      }),

    modelData: {},
    modelDataLoading: new Set(),
    loadModelData: (resourceLocation) => {
      set((state) => {
        if (state.modelDataLoading.has(resourceLocation)) return
        state.modelDataLoading = new Set(state.modelDataLoading)
        state.modelDataLoading.add(resourceLocation)
      })

      loadModel(resourceLocation)
        .then((modelData) => {
          set((state) => {
            state.modelData[resourceLocation] = modelData

            state.modelDataLoading = new Set(state.modelDataLoading)
            state.modelDataLoading.delete(resourceLocation)
          })
        })
        .catch(console.error)
    },
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
