export type HeadBakerJob = {
  jobId?: string
  entityId: string
  playerHeadSkinImage: Blob
} & (
  | {
      status: 'queued' | 'generating' | 'error'
    }
  | {
      status: 'completed'
      generatedData: {
        skinUrl: string
      }
    }
)

export type HeadBakerJobStatus = 'queued' | 'generating' | 'error' | 'completed'

export interface HeadBakerWorkerMessage {
  cmd: 'run'
  mineskinApiKey: string
  heads: {
    entityId: string
    texturePixels: number[]
  }[]
}

export type HeadBakerWorkerResponse =
  | {
      type: 'update'
      stats: {
        total: number
        generating: number
        error: number
        completed: number
      }
      heads: ({
        entityId: string
      } & (
        | {
            status: 'queued' | 'generating' | 'error'
          }
        | {
            status: 'completed'
            generatedData: {
              skinUrl: string
            }
          }
      ))[]
    }
  | {
      type: 'done'
      heads: ({
        entityId: string
      } & (
        | {
            status: 'error'
          }
        | {
            status: 'completed'
            generatedData: {
              skinUrl: string
            }
          }
      ))[]
    }
