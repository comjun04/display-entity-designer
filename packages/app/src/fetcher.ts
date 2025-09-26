import { CDNBaseUrl } from './constants'
import { AssetFileInfosCache } from './stores/cacheStore'
import { useProjectStore } from './stores/projectStore'
import { CDNBlocksListResponse, CDNItemsListResponse } from './types'

export default async function fetcher<T>(
  url: string,
  useIncremental: boolean = false,
): Promise<{
  fromVersion: string
  data: T
}> {
  const slashPrefixedUrl = url.length > 0 && url[0] !== '/' ? `/${url}` : url

  let fromVersion: string
  if (useIncremental) {
    const assetFileInfo =
      await AssetFileInfosCache.instance.fetchFileInfo(slashPrefixedUrl)
    if (assetFileInfo == null) {
      throw new Error(`Cannot get info of asset file ${slashPrefixedUrl}`)
    }

    fromVersion = assetFileInfo.fromVersion
  } else {
    fromVersion = useProjectStore.getState().targetGameVersion
  }

  const fullFileUrl = useIncremental
    ? await AssetFileInfosCache.instance.makeFullFileUrl(slashPrefixedUrl)
    : `${CDNBaseUrl}/${fromVersion}${slashPrefixedUrl}`

  const fetchedData = (await fetch(fullFileUrl).then((r) => r.json())) as T
  return {
    fromVersion,
    data: fetchedData,
  }
}

export async function getBlockList(gameVersion: string) {
  return (await fetch(
    `${CDNBaseUrl}/${gameVersion}/assets/minecraft/blocks.json`,
  ).then((res) => res.json())) as CDNBlocksListResponse
}
export async function getItemList(gameVersion: string) {
  return (await fetch(
    `${CDNBaseUrl}/${gameVersion}/assets/minecraft/items.json`,
  ).then((res) => res.json())) as CDNItemsListResponse
}
