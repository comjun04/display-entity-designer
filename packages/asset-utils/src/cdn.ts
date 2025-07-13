import { createHash } from 'crypto'
import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
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

async function calculateFileHash(filePath: string) {
  const buf = await readFile(filePath)
  const hash = createHash('sha1').update(buf).digest('hex')
  return hash
}

export async function downloadAssets(versionId: string, baseDirPath: string) {
  // First fetch client.json to check the data of that version
  const versionData = await fetchVersionData(versionId)

  // Check hash of existing client.jar file
  // download if file not exists or hash mismatch
  console.log('Checking for existing client.jar file')
  const clientJarFilePath = pathJoin(baseDirPath, 'client.jar')
  const existingClientJarHash = await calculateFileHash(clientJarFilePath).catch(_ => null)
  if (existingClientJarHash !== versionData.downloads.client.sha1) {
    console.log('Downloading client.jar from Mojang CDN...')
    const clientJarWriteStream = createWriteStream(clientJarFilePath)
    const clientJarFetchResponse = await fetch(versionData.downloads.client.url)
    await finished(Readable.fromWeb(clientJarFetchResponse.body).pipe(clientJarWriteStream))
  }
  
  // same thing goes for server.jar
  console.log('Checking for existing server.jar file')
  const serverJarFilePath = pathJoin(baseDirPath, 'server.jar')
  const existingServerJarHash = await calculateFileHash(serverJarFilePath).catch(_ => null)
  if (existingServerJarHash !== versionData.downloads.server.sha1) {
    console.log('Downloading server.jar from Mojang CDN...')
    const serverJarWriteStream = createWriteStream(serverJarFilePath)
    const serverJarFetchResponse = await fetch(versionData.downloads.server.url)
    await finished(Readable.fromWeb(serverJarFetchResponse.body).pipe(serverJarWriteStream))
  }
}

