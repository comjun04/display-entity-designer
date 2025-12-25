import type {
  MineSkinAPIV2_ListQueueJobsResponse,
  MineSkinAPIV2_QueueSkinGenerationResponse,
} from '@/types'
import type { HeadBakerWorkerMessage } from '@/types/workers'

const CONCURRENT_JOBS_LIMIT = 10

let running = false
const jobs: ({
  jobId?: string
  entityId: string
  playerHeadSkinImage: Blob
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

self.onmessage = async (evt: MessageEvent<HeadBakerWorkerMessage>) => {
  try {
    if (evt.data.cmd !== 'run') {
      console.error('unknown worker command')
      return
    }
    if (running) {
      console.error('worker already running')
      return
    }
    running = true

    const canvas = new OffscreenCanvas(64, 64)
    const ctx = canvas.getContext('2d', {
      willReadFrequently: true,
    })!
    for (const headData of evt.data.heads) {
      // aa
      const imageData = new ImageData(64, 64)
      for (let i = 0; i < headData.texturePixels.length; i++) {
        imageData.data[i] = headData.texturePixels[i]
      }
      ctx.putImageData(imageData, 0, 0)
      const blob = await canvas.convertToBlob({ type: 'image/png' })

      jobs.push({
        status: 'queued',
        entityId: headData.entityId,
        playerHeadSkinImage: blob,
      })
    }

    await run(evt.data.mineskinApiKey)

    // done
  } catch (err) {
    console.error(err)
  }
}

async function run(apiKey: string) {
  // step 1.

  for (let i = 0; i < jobs.length; i++) {
    const jobsChunk = jobs.slice(i, CONCURRENT_JOBS_LIMIT + i)

    // queue skin generation
    const queueRes = await Promise.allSettled(
      jobsChunk.map(async (job) => {
        const formData = new FormData()
        formData.append('file', job.playerHeadSkinImage)
        formData.append('visibility', 'unlisted')

        const response = (await fetch('https://api.mineskin.org/v2/queue', {
          method: 'POST',
          headers: {
            'User-Agent': 'depl',
            'MineSkin-User-Agent': 'depl', // `User-Agent` is not changeable on browsers, so use custom header
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }).then((res) =>
          res.json(),
        )) as MineSkinAPIV2_QueueSkinGenerationResponse
        return response
      }),
    )

    queueRes.forEach((res, idx) => {
      const job = jobsChunk[idx]
      if (res.status == 'rejected' || !res.value.success) {
        job.status = 'error'
        return
      }

      const res2 = res.value
      job.jobId = res2.job.id
      switch (res2.job.status) {
        case 'waiting':
        case 'active': {
          job.status = 'generating'
          break
        }

        case 'completed': {
          job.status = 'completed'
          break
        }

        case 'failed': {
          job.status = 'error'
        }
      }
    })

    while (true) {
      const pendingJobs = jobsChunk.filter((job) => job.status === 'generating')
      if (pendingJobs.length < 1) break

      const listQueueRes = (await fetch('https://api.mineskin.org/v2/queue', {
        headers: {
          'User-Agent': 'depl',
          'MineSkin-User-Agent': 'depl',
          Authorization: `Bearer ${apiKey}`,
        },
      }).then((res) => res.json())) as MineSkinAPIV2_ListQueueJobsResponse

      for (const job of pendingJobs) {
        const match = listQueueRes.jobs.find((d) => d.id === job.jobId)
        if (match == null) {
          job.status = 'error'
          continue
        }

        switch (match.status) {
          case 'completed': {
            job.status = 'completed'
            break
          }

          case 'failed':
          case 'unknown': {
            job.status = 'error'
            break
          }
        }
      }

      await delay(1000)
    }

    i += CONCURRENT_JOBS_LIMIT
  }
}

function delay(timeMillis: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), timeMillis)
  })
}
