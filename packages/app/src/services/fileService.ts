import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { BDEngineSaveData, DisplayEntitySaveDataItem } from '@/types'
import { decodeBase64ToBinary, gunzip, gzip } from '@/utils'

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

export async function openProjectFile(file: Blob): Promise<boolean> {
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

  const saveDataString = await gunzip(file.slice(8))
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

  useEditorStore.getState().setProjectDirty(false)
}

export async function createSaveData() {
  const rootEntities = useDisplayEntityStore.getState().exportAll()
  const finalSaveObject = {
    __version: FILE_VERSION,
    __program: 'Display Entity Platform',
    entities: rootEntities,
  } satisfies DisplayEntitySaveData

  const finalSaveObjectString = JSON.stringify(finalSaveObject)

  const blob = await gzip(finalSaveObjectString)
  const newBlob = new Blob([FILE_MAGIC, fileVersionArrayBuffer, blob], {
    type: 'application/octet-stream', // prevent chrome mobile from downloading as `project.depl.txt`
  })

  return newBlob
}

// ===============
// BDEngine

export async function importFromBDE(file: Blob): Promise<boolean> {
  const fileReader = new FileReader()
  fileReader.readAsText(file, 'utf-8')
  const rawFileContentUtf8 = await new Promise<string>((resolve) => {
    fileReader.onload = (evt) => {
      resolve(evt.target!.result as string)
    }
  })

  const byteArr = decodeBase64ToBinary(rawFileContentUtf8)
  const blob = new Blob([byteArr])
  const saveDataString = await gunzip(blob)
  const saveData = JSON.parse(saveDataString) as BDEngineSaveData

  const { bulkImportFromBDE, clearEntities } = useDisplayEntityStore.getState()

  // reset project and load data
  clearEntities()
  useEditorStore.getState().resetProject()

  bulkImportFromBDE(saveData).catch(logger.error)

  return true
}
