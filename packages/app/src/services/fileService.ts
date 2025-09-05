import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { BDEngineSaveData, DisplayEntitySaveDataItem } from '@/types'

import { getLogger } from './loggerService'

const logger = getLogger('FileService')

type DisplayEntitySaveData = {
  __version: number
  __program: string
  entities: DisplayEntitySaveDataItem[]
}

const FILE_MAGIC = 'DEPL'
const FILE_VERSION = 2

const fileVersionArrayBuffer = new ArrayBuffer(4)
const fileVersionDataView = new DataView(fileVersionArrayBuffer)
fileVersionDataView.setUint32(0, FILE_VERSION, false)

export function openFromFile() {
  const inputElement = document.createElement('input')
  inputElement.type = 'file'
  inputElement.accept = '.depl,.bdengine'
  inputElement.onchange = async (evt) => {
    const file = (evt.target as HTMLInputElement).files?.[0]
    if (file == null) {
      return
    }

    try {
      // first try to open as depl project
      const isDeplProject = await openProjectFile(file)
      if (isDeplProject) return

      // if not, try to open with bdengine file
      const isBDEProject = await importFromBDE(file)
      if (isBDEProject) return
    } catch (err) {
      logger.error(err)
    }
  }

  inputElement.click()
}

async function openProjectFile(file: File): Promise<boolean> {
  if (file.size < 10) {
    logger.error(
      'Cannot open project file: cannot extract file header, file too small',
    )
    return false
  }

  const magic = await file.slice(0, 4).text()
  if (magic !== FILE_MAGIC) {
    logger.error('Cannot open project file: project file magic does not match')
    return false
  }

  const versionArrayBuffer = await file.slice(4, 8).arrayBuffer()
  const dataview = new DataView(versionArrayBuffer)
  const version = dataview.getUint32(0, false)
  if (version > FILE_VERSION) {
    logger.error(
      `Cannot open project file (version ${version}) higher than supported version ${FILE_VERSION}`,
    )
    return false
  }

  const gzipDecompressionStream = file
    .slice(8)
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  const saveDataString = await new Response(gzipDecompressionStream).text()
  const saveData = JSON.parse(saveDataString) as DisplayEntitySaveData

  // TODO: saveData type validation

  const { bulkImport, clearEntities } = useDisplayEntityStore.getState()

  // reset project and load data
  clearEntities()
  useEditorStore.getState().resetProject()

  bulkImport(saveData.entities).catch(logger.error)

  return true
}

export async function saveToFile() {
  const saveDataBlob = await createSaveData()

  const objectUrl = URL.createObjectURL(saveDataBlob)
  const tempElement = document.createElement('a')
  tempElement.href = objectUrl
  tempElement.download = 'project.depl'
  tempElement.click() // trigger download

  URL.revokeObjectURL(objectUrl)
}

export async function createSaveData() {
  const rootEntities = useDisplayEntityStore.getState().exportAll()
  const finalSaveObject = {
    __version: FILE_VERSION,
    __program: 'Display Entity Platform',
    entities: rootEntities,
  } satisfies DisplayEntitySaveData

  const finalSaveObjectString = JSON.stringify(finalSaveObject)

  // gzip
  const gzipCompressionStream = new Blob([finalSaveObjectString])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  const blob = await new Response(gzipCompressionStream).blob()
  const newBlob = new Blob([FILE_MAGIC, fileVersionArrayBuffer, blob], {
    type: 'application/octet-stream', // prevent chrome mobile from downloading as `project.depl.txt`
  })

  return newBlob
}

// ===============
// BDEngine

export async function importFromBDE(file: File): Promise<boolean> {
  const fileReader = new FileReader()
  fileReader.readAsText(file, 'utf-8')
  const rawFileContentUtf8 = await new Promise<string>((resolve) => {
    fileReader.onload = (evt) => {
      resolve(evt.target!.result as string)
    }
  })

  const base64Decoded = window.atob(rawFileContentUtf8)
  const byteArr = new Uint8Array(new ArrayBuffer(base64Decoded.length))
  for (let i = 0; i < base64Decoded.length; i++) {
    byteArr[i] = base64Decoded.charCodeAt(i)
  }
  const blob = new Blob([byteArr])
  const gzipDecompressionStream = blob
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))

  const saveDataString = await new Response(gzipDecompressionStream).text()
  const saveData = JSON.parse(saveDataString) as BDEngineSaveData

  const { bulkImportFromBDE, clearEntities } = useDisplayEntityStore.getState()

  // reset project and load data
  clearEntities()
  useEditorStore.getState().resetProject()

  bulkImportFromBDE(saveData).catch(logger.error)

  return true
}
