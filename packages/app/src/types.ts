export type Number3Tuple = [number, number, number]

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
      variants:
        | Record<string, BlockStateApplyModelInfo>
        | Record<string, BlockStateApplyModelInfo[]>
    }
  | {
      multipart: {
        apply: BlockStateApplyModelInfo | BlockStateApplyModelInfo[]
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

export type ModelDisplayPositionKey =
  | 'thirdperson_righthand'
  | 'thirdperson_lefthand'
  | 'firstperson_righthand'
  | 'firstperson_lefthand'
  | 'gui'
  | 'head'
  | 'ground'
  | 'fixed'
export type ModelFaceKey = 'up' | 'down' | 'north' | 'south' | 'west' | 'east'

export type ModelElement = {
  __comment?: string
  from: Number3Tuple
  to: Number3Tuple
  faces: {
    [x in ModelFaceKey]?: {
      uv?: [number, number, number, number]
      texture: string
      rotation?: 0 | 90 | 180 | 270
      tintindex?: number
    }
  }
  rotation?: {
    origin: Number3Tuple
    axis: 'x' | 'y' | 'z'
    angle: number
    rescale?: boolean
  }
}

export type CDNModelResponse = {
  parent?: string
  display?: {
    [x in ModelDisplayPositionKey]?: {
      rotation: Number3Tuple
      translation: Number3Tuple
      scale: Number3Tuple
    }
  }
  elements?: ModelElement[]
  textures?: Record<string, string>
  texture_size?: [number, number]
}

export type CDNItemsListResponse = {
  items: string[]
}

export type DisplayEntity = {
  id: string
  type: string
  size: Number3Tuple
  position: Number3Tuple
  rotation: Number3Tuple
  display: ModelDisplayPositionKey | null
} & (
  | {
      kind: 'block'
      blockstates: Record<string, string>
    }
  | {
      kind: 'item'
    }
)
