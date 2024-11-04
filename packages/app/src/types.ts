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
  from: [number, number, number]
  to: [number, number, number]
  faces: {
    [x in ModelFaceKey]?: {
      uv?: [number, number, number, number]
      texture: string
      rotation?: 0 | 90 | 180 | 270
      tintindex?: number
    }
  }
  rotation?: {
    origin: [number, number, number]
    axis: 'x' | 'y' | 'z'
    angle: number
    rescale?: boolean
  }
}

export type CDNModelResponse = {
  parent?: string
  display?: {
    [x in ModelDisplayPositionKey]?: {
      rotation: [number, number, number]
      translation: [number, number, number]
      scale: [number, number, number]
    }
  }
  elements?: ModelElement[]
  textures?: Record<string, string>
}
