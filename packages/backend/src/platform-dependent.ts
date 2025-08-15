export type Runtime = 'bun' | 'deno' | 'cloudflare-workers' | 'node' | 'unknown'

export function detectRuntime(): Runtime {
  // Bun
  if (typeof Bun !== 'undefined') return 'bun'

  // Deno
  if (typeof Deno !== 'undefined') return 'deno'

  // Cloudflare Workers or similar Edge runtime
  if (typeof WebSocketPair !== 'undefined' && typeof caches !== 'undefined') {
    return 'cloudflare-workers'
  }

  // Node.js
  if (typeof process !== 'undefined' && process.versions?.node) return 'node'

  return 'unknown'
}

export async function getConnInfoFn() {
  const runtime = detectRuntime()
  switch (runtime) {
    case 'bun': {
      const { getConnInfo } = await import('hono/bun')
      return getConnInfo
    }
    case 'deno': {
      const { getConnInfo } = await import('hono/deno')
      return getConnInfo
    }
    case 'cloudflare-workers': {
      const { getConnInfo } = await import('hono/cloudflare-workers')
      return getConnInfo
    }
    case 'node': {
      const { getConnInfo } = await import('@hono/node-server/conninfo')
      return getConnInfo
    }

    default:
      throw new Error(`Unsupported runtime ${runtime}`)
  }
}
