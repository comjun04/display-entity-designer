import { useEffect, useState } from 'react'

import fetcher from '@/fetcher'
import { useCacheStore } from '@/stores/cacheStore'
import { CDNModelResponse, ModelData, ModelElement } from '@/types'
import { generateBuiltinItemModel, stripMinecraftPrefix } from '@/utils'

const useModel = (initialResourceLocation: string) => {
  const isItemModel = stripMinecraftPrefix(initialResourceLocation).startsWith(
    'item/',
  )

  const [modelData, setModelData] = useState<ModelData>()
  const [isBlockShapedItemModel, setIsBlockShapedItemModel] =
    useState<boolean>()

  // =====

  useEffect(() => {
    if (modelData != null) return

    const { modelData: cachedModelData, setModelData: setCachedModelData } =
      useCacheStore.getState()

    const cachedModelData = cachedModelDatas[initialResourceLocation]

    let tempIsBlockShapedItemModel = false

    let tempTextures: Record<string, string> = {}

    let tempDisplay = {} as ModelData['display']
    let tempElements: ModelElement[] = []

    if (cachedModelData != null) {
      setModelData(cachedModelData.data)
      setIsBlockShapedItemModel(cachedModelData.isBlockShapedItemModel)
      return
    }

    let textureSize: [number, number] | undefined = undefined

    const f = async (resourceLocation: string) => {
      const resourceLocationData = (await fetcher(
        `/assets/minecraft/models/${resourceLocation}.json`,
      )) as CDNModelResponse

      // 불러온 model 데이터들을 합쳐서 저장 (기존 데이터 우선)
      tempTextures = { ...resourceLocationData.textures, ...tempTextures }
      tempDisplay = { ...resourceLocationData.display, ...tempDisplay }
      if (
        tempElements.length < 1 &&
        resourceLocationData.elements != null &&
        resourceLocationData.elements.length > 0
      ) {
        // elements는 한 파일에서만 설정 가능하므로 이미 설정된 elements가 없을 경우에만 설정
        tempElements = resourceLocationData.elements
      }

      if (resourceLocationData.texture_size != null && textureSize == null) {
        textureSize = resourceLocationData.texture_size
      }

      // parent가 없으면 최상위 모델 파일이므로 로딩 끝내기
      if (resourceLocationData.parent == null) {
        return
      }

      if (resourceLocationData.parent === 'builtin/generated') {
        // elements가 따로 정의되어 있지 않다면 아이템 모델 generate 수행
        if (
          tempElements.length < 1 &&
          (resourceLocationData.elements == null ||
            resourceLocationData.elements.length < 1)
        ) {
          // item display model 파일에 parent가 builtin/generated인 경우
          // layer{n} 텍스쳐 이미지에서 모델 구조를 직접 생성
          const textureLayerPromises = Object.keys(tempTextures)
            .filter((key) => /^layer\d{1,}$/.test(key))
            .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5))) // layer0, layer1 등에서 `layer` 자르기
            .map((key) =>
              generateBuiltinItemModel(
                stripMinecraftPrefix(tempTextures[key]),
                parseInt(key.slice(5)),
              ),
            )
          try {
            const generatedItemModels = await Promise.all(textureLayerPromises)
            tempElements = tempElements.concat(
              ...generatedItemModels.map((d) => d.elements),
            )

            // parent가 builtin/generated이면 최상위 모델 파일과 다름없으므로 로딩 끝내기
            return
          } catch (err) {
            console.error(err)
          }
        }
      } else {
        if (isItemModel && resourceLocationData.parent?.startsWith('block/')) {
          tempIsBlockShapedItemModel = true
        }

        // parent 값이 있다면 재귀호출로 parent의 model 데이터를 불러오도록 처리
        await f(stripMinecraftPrefix(resourceLocationData.parent))
      }
    }

    f(initialResourceLocation)
      .then(() => {
        // 모델 데이터 로딩 및 계산이 완료되었고 elements 데이터가 있다면
        // 다음에 로드 시 모델 데이터를 다시 계산할 필요가 없도록 캐싱
        const newModelData: ModelData = {
          elements: tempElements,
          textures: tempTextures,
          display: tempDisplay,
          textureSize,
        }

        setCachedModelData(
          initialResourceLocation,
          newModelData,
          tempIsBlockShapedItemModel,
        )
        setModelData(newModelData)
        setIsBlockShapedItemModel(tempIsBlockShapedItemModel)
      })
      .catch(console.error)
  }, [initialResourceLocation, isItemModel, modelData])

  return { modelData, isBlockShapedItemModel }
}

export default useModel
