import {
  BlockStateApplyModelInfo,
  BlockStatesFile,
  ModelDisplayPositionKey,
  ModelElement,
  Number3Tuple,
} from '@depl/shared'
import { MutableRefObject, RefCallback } from 'react'
import { Matrix4Tuple } from 'three'

// re-export imported types from shared package
export type {
  BlockStateApplyModelInfo,
  BlockStatesFile,
  ModelDisplayPositionKey,
  ModelElement,
  Number3Tuple,
}

export type {
  BackendAPIV1GetPlayerSkinResponse,
  ModelFaceKey,
  ModelFile,
  TextureValue,
  VersionMetadata,
} from '@depl/shared'

// ===========

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

export type PartialNumber3Tuple = [
  number | undefined,
  number | undefined,
  number | undefined,
]

export type CDNBlocksListResponse = {
  blocks: string[]
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
  display: ModelDisplayPositionKey | null
} & (
    | {
        type: 'player_head'
        playerHeadProperties: PlayerHeadProperties
      }
    | {
        type: string
      }
  )

export interface PlayerHeadProperties {
  texture:
    | {
        baked: true
        url: string
      }
    | {
        baked: false
      }
    | null
}

// player head type guard
export function isItemDisplayPlayerHead(
  entity: DisplayEntity,
): entity is ItemDisplayEntity & {
  type: 'player_head'
  playerHeadProperties: PlayerHeadProperties
} {
  if (entity.kind !== 'item') return false
  else if (entity.type !== 'player_head') return false
  return true
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
  // global text color
  // will be replaced with advanced text editor
  textColor: number // RGB
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

export type DisplayEntitySaveDataItem = {
  transforms: Matrix4Tuple
} & (
  | Pick<BlockDisplayEntity, 'kind' | 'type' | 'blockstates' | 'display'>
  | Omit<ItemDisplayEntity, 'id' | 'parent' | 'position' | 'rotation' | 'size'>
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
}[]

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
      name: string // text
      options: {
        color: string // text color, #abcdef
        alpha: number // text color alpha, 0 ~ 1
        backgroundColor: string // #abcdef
        backgroundColorAlpha: number // 0 ~ 1
        bold: boolean
        italic: boolean
        underline: boolean
        strikeThrough: boolean
        obfuscated: boolean
        lineLength: number
        align: TextDisplayAlignment
      }
    }
  | {
      isItemDisplay: true

      // below fields exist if type is player_head
      tagHead?: {
        Value: string
      }
      textureValueList?: string[] // maybe?
      paintTexture?: unknown
      defaultTextureValue?: string
    }
  | {
      isCollection: true
      children: BDEngineSaveDataItem[]
    }
)

export interface MinimalTextureValue {
  textures: {
    SKIN: {
      url: string
    }
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type History =
  | {
      type: 'createEntities'
      beforeState: Record<string, never>
      afterState: {
        entities: DisplayEntity[]
      }
    }
  | {
      type: 'deleteEntities'
      beforeState: {
        entities: DisplayEntity[]
      }
      afterState: Record<string, never>
    }
  | {
      type: 'group' | 'ungroup'
      parentGroupId: string
      childrenEntityIds: string[]
    }
  | {
      type: 'changeProperties'
      entities: {
        id: string
        beforeState: HistoryChangePropertiesState
        afterState: HistoryChangePropertiesState
      }[]
    }

type HistoryChangePropertiesStateCommonOmitKeys = 'kind' | 'id' | 'parent'
type HistoryChangePropertiesState =
  | (Pick<BlockDisplayEntity, 'kind'> &
      Partial<
        Omit<BlockDisplayEntity, HistoryChangePropertiesStateCommonOmitKeys>
      >)
  | (Pick<ItemDisplayEntity, 'kind'> &
      Partial<
        Omit<ItemDisplayEntity, HistoryChangePropertiesStateCommonOmitKeys>
      >)
  | (Pick<TextDisplayEntity, 'kind'> &
      // extract position, rotation, size as non-DeepPartial as DeepPartial breaks Number3Tuple constraints
      Partial<Pick<TextDisplayEntity, 'position' | 'rotation' | 'size'>> &
      DeepPartial<
        Omit<
          TextDisplayEntity,
          | HistoryChangePropertiesStateCommonOmitKeys
          | 'position'
          | 'rotation'
          | 'size'
        >
      >)
  | (Pick<DisplayEntityGroup, 'kind'> &
      Partial<
        Omit<
          DisplayEntityGroup,
          HistoryChangePropertiesStateCommonOmitKeys | 'children'
        >
      >)
