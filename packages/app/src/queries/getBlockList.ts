import type { QueryFunctionContext } from '@tanstack/react-query'

import { CDNBaseUrl } from '@/constants'
import { queryClient } from '@/query'
import type { CDNBlocksListResponse } from '@/types'

export async function getBlockListQueryFn({ queryKey }: QueryFunctionContext) {
  const [, gameVersion] = queryKey
  return (await fetch(
    `${CDNBaseUrl}/${gameVersion}/assets/minecraft/blocks.json`,
  ).then((res) => res.json())) as CDNBlocksListResponse
}

export async function getBlockList(gameVersion: string) {
  return await queryClient.fetchQuery({
    queryKey: ['blocks.json', gameVersion],
    queryFn: getBlockListQueryFn,
    staleTime: Infinity,
  })
}
