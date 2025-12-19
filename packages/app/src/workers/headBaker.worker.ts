import type { MineSkinAPIV2_QueueSkinGenerationBody } from '@/types'
import type { HeadBakerWorkerMessage } from '@/types/workers'

const CONCURRENT_JOBS_LIMIT = 10

let running = false
const jobs: ({
  playerHeadSkinDataUrl: string
} & (
  | {
      status: 'queued'
    }
  | {
      status: 'generating' | 'error' | 'completed'
      requestId: string
    }
  | {
      status: 'completed'
      generatedData: {
        skinUrl: string
      }
    }
))[] = []

self.onmessage = (evt: MessageEvent<HeadBakerWorkerMessage>) => {
  if (evt.data.cmd !== 'run') {
    console.error('unknown worker command')
    return
  }
  if (running) {
    console.error('worker already running')
    return
  }
  running = true

  for (const headSkinDataUrl of evt.data.heads) {
    jobs.push({
      status: 'queued',
      playerHeadSkinDataUrl: headSkinDataUrl,
    })
  }
  run().catch(console.error)
}

async function run() {
  // step 1.
  let i = 0
  while (true) {
    const jobsChunk = jobs.slice(i, CONCURRENT_JOBS_LIMIT + i)
    const res = await Promise.allSettled(
      jobsChunk.map(async (job) => {
        await fetch('https://api.mineskin.org/v2/queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'depl',
            'MineSkin-User-Agent': 'depl',
            Authorization: 'Bearer ',
          },
          body: JSON.stringify({
            url: job.playerHeadSkinDataUrl,
          } satisfies MineSkinAPIV2_QueueSkinGenerationBody),
        })
      }),
    )
    console.debug(res)
    break
  }
}
