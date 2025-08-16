export type { BlockStatesFile, ModelFile } from '@depl/shared'

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
