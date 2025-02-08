import { BlockStateApplyModelInfo, DisplayEntity } from '@/types'

import { getLogger } from '../loggerService'
import { getMatchingBlockstateModel, loadBlockstates } from './blockstates'
import { loadModel } from './model'
import { loadModelMaterials } from './modelMesh'

const logger = getLogger('ResourceLoader')

export async function preloadResources(entities: DisplayEntity[]) {
  const applyModelInfoList: BlockStateApplyModelInfo[] = []

  logger.log('preLoadResources(): start preloading resources')

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

  logger.log('preLoadResources(): finish preloading resources')
}
