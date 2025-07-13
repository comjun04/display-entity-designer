import { createWriteStream } from 'fs'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { join as pathJoin } from 'path'

import { CDNVersionManifest, CDNClientJson } from './types'

const VERSION_MANIFEST_URL = 'https://piston-meta.mojang.com/mc/game/version_manifest.json'

async function fetchVersionData(versionId: string) {
  console.log('Fetching version manifest')
  const manifestFileRoot = await fetch(VERSION_MANIFEST_URL).then(res => res.json()) as CDNVersionManifest
  const manifest = manifestFileRoot.versions.find(d => d.id === versionId)
  if (manifest == null) {
    throw new Error(`Cannot find ${versionId} on version manifest. Is that version available?`)
  }
  
  console.log('Fetching client.json')
  const clientJson = await fetch(manifest.url).then(res => res.json()) as CDNClientJson
  return clientJson
}

export async function downloadAssets(versionId: string, baseDirPath: string) {
  // First fetch client.json to check the data of that version
  const versionData = await fetchVersionData(versionId)
  
  // download client.jar and server.jar
  console.log('Downloading client.jar from Mojang CDN...')
  const clientJarWriteStream = createWriteStream(pathJoin(baseDirPath, 'client.jar'))
  const clientJarFetchResponse = await fetch(versionData.downloads.client.url)
  await finished(Readable.fromWeb(clientJarFetchResponse.body).pipe(clientJarWriteStream))

  console.log('Downloading server.jar from Mojang CDN...')
  const serverJarWriteStream = createWriteStream(pathJoin(baseDirPath, 'server.jar'))
  const serverJarFetchResponse = await fetch(versionData.downloads.server.url)
  await finished(Readable.fromWeb(serverJarFetchResponse.body).pipe(serverJarWriteStream))
}

