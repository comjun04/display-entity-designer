import { createWriteStream, existsSync } from 'fs'
import { lstat, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import {
  join as pathJoin,
  resolve as pathResolve,
  relative as pathRelative,
} from 'path'
import { Open } from 'unzipper'
import { rimraf } from 'rimraf'
import { spawnSync } from 'child_process'

// =====

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

const filesToExtract = zip.files.filter((f) =>
  /^assets\/minecraft\/(blockstates|models|textures\/(block|colormap|font|item))\//.test(
    f.path,
  ),
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
const blocks = [...Object.keys(generatedBlocksJson)].map(
  (k) => k.match(/^minecraft:(.+)$/)![1], // strip `minecraft:` prefix
)
await writeFile(
  pathJoin(assetsMinecraftFolderPath, 'blocks.json'),
  JSON.stringify({ blocks }),
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

async function cleanupWorkdir() {
  await rimraf('./workdir/{generated,libraries,logs,versions}', { glob: true })
}
