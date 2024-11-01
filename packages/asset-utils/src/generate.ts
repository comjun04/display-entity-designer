import { createWriteStream, existsSync } from 'fs'
import {
  copyFile,
  lstat,
  mkdir,
  readdir,
  readFile,
  writeFile,
} from 'fs/promises'
import {
  join as pathJoin,
  resolve as pathResolve,
  relative as pathRelative,
} from 'path'
import { Open } from 'unzipper'
import { rimraf } from 'rimraf'
import { spawnSync } from 'child_process'
import { BlockstatesFile, ModelFile } from './types'

// =====

const renderableBlockEntityModels = [
  'chest',
  'shulker_box',
  'black_shulker_box',
  'blue_shulker_box',
  'brown_shulker_box',
  'cyan_shulker_box',
  'gray_shulker_box',
  'green_shulker_box',
  'light_blue_shulker_box',
  'light_gray_shulker_box',
  'lime_shulker_box',
  'magenta_shulker_box',
  'orange_shulker_box',
  'pink_shulker_box',
  'purple_shulker_box',
  'red_shulker_box',
  'white_shulker_box',
  'yellow_shulker_box',
].map((type) => `block/${type}`)
const renderableBlockEntityModelTextures = [
  'chest/normal', // chest
  'shulker/shulker', // shulker_box
  'shulker/shulker_black',
  'shulker/shulker_blue',
  'shulker/shulker_brown',
  'shulker/shulker_cyan',
  'shulker/shulker_gray',
  'shulker/shulker_green',
  'shulker/shulker_light_blue',
  'shulker/shulker_light_gray',
  'shulker/shulker_lime',
  'shulker/shulker_magenta',
  'shulker/shulker_orange',
  'shulker/shulker_pink',
  'shulker/shulker_purple',
  'shulker/shulker_red',
  'shulker/shulker_white',
  'shulker/shulker_yellow',
].map(
  (resourceLocation) =>
    `assets/minecraft/textures/entity/${resourceLocation}.png`,
)

const args = process.argv
const clientJarfilePath = args[2]
const serverJarfilePath = args[3]
const mcVersion = args[4]

const workdirFolderPath = pathJoin(pathResolve(), 'workdir')
const outputFolderPath = pathJoin(pathResolve(), 'output', mcVersion)
const assetsMinecraftFolderPath = pathJoin(
  outputFolderPath,
  'assets',
  'minecraft',
)

// workdir 폴더 미리 생성
if (!existsSync(workdirFolderPath)) {
  await mkdir(workdirFolderPath)
}

// 버전 이름 폴더가 이미 있는지 확인
if (
  !existsSync(outputFolderPath) ||
  !(await lstat(outputFolderPath)).isDirectory()
) {
  console.log(`output/${mcVersion} folder does not exist. Creating a new one.`)
  await mkdir(outputFolderPath, { recursive: true })
} else if ((await readdir(outputFolderPath)).length > 0) {
  console.error(
    `The folder output/${mcVersion} folder is not empty. Specify a different version name or empty the folder and rerun the command.`,
  )
  process.exit(1)
}

console.log('Cleaning up previous server jar reports files')
await cleanupWorkdir()

const jarfileAbsolutePath = pathJoin(pathResolve(), clientJarfilePath)
const zip = await Open.file(jarfileAbsolutePath)

console.log('Extracting asset files...')

const filesToExtract = zip.files.filter(
  (f) =>
    /^assets\/minecraft\/(blockstates|models|textures\/(block|colormap|font|item))\//.test(
      f.path,
    ) || renderableBlockEntityModelTextures.includes(f.path),
)
for await (const file of filesToExtract) {
  const dirPath = file.path.split('/').slice(0, -1).join('/')
  await mkdir(pathJoin(outputFolderPath, dirPath), { recursive: true })

  await new Promise((resolve, reject) => {
    file
      .stream()
      .pipe(createWriteStream(pathJoin(outputFolderPath, file.path)))
      .on('finish', resolve)
      .on('error', reject)
  })
}

// generate server resource reports file to get blocks.json and items.json
console.log('Generating server.jar resource reports...')
const relativeServerJarfilePath = pathRelative(
  workdirFolderPath,
  pathJoin(pathResolve(), serverJarfilePath),
)
spawnSync(
  'java',
  [
    '-DbundlerMainClass=net.minecraft.data.Main',
    '-jar',
    relativeServerJarfilePath,
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
for await (const blockNameWithPrefix of [...Object.keys(generatedBlocksJson)]) {
  const blockName = stripMinecraftPrefix(blockNameWithPrefix)
  const blockstateFile = JSON.parse(
    await readFile(
      pathJoin(assetsMinecraftFolderPath, 'blockstates', `${blockName}.json`),
      'utf8',
    ),
  ) as BlockstatesFile

  let canRender: boolean = false
  if ('variants' in blockstateFile) {
    for (const key in blockstateFile.variants) {
      const variantData = blockstateFile.variants[key]
      if (Array.isArray(variantData)) {
        for (const variantDataItem of variantData) {
          canRender = await canRenderToBlockDisplay(variantDataItem.model)
          if (canRender) break
        }
      } else {
        canRender = await canRenderToBlockDisplay(variantData.model)
      }

      if (canRender) break
    }
  } else if ('multipart' in blockstateFile) {
    for (const multipartItem of blockstateFile.multipart) {
      if (Array.isArray(multipartItem.apply)) {
        for (const multipartApplyItem of multipartItem.apply) {
          canRender = await canRenderToBlockDisplay(multipartApplyItem.model)
          if (canRender) break
        }
      } else {
        canRender = await canRenderToBlockDisplay(multipartItem.apply.model)
      }

      if (canRender) break
    }
  }

  if (canRender) {
    if (renderableBlockEntityModels.includes(`block/${blockName}`)) {
      // 하드코딩된 모델 데이터 복사
      await copyFile(
        pathJoin(
          pathResolve(),
          'hardcoded',
          'models',
          'block',
          `${blockName}.json`,
        ),
        pathJoin(
          assetsMinecraftFolderPath,
          'models',
          'block',
          `${blockName}.json`,
        ),
      )
    }

    renderableBlocks.push(blockName)
  } else {
    console.log(`[BlockListGen] excluding block ${blockName}`)
  }
}

await writeFile(
  pathJoin(assetsMinecraftFolderPath, 'blocks.json'),
  JSON.stringify({ blocks: renderableBlocks }),
)

// items.json
console.log('Generating items list')

const generatedItemsJson = JSON.parse(
  await readFile(pathJoin(reportsPath, 'items.json'), 'utf8'),
)
const items = [...Object.keys(generatedItemsJson)].map(
  (k) => k.match(/^minecraft:(.+)$/)![1],
)
await writeFile(
  pathJoin(assetsMinecraftFolderPath, 'items.json'),
  JSON.stringify({ items }),
)

console.log('Done')

// ==========

async function cleanupWorkdir() {
  await rimraf('./workdir/{generated,libraries,logs,versions}', { glob: true })
}

function stripMinecraftPrefix(input: string) {
  return input.startsWith('minecraft:') ? input.slice(10) : input
}

// TODO: chest, shulker_box 등 엔티티 모델로 렌더링되는 블록들은 모델 .json에 `elements`가 있는지 여부로 알 수 없음.
// 이 모델들은 하드코딩되어있기 때문에 별도로 처리해줘야 함
async function canRenderToBlockDisplay(modelResourceLocation: string) {
  if (modelResourceLocation.startsWith('minecraft:')) {
    modelResourceLocation = modelResourceLocation.slice(10)
  }

  // 블록 엔티티 모델은 하드코딩된 모델 데이터를 사용하므로 뒤에서 체크하지 않아도 됨
  if (renderableBlockEntityModels.includes(modelResourceLocation)) {
    return true
  }

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
    return await canRenderToBlockDisplay(modelData.parent)
  }

  // console.log(modelResourceLocation, modelData)

  // elements object가 발견되지 않음. 블록 디스플레이로 렌더링할 수 없음
  return false
}
