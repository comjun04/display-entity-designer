import fetcher from '@/fetcher'
import { useCacheStore } from '@/stores/cacheStore'
import {
  BlockStateApplyModelInfo,
  BlockstatesData,
  CDNBlockStatesResponse,
  CDNModelResponse,
  DisplayEntity,
  ModelData,
  ModelElement,
} from '@/types'
import { generateBuiltinItemModel, stripMinecraftPrefix } from '@/utils'

import { loadModelMaterials } from './resources/modelMesh'

export async function preloadResources(entities: DisplayEntity[]) {
  const applyModelInfoList: BlockStateApplyModelInfo[] = []

  console.log('preLoadResources(): start preloading resources')

  for (const entity of entities) {
    if (entity.kind === 'block') {
      const blockstatesData = await loadBlockstates(entity.type)

      const aa = getMatchingBlockstateModel(blockstatesData, entity.blockstates)
      applyModelInfoList.push(...aa)
    } else if (entity.kind === 'item') {
      applyModelInfoList.push({
        model: `item/${entity.type}`,
      })
    }
  }

  for (const applyModelInfo of applyModelInfoList) {
    const modelData = await loadModel(applyModelInfo.model)
    const { data } = modelData

    await loadModelMaterials({
      modelResourceLocation: applyModelInfo.model,
      elements: data.elements,
      textures: data.textures,
      textureSize: data.textureSize,
      isItemModel: false,
    })
  }

  console.log('preLoadResources(): finish preloading resources')
}

function getMatchingBlockstateModel(
  blockstatesData: BlockstatesData,
  blockstates: Record<string, string>,
) {
  return blockstatesData.models
    .map((model) => {
      let shouldRender = model.when.length < 1 // when 배열 안에 조건이 정의되어 있지 않다면 무조건 렌더링
      for (const conditionObject of model.when) {
        let andConditionCheckSuccess = true
        for (const conditionKey in conditionObject) {
          if (
            blockstates[conditionKey] == null ||
            !conditionObject[conditionKey].includes(blockstates[conditionKey])
          ) {
            andConditionCheckSuccess = false
            break
          }
        }

        if (andConditionCheckSuccess) {
          shouldRender = true
          break
        }
      }

      return shouldRender ? model.apply[0] : null
    })
    .filter((d) => d != null)
}

export async function loadBlockstates(
  blockString: string,
): Promise<BlockstatesData> {
  const blockType = blockString.split('[')[0]

  const directFetchedBlockstatesData =
    useCacheStore.getState().blockstatesData[blockType]
  if (directFetchedBlockstatesData != null) {
    return directFetchedBlockstatesData
  }

  console.log(`Loading blockstates for block ${blockType}`)

  const rawBlockstatesData = (await fetcher(
    `/assets/minecraft/blockstates/${blockType}.json`,
  )) as CDNBlockStatesResponse

  const blockDefaultValues: Record<string, string> =
    blockString != null
      ? blockString
          .slice(blockString.length + 1, -1)
          .split(',')
          .reduce((acc, cur) => {
            const [key, value] = cur.split('=')
            return {
              ...acc,
              [key]: value,
            }
          }, {})
      : {}

  const blockstateMap = new Map<
    string,
    {
      states: Set<string>
      default: string
    }
  >()
  const models: {
    // array 안에 있는 object들은 OR조건으로 계산, object들 중 하나만 맞아도 통과
    // 각 object들은 AND조건으로 계산, object 안에 있는 key와 value들이 모두 맞아야 함
    when: Record<string, string[]>[]
    apply: BlockStateApplyModelInfo[]
  }[] = []

  const addBlockstatesKeyValue = (key: string, originalValues: string[]) => {
    const values = originalValues.slice()

    // `*_fence` 울타리 블록들은 blockstates 파일에서 true만 뽑아낼 수 있기 떄문에, false 값을 직접 추가
    if (values.includes('true')) {
      values.push('false')
    } else if (values.includes('false')) {
      // 반대의 경우도 혹시나 모르지만 추가 (어차피 Set에다 넣을거라 중복안됨)
      values.push('true')
    }

    // `*_wall` 벽 블록들은 low, tall 외에 none도 state로 사용할 수 있음 (맨 처음에 넣기)
    if (values.includes('low') || values.includes('tall')) {
      values.unshift('none')
    }

    if (blockstateMap.has(key)) {
      values.forEach((v) => blockstateMap.get(key)!.states.add(v))
    } else {
      blockstateMap.set(key, {
        states: new Set(values),
        default: blockDefaultValues[key] ?? values[0],
      })
    }
  }

  if ('variants' in rawBlockstatesData) {
    for (const key in rawBlockstatesData.variants) {
      const blockstateDefinition = key.split(',').map((section) => {
        const [k, v] = section.split('=')
        return { key: k, value: v }
      })

      for (const blockstate of blockstateDefinition) {
        addBlockstatesKeyValue(blockstate.key, [blockstate.value])
      }

      const applyInfos = Array.isArray(rawBlockstatesData.variants[key])
        ? rawBlockstatesData.variants[key]
        : [rawBlockstatesData.variants[key]]
      models.push({
        when: [
          blockstateDefinition
            .filter((d) => d.key.length > 0) // key값이 `''`인 조건 없애기
            .reduce<Record<string, string[]>>(
              (acc, cur) => ({ ...acc, [cur.key]: [cur.value] }),
              {},
            ),
        ],
        apply: applyInfos.map((info) => ({
          ...info,
          model: stripMinecraftPrefix(info.model),
        })),
      })
    }
  } else if ('multipart' in rawBlockstatesData) {
    for (const multipartItem of rawBlockstatesData.multipart) {
      // when 구문이 없을 경우, 무조건 적용
      if (multipartItem.when == null) {
        const applyInfos = Array.isArray(multipartItem.apply)
          ? multipartItem.apply
          : [multipartItem.apply]
        models.push({
          when: [],
          apply: applyInfos.map((info) => ({
            ...info,
            model: stripMinecraftPrefix(info.model),
          })),
        })

        continue
      }

      if (
        'AND' in multipartItem.when &&
        Array.isArray(multipartItem.when.AND)
      ) {
        const obj: Record<string, string[]> = {}

        for (const andConditions of multipartItem.when.AND) {
          for (const key in andConditions) {
            const values = andConditions[key].split('|')

            addBlockstatesKeyValue(key, values)

            obj[key] = values
          }
        }

        const applyInfos = Array.isArray(multipartItem.apply)
          ? multipartItem.apply
          : [multipartItem.apply]
        models.push({
          when: [obj],
          apply: applyInfos.map((info) => ({
            ...info,
            model: stripMinecraftPrefix(info.model),
          })),
        })
      } else if (
        'OR' in multipartItem.when &&
        Array.isArray(multipartItem.when.OR)
      ) {
        const conditions: Record<string, string[]>[] = []

        for (const orConditions of multipartItem.when.OR) {
          const obj: Record<string, string[]> = {}

          for (const key in orConditions) {
            const values = orConditions[key].split('|')

            addBlockstatesKeyValue(key, values)

            obj[key] = values
          }

          conditions.push(obj)
        }

        const applyInfos = Array.isArray(multipartItem.apply)
          ? multipartItem.apply
          : [multipartItem.apply]
        models.push({
          when: conditions,
          apply: applyInfos.map((info) => ({
            ...info,
            model: stripMinecraftPrefix(info.model),
          })),
        })
      } else if (
        !('AND' in multipartItem.when) &&
        !('OR' in multipartItem.when)
      ) {
        // AND와 OR key가 둘 다 없는 경우, object 안에 있는 key들을 전부 하나의 AND조건으로 계산

        const obj: Record<string, string[]> = {}

        for (const key in multipartItem.when) {
          const values = multipartItem.when[key].split('|')

          addBlockstatesKeyValue(key, values)

          obj[key] = values
        }

        const applyInfos = Array.isArray(multipartItem.apply)
          ? multipartItem.apply
          : [multipartItem.apply]
        models.push({
          when: [obj],
          apply: applyInfos.map((info) => ({
            ...info,
            model: stripMinecraftPrefix(info.model),
          })),
        })
      }
    }
  }

  // blockstate가 없을 경우 empty string을 key로 사용하게 되어 map에 들어가게 됨
  // 데이터 리턴 전에 빼주기
  blockstateMap.delete('')

  const newBlockstatesData = { blockstates: blockstateMap, models }
  useCacheStore.getState().setBlockstateData(blockType, newBlockstatesData)
  return { blockstates: blockstateMap, models }
}

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
