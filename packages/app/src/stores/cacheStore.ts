import { ModelDisplayPositionKey, ModelElement } from '@/types'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

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
