import { MeshStandardMaterial } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getLogger } from '@/services/loggerService'
import { loadModel } from '@/services/resources/model'
import { BlockstatesData, CDNModelResponse, ModelData } from '@/types'

const logger = getLogger('cacheStore')

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

  // 폰트 데이터 캐시 (.png, unifont)
  fontResources: Record<string, string> // png는 data url로 저장함
  setFontResource: (key: string, data: string) => void

  unifontHexData: Map<number, string>
  setUnifontHexData: (data: Map<number, string>) => void
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
        .catch(logger.error)
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

    fontResources: {},
    setFontResource: (key, data) =>
      set((state) => {
        state.fontResources[key] = data
      }),

    unifontHexData: new Map(),
    setUnifontHexData: (data) =>
      set((state) => {
        state.unifontHexData = data
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
