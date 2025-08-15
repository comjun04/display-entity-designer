export interface BlockStateApplyModelInfo {
  model: string
  uvlock?: boolean
  x?: number
  y?: number
}

export type VersionMetadata = {
  gameVersion: string // minecraft version
  sharedAssets: {
    assetIndex: number
    unifontHexFilePath: string
  }
}
