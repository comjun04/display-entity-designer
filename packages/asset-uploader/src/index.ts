import { createWriteStream, existsSync } from 'fs'
import { lstat, mkdir, readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { Open } from 'unzipper'

const args = process.argv
const jarfilePath = args[2]
const mcVersion = args[3]

// 버전 이름 폴더가 이미 있는지 확인
const mcVersionFolderPath = join(resolve(), 'workdir', mcVersion)
if (
  !existsSync(mcVersionFolderPath) ||
  !(await lstat(mcVersionFolderPath)).isDirectory()
) {
  console.log(`${mcVersion} folder does not exist. Creating a new one.`)
  await mkdir(mcVersionFolderPath)
} else if ((await readdir(mcVersionFolderPath)).length > 0) {
  console.error(
    `The folder ${mcVersion} in workdir folder is not empty. Specify a different version name or empty the folder and rerun the command.`,
  )
  process.exit(1)
}

const jarfileAbsolutePath = join(resolve(), jarfilePath)
const zip = await Open.file(jarfileAbsolutePath)

// console.log(zip.files.filter((f) => f.path.startsWith('assets')))

console.log('Creating necesseary folders')

// 필요한 폴더: blockstates, models, textures
const assetsMinecraftFolderPath = join(
  mcVersionFolderPath,
  'assets',
  'minecraft',
)
// blockstates
await mkdir(join(assetsMinecraftFolderPath, 'blockstates'), {
  recursive: true,
})
// models
await Promise.all(
  ['block', 'item'].map((folderName) =>
    mkdir(join(assetsMinecraftFolderPath, 'models', folderName), {
      recursive: true,
    }),
  ),
)
await Promise.all(
  ['block', 'colormap', 'font', 'item'].map((folderName) =>
    mkdir(join(assetsMinecraftFolderPath, 'textures', folderName), {
      recursive: true,
    }),
  ),
)

console.log('Extracting...')

const filesToExtract = zip.files.filter((f) =>
  /^assets\/minecraft\/(blockstates|models|textures\/(block|colormap|font|item))/.test(
    f.path,
  ),
)
for await (const file of filesToExtract) {
  await new Promise((resolve, reject) => {
    file
      .stream()
      .pipe(createWriteStream(join(mcVersionFolderPath, file.path)))
      .on('finish', resolve)
      .on('error', reject)
  })
}

console.log('Done')
