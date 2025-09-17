import { existsSync } from 'fs'
import { cp, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import {
  join as pathJoin,
  resolve as pathResolve,
  dirname,
  basename,
} from 'path'
import { createHash } from 'crypto'
import { Open } from 'unzipper'
import { rimraf } from 'rimraf'
import { spawnSync } from 'child_process'
import {
  BlockStatesFile,
  ModelFile,
  ServerJarGeneratedRegistryData,
} from './types'
import { VersionMetadata } from '@depl/shared'
import {
  blockstatesDefaultValues,
  renderableBlockEntityModelTextures,
} from './constants'
import {
  downloadAssets,
  downloadSharedAssets,
  fetchVersionManifest,
  fetchVersionData,
} from './cdn'

import {
  coerce as semverCoerce,
  satisfies as semverSatisfies,
  compare as semverCompare,
} from 'semver'
import { glob } from 'glob'

// =====

const args = process.argv
const mcVersion = args[2]
const semveredMcVersion = semverCoerce(mcVersion)?.version
if (semveredMcVersion == null) {
  console.error(`Invalid version ${mcVersion}`)
  process.exit(1)
} else if (!semverSatisfies(semveredMcVersion, '>=1.19.4')) {
  console.error(
    `Minimum target version must be 1.19.4 or above, but got ${mcVersion}`,
  )
  process.exit(1)
}

const workdirFolderRootPath = pathJoin(pathResolve(), 'workdir')
const workdirFolderSharedAssetsPath = pathJoin(workdirFolderRootPath, 'shared')
const outputFolderRootPath = pathJoin(pathResolve(), 'output')
const outputFolderSharedAssetsPath = pathJoin(outputFolderRootPath, 'shared')

// workdir 폴더 미리 생성
if (!existsSync(workdirFolderRootPath)) {
  await mkdir(workdirFolderRootPath)
}

// fetch root manifest
const rootVersionManifest = await fetchVersionManifest()
// filter release versions only
const releaseVersions = rootVersionManifest.versions.filter(
  (v) => v.type === 'release',
)
if (releaseVersions.find((v) => v.id === mcVersion) == null) {
  console.error(
    `The target version ${mcVersion} is not a valid minecraft version`,
  )
  process.exit(1)
}

// 1.19.4 <= versions to process <= targetVersion
const versions = releaseVersions
  .filter((v) =>
    semverSatisfies(semverCoerce(v.id)!, `>=1.19.4 <=${semveredMcVersion}`),
  )
  .sort((a, b) => semverCompare(semverCoerce(a.id)!, semverCoerce(b.id)!))

const sortedHardcodedDataFolders = (
  await readdir(pathJoin(pathResolve(), 'hardcoded'))
).sort((a, b) => semverCompare(semverCoerce(a)!, semverCoerce(b)!))

const fileInfos = new Map<
  string,
  {
    fromVersion: string // first version that file existed
    hash: string // file hash
    isHardcodedData: boolean
  }
>()
const blockRenderables: Record<string, boolean> = {}

for (const versionToDownload of versions) {
  const versionId = versionToDownload.id
  const workdirFolderPath = pathJoin(workdirFolderRootPath, versionId)
  const outputFolderPath = pathJoin(outputFolderRootPath, versionId)
  const assetsMinecraftFolderPath = pathJoin(
    outputFolderPath,
    'assets',
    'minecraft',
  )

  console.log(`[incremental] processing ${versionId}`)

  if ((await readdir(outputFolderPath)).length > 0) {
    console.log(`cleaning up output/${versionId} folder`)
    await rimraf(outputFolderPath)
  }

  // 해당 버전 작업 폴더가 없으면 새로 만들기
  await mkdir(workdirFolderPath, { recursive: true })
  await mkdir(assetsMinecraftFolderPath, { recursive: true })

  await downloadAssets(versionId, workdirFolderPath)

  const jarfileAbsolutePath = pathJoin(workdirFolderPath, 'client.jar')
  const zip = await Open.file(jarfileAbsolutePath)

  console.log('Extracting version asset files...')

  const filesToExtract = zip.files.filter(
    (f) =>
      /^assets\/minecraft\/(blockstates|models|font|textures\/(block|colormap|entity\/player|font|item))\//.test(
        f.path,
      ) || renderableBlockEntityModelTextures.includes(f.path),
  )
  let fileExtractSkipCount = 0
  for (const file of filesToExtract) {
    const buf = await file.buffer()
    const hash = makeHash(buf)

    const fileInfo = fileInfos.get(file.path)
    if (
      fileInfo != null &&
      (fileInfo.hash === hash || fileInfo.isHardcodedData)
    ) {
      // file is unchanged between previous version and this version
      // so skip it
      fileExtractSkipCount++
      continue
    }
    fileInfos.set(file.path, {
      fromVersion: versionId,
      hash,
      isHardcodedData: false,
    })

    const dirPath = file.path.split('/').slice(0, -1).join('/')
    await mkdir(pathJoin(outputFolderPath, dirPath), { recursive: true })
    await writeFile(pathJoin(outputFolderPath, file.path), buf)
  }
  console.log(
    `Extracted files. Skipped: ${fileExtractSkipCount} / ${filesToExtract.length}`,
  )

  // chest, shulker_box 등 엔티티 모델로 렌더링되는 블록들은 원래는 model .json파일에 element가 없어 렌더링 가능한 블록으로 인식되지 않는데,
  // 이를 렌더링 가능한 블록으로 인식시키기 위해 따로 만든 파일들을 복사해서 지정된 폴더에 붙여넣기
  console.log('Copying data in hardcoded folder to destination folder...')
  if (sortedHardcodedDataFolders.includes(versionId)) {
    const hardcodedDataVersionPath = pathJoin(
      pathResolve(),
      'hardcoded',
      versionId,
    )
    await cp(hardcodedDataVersionPath, assetsMinecraftFolderPath, {
      recursive: true,
    })

    const hardcodedDataFilePaths = await glob('**/*.*', {
      cwd: hardcodedDataVersionPath,
    })
    for (const path of hardcodedDataFilePaths) {
      const buf = await readFile(pathJoin(hardcodedDataVersionPath, path))
      const hash = makeHash(buf)

      fileInfos.set(`assets/minecraft/${path}`, {
        fromVersion: versionId,
        hash,
        isHardcodedData: true,
      })
    }
  } else {
    console.log(
      `  Skipped because hardcoded data for version ${versionId} does not exist`,
    )
  }

  const sortedFileInfos = [...fileInfos.entries()].sort((a, b) => {
    if (a < b) return -1
    else if (a > b) return 1
    else return 0
  })
  await writeFile(
    pathJoin(workdirFolderPath, 'fileInfos.json'),
    JSON.stringify(Object.fromEntries(sortedFileInfos), null, 2),
  )

  const minifiedSortedFileInfos = sortedFileInfos.map(([k, v]) => [
    k,
    { fromVersion: v.fromVersion },
  ])
  await writeFile(
    pathJoin(outputFolderPath, 'fileInfos.json'),
    JSON.stringify(Object.fromEntries(minifiedSortedFileInfos)),
  )

  console.log('Cleaning up previous server jar reports files')
  await cleanupWorkdir(versionId)

  // generate server resource reports file to get blocks.json and items.json
  console.log('Generating server.jar resource reports...')
  const serverJarfilePath = pathJoin(workdirFolderPath, 'server.jar')
  spawnSync(
    'java',
    [
      '-DbundlerMainClass=net.minecraft.data.Main',
      '-jar',
      serverJarfilePath,
      '--reports',
    ],
    {
      cwd: workdirFolderPath,
    },
  )

  const reportsPath = pathJoin(workdirFolderPath, 'generated', 'reports')

  // blocks.json
  console.log('Generating blocks list')

  const generatedBlocksJson = JSON.parse(
    await readFile(pathJoin(reportsPath, 'blocks.json'), 'utf8'),
  )

  // TODO: chest, shulker_box 등 엔티티 모델로 렌더링되는 블록들은 모델 .json에 `elements`가 있는지 여부로 알 수 없음.
  // 이 모델들은 하드코딩되어있기 때문에 별도로 처리해줘야 함
  // https://minecraft.fandom.com/wiki/Model#Objects_which_cannot_be_remodelled
  const renderableBlocks: string[] = []
  for (const blockNameWithPrefix of Object.keys(generatedBlocksJson)) {
    const blockName = stripMinecraftPrefix(blockNameWithPrefix)
    let canRender: boolean = false

    if (blockName in blockRenderables) {
      canRender = blockRenderables[blockName]
    } else {
      const blockstateFile = JSON.parse(
        await readFile(
          pathJoin(
            assetsMinecraftFolderPath,
            'blockstates',
            `${blockName}.json`,
          ),
          'utf8',
        ),
      ) as BlockStatesFile

      if ('variants' in blockstateFile) {
        for (const key in blockstateFile.variants) {
          const variantData = blockstateFile.variants[key]
          if (Array.isArray(variantData)) {
            for (const variantDataItem of variantData) {
              canRender = await canRenderToBlockDisplay(
                versionId,
                variantDataItem.model,
              )
              if (canRender) break
            }
          } else {
            canRender = await canRenderToBlockDisplay(
              versionId,
              variantData.model,
            )
          }

          if (canRender) break
        }
      } else if ('multipart' in blockstateFile) {
        for (const multipartItem of blockstateFile.multipart) {
          if (Array.isArray(multipartItem.apply)) {
            for (const multipartApplyItem of multipartItem.apply) {
              canRender = await canRenderToBlockDisplay(
                versionId,
                multipartApplyItem.model,
              )
              if (canRender) break
            }
          } else {
            canRender = await canRenderToBlockDisplay(
              versionId,
              multipartItem.apply.model,
            )
          }

          if (canRender) break
        }
      }
    }

    if (canRender) {
      const defaultBlockstateValues = [
        ...Object.entries(blockstatesDefaultValues[blockName] ?? {}),
      ]
      const stringifiedDefaultBlockstateValues =
        defaultBlockstateValues.length > 0
          ? '[' +
            defaultBlockstateValues
              .map(([key, value]) => `${key}=${value}`)
              .join(',') +
            ']'
          : ''

      renderableBlocks.push(blockName + stringifiedDefaultBlockstateValues)
    } else {
      console.log(`[BlockListGen] excluding block ${blockName}`)
    }

    blockRenderables[blockName] = canRender
  }

  await writeFile(
    pathJoin(workdirFolderPath, 'blockRenderables.json'),
    JSON.stringify(blockRenderables),
  )
  await writeFile(
    pathJoin(assetsMinecraftFolderPath, 'blocks.json'),
    JSON.stringify({ blocks: renderableBlocks }),
  )

  // items.json
  console.log('Generating items list')

  const generatedRegistryJson = JSON.parse(
    await readFile(pathJoin(reportsPath, 'registries.json'), 'utf8'), // items.json does not exist on 1.19.4 ao use registries.json instead
  ) as ServerJarGeneratedRegistryData
  const items = Object.keys(generatedRegistryJson['minecraft:item'].entries)
    .map((k) => k.match(/^minecraft:(.+)$/)![1])
    .filter((i) => i !== 'air')
  await writeFile(
    pathJoin(assetsMinecraftFolderPath, 'items.json'),
    JSON.stringify({ items }),
  )

  const versionData = await fetchVersionData(versionId)

  // shared assets
  const workdirFolderSharedAssetsSubPath = pathJoin(
    workdirFolderSharedAssetsPath,
    versionData.assetIndex.id,
  )
  const outputFolderSharedAssetsSubPath = pathJoin(
    outputFolderSharedAssetsPath,
    versionData.assetIndex.id,
  )
  await mkdir(workdirFolderSharedAssetsSubPath, { recursive: true })
  await mkdir(outputFolderSharedAssetsSubPath, { recursive: true })

  let unifontHexFilePath = ''

  const sharedAssets = await downloadSharedAssets(
    versionData.assetIndex,
    workdirFolderRootPath,
  )
  for (const assetFilePath of sharedAssets) {
    console.log('Copying shared asset file', assetFilePath)
    const assetFileWorkdirAbsolutePath = pathJoin(
      workdirFolderSharedAssetsSubPath,
      assetFilePath,
    )
    const assetFileOutputAbsolutePath = pathJoin(
      outputFolderSharedAssetsSubPath,
      assetFilePath,
    )
    await mkdir(dirname(assetFileOutputAbsolutePath), { recursive: true })
    await cp(assetFileWorkdirAbsolutePath, assetFileOutputAbsolutePath)

    // unifont_all_no_pua_<version>.hex
    // TODO: 1.19.4 (assetIndex id 3) does not use unifont hexfile
    // but uses legacy_unicode provider (includes glyph_sizes.bin)
    // need to handle this later
    if (basename(assetFilePath).startsWith('unifont_all_')) {
      unifontHexFilePath = assetFilePath
    }
  }

  // write version metadata.json
  console.log('Writing metadata.json')
  const versionMetadata: VersionMetadata = {
    version: 1,
    incremental: true,
    gameVersion: versionId,
    sharedAssets: {
      assetIndex: parseInt(versionData.assetIndex.id),
      unifontHexFilePath,
    },
  }
  await writeFile(
    pathJoin(outputFolderPath, 'metadata.json'),
    JSON.stringify(versionMetadata),
  )
}

console.log('Done')

// ==========

async function cleanupWorkdir(versionId: string) {
  await rimraf(`./workdir/${versionId}/{generated,libraries,logs,versions}`, {
    glob: true,
  })
}

function stripMinecraftPrefix(input: string) {
  return input.startsWith('minecraft:') ? input.slice(10) : input
}

async function canRenderToBlockDisplay(
  version: string,
  modelResourceLocation: string,
) {
  if (modelResourceLocation.startsWith('minecraft:')) {
    modelResourceLocation = modelResourceLocation.slice(10)
  }

  const modelFileInfo = fileInfos.get(
    `assets/minecraft/models/${modelResourceLocation}.json`,
  )
  const assetsMinecraftFolderPath = pathJoin(
    outputFolderRootPath,
    modelFileInfo?.fromVersion ?? version,
    'assets',
    'minecraft',
  )

  const modelData = JSON.parse(
    await readFile(
      pathJoin(
        assetsMinecraftFolderPath,
        'models',
        `${modelResourceLocation}.json`,
      ),
      'utf8',
    ),
  ) as ModelFile

  // elements object가 존재할 경우 블록 디스플레이로 렌더링할 수 있음. 추가 검색을 중단하고 true 리턴
  if (modelData.elements?.length ?? 0 > 0) {
    return true
  }

  // parent 값이 있을 경우 parent에서도 체크
  if (modelData.parent != null) {
    return await canRenderToBlockDisplay(version, modelData.parent)
  }

  // console.log(modelResourceLocation, modelData)

  // elements object가 발견되지 않음. 블록 디스플레이로 렌더링할 수 없음
  return false
}

function makeHash(buf: Buffer) {
  return createHash('sha1').update(buf).digest('hex')
}
