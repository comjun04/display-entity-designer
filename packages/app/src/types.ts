export type CDNBlocksListResponse = {
  blocks: string[]
}

export type BlockStateApplyModelInfo = {
  model: string
  uvlock?: boolean
  x?: number
  y?: number
}

export type CDNBlockStatesResponse =
  | {
      variants: Record<string, BlockStateApplyModelInfo>
    }
  | {
      multipart: {
        apply: BlockStateApplyModelInfo
        when?:
          | {
              AND: Record<string, string>[]
            }
          | {
              OR: Record<string, string>[]
            }
          | Record<string, string>
      }[]
    }
