import { MutableRefObject, RefCallback } from 'react'
import { Matrix4Tuple } from 'three'

declare global {
  var __depl_alertUncaughtError: boolean | undefined
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P]
}

/**
 * ref에 커스텀 함수(callback)을 쓸 수 있으면서
 * 동시에 `current` 값도 사용할 수 있는 Ref
 */
export type RefCallbackWithMutableRefObject<T> = RefCallback<T> &
  MutableRefObject<T>

export type Number3Tuple = [number, number, number]
export type PartialNumber3Tuple = [
  number | undefined,
  number | undefined,
  number | undefined,
]

export type VersionMetadata = {
  gameVersion: string // minecraft version
  sharedAssets: {
    assetIndex: number
    unifontHexFilePath: string
  }
}

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

export type BlockstatesData = {
  blockstates: Map<
    string,
    {
      states: Set<string>
      default: string
    }
  >
  models: {
    when: Record<string, string[]>[]
    apply: BlockStateApplyModelInfo[]
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

export type ModelData = {
  textures: Record<string, string>
  textureSize?: [number, number]
  display: Record<
    ModelDisplayPositionKey,
    {
      rotation?: Number3Tuple
      translation?: Number3Tuple
      scale?: Number3Tuple
    }
  >
  elements: ModelElement[]
}

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

export type FontProvider =
  | {
      type: 'bitmap'
      ascent: number
      chars: string[]
      file: string
      height?: number
    }
  | {
      type: 'space'
      advances: Record<string, number>
    }

export type CDNFontProviderResponse = {
  providers: FontProvider[]
}

export type BaseDisplayEntity = {
  id: string
  parent?: string
  size: Number3Tuple
  position: Number3Tuple
  rotation: Number3Tuple
}

export type BlockDisplayEntity = BaseDisplayEntity & {
  kind: 'block'
  type: string
  blockstates: Record<string, string>
  display: ModelDisplayPositionKey | null
}

export type ItemDisplayEntity = BaseDisplayEntity & {
  kind: 'item'
  type: string
  display: ModelDisplayPositionKey | null
}

export type TextDisplayAlignment = 'left' | 'center' | 'right'
export type TextEffects = {
  bold: boolean
  italic: boolean
  underlined: boolean
  strikethrough: boolean
  obfuscated: boolean
}

export type TextDisplayEntity = BaseDisplayEntity & {
  kind: 'text'
  text: string
  // global text effects
  // will be replaced with advanced text editor
  textEffects: TextEffects
  alignment: TextDisplayAlignment
  backgroundColor: number // ARGB
  defaultBackground: boolean // default_background
  lineWidth: number
  seeThrough: boolean
  shadow: boolean
  textOpacity: number // 0 ~ 255
}

export type DisplayEntityGroup = BaseDisplayEntity & {
  kind: 'group'
  children: string[] // list of entity ids
}

export type DisplayEntity =
  | BlockDisplayEntity
  | ItemDisplayEntity
  | TextDisplayEntity
  | DisplayEntityGroup

export type DisplayEntitySaveDataItemOld = Pick<DisplayEntity, 'kind'> &
  Partial<Pick<BlockDisplayEntity, 'type'>> & {
    transforms: Matrix4Tuple
    children?: DisplayEntitySaveDataItem[]
  }

export type DisplayEntitySaveDataItem = {
  transforms: Matrix4Tuple
} & (
  | Pick<BlockDisplayEntity, 'kind' | 'type' | 'blockstates' | 'display'>
  | Pick<ItemDisplayEntity, 'kind' | 'type' | 'display'>
  | Omit<TextDisplayEntity, 'id' | 'parent' | 'position' | 'rotation' | 'size'>
  | (Pick<DisplayEntityGroup, 'kind'> & {
      children: DisplayEntitySaveDataItem[]
    })
)

// BDEngine

export type BDEngineSaveData = {
  isCollection: true
  name: string
  transforms: Matrix4Tuple
  children: BDEngineSaveDataItem[]
  settings: { defaultBrightness: boolean }
  mainNBT: string
}[] // 왜 얘내들 최상단 Project group을 배열에 넣어둠???

export type BDEngineSaveDataItem = {
  name: string
  nbt: string
  transforms: Matrix4Tuple
  brightness: {
    sky: number
    block: number
  }
} & (
  | {
      isBlockDisplay: true
    }
  | {
      isTextDisplay: true
      // TODO: implement
    }
  | {
      isItemDisplay: true
    }
  | {
      isCollection: true
      children: BDEngineSaveDataItem[]
    }
)

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
