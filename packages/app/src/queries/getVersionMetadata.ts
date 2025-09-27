import { QueryFunctionContext } from '@tanstack/react-query'

import { CDNBaseUrl } from '@/constants'
import { queryClient } from '@/query'
import { VersionMetadata } from '@/types'

export async function getVersionMetadataQueryFn({
  queryKey,
}: QueryFunctionContext) {
  const [, gameVersion] = queryKey
  return (await fetch(`${CDNBaseUrl}/${gameVersion}/metadata.json`).then(
    (res) => res.json(),
  )) as VersionMetadata
}

export async function getVersionMetadata(gameVersion: string) {
  return await queryClient.fetchQuery({
    queryKey: ['getVersionMetadata', gameVersion],
    queryFn: getVersionMetadataQueryFn,
    staleTime: Infinity,
  })
}
