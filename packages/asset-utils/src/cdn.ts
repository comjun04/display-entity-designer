import { createHash } from 'crypto'
import { createWriteStream } from 'fs'
import { readFile, mkdir } from 'fs/promises'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { join as pathJoin, dirname } from 'path'
import { Open } from 'unzipper'

import {
  CDNVersionManifest,
  CDNClientJson,
  CDNAssetIndexJson,
  AssetIndex,
} from './types'

const VERSION_MANIFEST_URL =
  'https://piston-meta.mojang.com/mc/game/version_manifest.json'

async function fetchVersionData(versionId: string) {
  console.log('Fetching version manifest')
  const manifestFileRoot = (await fetch(VERSION_MANIFEST_URL).then((res) =>
    res.json(),
  )) as CDNVersionManifest
  const manifest = manifestFileRoot.versions.find((d) => d.id === versionId)
  if (manifest == null) {
    throw new Error(
      `Cannot find ${versionId} on version manifest. Is that version available?`,
    )
  }

  console.log('Fetching client.json')
  const clientJson = (await fetch(manifest.url).then((res) =>
    res.json(),
  )) as CDNClientJson
  return clientJson
}

async function calculateFileHash(filePath: string) {
  const buf = await readFile(filePath)
  const hash = createHash('sha1').update(buf).digest('hex')
  return hash
}

export async function downloadAssets(
  versionId: string,
  baseDirPath: string,
  sharedAssetsBaseDir: string,
) {
  // First fetch client.json to check the data of that version
  const versionData = await fetchVersionData(versionId)

  // Check hash of existing client.jar file
  // download if file not exists or hash mismatch
  console.log('Checking for existing client.jar file')
  const clientJarFilePath = pathJoin(baseDirPath, 'client.jar')
  const existingClientJarHash = await calculateFileHash(
    clientJarFilePath,
  ).catch((_) => null)
  if (existingClientJarHash !== versionData.downloads.client.sha1) {
    console.log('Downloading client.jar from Mojang CDN...')
    const clientJarWriteStream = createWriteStream(clientJarFilePath)
    const clientJarFetchResponse = await fetch(versionData.downloads.client.url)
    await finished(
      Readable.fromWeb(clientJarFetchResponse.body).pipe(clientJarWriteStream),
    )
  }

  // same thing goes for server.jar
  console.log('Checking for existing server.jar file')
  const serverJarFilePath = pathJoin(baseDirPath, 'server.jar')
  const existingServerJarHash = await calculateFileHash(
    serverJarFilePath,
  ).catch((_) => null)
  if (existingServerJarHash !== versionData.downloads.server.sha1) {
    console.log('Downloading server.jar from Mojang CDN...')
    const serverJarWriteStream = createWriteStream(serverJarFilePath)
    const serverJarFetchResponse = await fetch(versionData.downloads.server.url)
    await finished(
      Readable.fromWeb(serverJarFetchResponse.body).pipe(serverJarWriteStream),
    )
  }

  return versionData
}

export async function downloadSharedAssets(
  assetIndex: AssetIndex,
  baseDirPath: string,
) {
  // download shared assets
  console.log(`Checking for shared assets (version: ${assetIndex.id})`)
  const sharedAssetsPath = pathJoin(baseDirPath, 'shared', assetIndex.id)
  await mkdir(sharedAssetsPath, { recursive: true })
  const assetIndexData = (await fetch(assetIndex.url).then((res) =>
    res.json(),
  )) as CDNAssetIndexJson
  const sharedAssets = new Set<string>()
  for (const key in assetIndexData.objects) {
    if (!key.startsWith('minecraft/font/')) {
      continue
    }

    console.log('Checking for existing shared asset file:', key)
    const obj = assetIndexData.objects[key]

    const destFilePath = pathJoin('assets', key)
    const destFileAbsolutePath = pathJoin(sharedAssetsPath, destFilePath)
    const existingFileHash = await calculateFileHash(destFilePath).catch(
      (_) => null,
    )
    if (existingFileHash === obj.hash) {
      continue
    }

    console.log('Downloading shared asset file:', key)
    const destFolderAbsolutePath = dirname(destFileAbsolutePath)
    await mkdir(destFolderAbsolutePath, { recursive: true })
    const writeStream = createWriteStream(destFileAbsolutePath)
    const fetchResponse = await fetch(
      `https://resources.download.minecraft.net/${obj.hash.slice(0, 2)}/${obj.hash}`,
    )
    await finished(Readable.fromWeb(fetchResponse.body).pipe(writeStream))

    if (key.endsWith('.zip')) {
      // extract zip file contents
      const zip = await Open.file(destFileAbsolutePath)
      zip.files.forEach((file) =>
        sharedAssets.add(pathJoin(dirname(destFilePath), file.path)),
      )
      await zip.extract({ path: dirname(destFileAbsolutePath) })
    } else {
      sharedAssets.add(destFilePath)
    }
  }

  return sharedAssets
}
