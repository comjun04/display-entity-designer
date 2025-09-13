import { CDNBaseUrl } from './constants'
import { AssetFileInfosCache } from './stores/cacheStore'
import { useProjectStore } from './stores/projectStore'

export default async function fetcher(
  url: string,
  useIncremental: boolean = false,
) {
  const slashPrefixedUrl = url.length > 0 && url[0] !== '/' ? `/${url}` : url

  const fullFileUrl = useIncremental
    ? await AssetFileInfosCache.instance.makeFullFileUrl(slashPrefixedUrl)
    : `${CDNBaseUrl}/${useProjectStore.getState().targetGameVersion}${slashPrefixedUrl}`

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return fetch(fullFileUrl).then((r) => r.json())
}
