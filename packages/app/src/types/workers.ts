export interface HeadBakerWorkerMessage {
  cmd: 'run'
  mineskinApiKey: string
  heads: {
    entityId: string
    texturePixels: number[]
  }[]
}
