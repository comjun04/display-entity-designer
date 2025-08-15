// TODO: app에서 선언된 타입이랑 중복되는거 같으니 common 패키지로 추출하기

import { BlockStateApplyModelInfo } from '@depl/shared'

export type BlockstatesFile =
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

export interface ModelFile {
  parent?: string
  elements?: unknown[]
}

// CDN files

export interface CDNVersionManifest {
  latest: {
    release: string
    snapshot: string
  }
  versions: {
    id: string
    type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha'
    url: string
    time: string
    releaseTime: string
  }[]
}

export interface AssetIndex {
  id: string
  sha1: string
  size: number
  totalSize: number
  url: string
}
export interface CDNClientJson {
  assetIndex: AssetIndex
  assets: string
  downloads: {
    // client.jar
    client: {
      sha1: string
      size: number
      url: string
    }
    // server.jar
    server: {
      sha1: string
      size: number
      url: string
    }
    id: string
  }
}

export type CDNAssetIndexJson = {
  objects: {
    [x: string]: {
      hash: string
      size: number
    }
  }
}
