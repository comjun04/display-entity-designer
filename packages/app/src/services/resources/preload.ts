import {
  type BlockStateApplyModelInfo,
  type DisplayEntity,
  type PlayerHeadProperties,
  isItemDisplayPlayerHead,
} from '@/types'

import { getLogger } from '../loggerService'
import { getMatchingBlockstateModel, loadBlockstates } from './blockstates'
import { loadModel } from './model'
import { loadModelMaterials } from './modelMesh'

const logger = getLogger('ResourceLoader')

export async function preloadResources(entities: DisplayEntity[]) {
  const applyModelInfoList: (BlockStateApplyModelInfo & {
    playerHeadTextureData?: NonNullable<PlayerHeadProperties['texture']>
  })[] = []

  logger.log('preLoadResources(): start preloading resources')

  for (const entity of entities) {
    if (entity.kind === 'block') {
      const blockstatesData = await loadBlockstates(entity.type)

      const aa = getMatchingBlockstateModel(blockstatesData, entity.blockstates)
      applyModelInfoList.push(...aa)
    } else if (entity.kind === 'item') {
      applyModelInfoList.push({
        model: `item/${entity.type}`,
        playerHeadTextureData: isItemDisplayPlayerHead(entity)
          ? (entity.playerHeadProperties.texture ?? undefined)
          : undefined,
      })
    }
  }

  const batchLoadResults = await Promise.allSettled(
    applyModelInfoList.map(async (applyModelInfo) => {
      const modelData = await loadModel(applyModelInfo.model)
      const { data } = modelData

      await loadModelMaterials({
        modelResourceLocation: applyModelInfo.model,
        elements: data.elements,
        textures: data.textures,
        isItemModel: false,
        playerHeadTextureData: applyModelInfo.playerHeadTextureData,
      })
    }),
  )
  const batchLoadSuccessCount = batchLoadResults.filter(
    (d) => d.status === 'fulfilled',
  ).length
  logger.debug(
    `preLoadResources(): total ${batchLoadResults.length}, success ${batchLoadSuccessCount}, failed ${batchLoadResults.length - batchLoadSuccessCount}`,
  )

  logger.log('preLoadResources(): finish preloading resources')
}
