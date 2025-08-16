import 'dotenv/config'

import { serve } from '@hono/node-server'
import app from './app'

const port = parseInt(process.env.PORT ?? '3001')

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Listening on http://localhost:${info.port}`)
  },
)

// graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl+C), Shutting down...')
  server.close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, Gracefully shutting down...')
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})
