import fetcher from '@/fetcher'
import { useCacheStore } from '@/stores/cacheStore'
import { CDNModelResponse, ModelData, ModelElement } from '@/types'
import { generateBuiltinItemModel, stripMinecraftPrefix } from '@/utils'

export async function loadModel(resourceLocation: string) {
  const {
    modelData,
    setModelData: setCachedModelData,
    setModelJson,
  } = useCacheStore.getState()

  const cachedModelData = modelData[resourceLocation]
  if (cachedModelData != null) {
    return cachedModelData
  }

  console.log(`Loading model for ${resourceLocation}`)

  const isItemModel = stripMinecraftPrefix(resourceLocation).startsWith('item/')

  let isBlockShapedItemModel = false

  let textures: Record<string, string> = {}

  let display = {} as ModelData['display']
  let elements: ModelElement[] = []

  let textureSize: [number, number] | undefined = undefined

  const f = async (currentResourceLocation: string) => {
    let resourceLocationData =
      useCacheStore.getState().modelJson[currentResourceLocation]
    if (resourceLocationData == null) {
      resourceLocationData = (await fetcher(
        `/assets/minecraft/models/${currentResourceLocation}.json`,
      )) as CDNModelResponse
      setModelJson(currentResourceLocation, resourceLocationData)
    }

    // 불러온 model 데이터들을 합쳐서 저장 (기존 데이터 우선)
    textures = { ...resourceLocationData.textures, ...textures }
    display = { ...resourceLocationData.display, ...display }
    if (
      elements.length < 1 &&
      resourceLocationData.elements != null &&
      resourceLocationData.elements.length > 0
    ) {
      // elements는 한 파일에서만 설정 가능하므로 이미 설정된 elements가 없을 경우에만 설정
      elements = resourceLocationData.elements
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
        elements.length < 1 &&
        (resourceLocationData.elements == null ||
          resourceLocationData.elements.length < 1)
      ) {
        // item display model 파일에 parent가 builtin/generated인 경우
        // layer{n} 텍스쳐 이미지에서 모델 구조를 직접 생성
        const textureLayerPromises = Object.keys(textures)
          .filter((key) => /^layer\d{1,}$/.test(key))
          .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5))) // layer0, layer1 등에서 `layer` 자르기
          .map((key) =>
            generateBuiltinItemModel(
              stripMinecraftPrefix(textures[key]),
              parseInt(key.slice(5)),
            ),
          )
        try {
          const generatedItemModels = await Promise.all(textureLayerPromises)
          elements = elements.concat(
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
        isBlockShapedItemModel = true
      }

      // parent 값이 있다면 재귀호출로 parent의 model 데이터를 불러오도록 처리
      await f(stripMinecraftPrefix(resourceLocationData.parent))
    }
  }

  await f(resourceLocation).catch(console.error)

  // 모델 데이터 로딩 및 계산이 완료되었고 elements 데이터가 있다면
  // 다음에 로드 시 모델 데이터를 다시 계산할 필요가 없도록 캐싱
  const newModelData: ModelData = {
    elements,
    textures,
    display,
    textureSize,
  }

  setCachedModelData(resourceLocation, newModelData, isBlockShapedItemModel)
  return { data: newModelData, isBlockShapedItemModel }
}
