import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { BDEngineSaveData, DisplayEntitySaveDataItem } from '@/types'

type DisplayEntitySaveData = {
  __version: number
  __program: string
  entities: DisplayEntitySaveDataItem[]
}

const FILE_MAGIC = 'DEPL'
const FILE_VERSION = 0

const fileVersionArrayBuffer = new ArrayBuffer(4)
const fileVersionDataView = new DataView(fileVersionArrayBuffer)
fileVersionDataView.setUint32(0, FILE_VERSION, false)

export async function openFromFile(file: File) {
  try {
    // first try to open as depl project
    const isDeplProject = await openProjectFile(file)
    if (isDeplProject) return

    // if not, try to open with bdengine file
    const isBDEProject = await importFromBDE(file)
    if (isBDEProject) return
  } catch (err) {
    console.error(err)
  }
}

async function openProjectFile(file: File): Promise<boolean> {
  if (file.size < 10) {
    console.error(
      'Cannot open project file: cannot extract file header, file too small',
    )
    return false
  }

  const magic = await file.slice(0, 4).text()
  if (magic !== FILE_MAGIC) {
    console.error('Cannot open project file: project file magic does not match')
    return false
  }

  const versionArrayBuffer = await file.slice(4, 8).arrayBuffer()
  const dataview = new DataView(versionArrayBuffer)
  const version = dataview.getUint32(0, false)
  if (version < FILE_VERSION) {
    console.error(
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

  console.log(saveData)

  const { bulkImport, clearEntities } = useDisplayEntityStore.getState()

  // reset project and load data
  clearEntities()
  useEditorStore.getState().resetProject()

  bulkImport(saveData.entities).catch(console.error)

  return true
}

export async function saveToFile() {
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
  const newBlob = new Blob([FILE_MAGIC, fileVersionArrayBuffer, blob])

  const objectUrl = URL.createObjectURL(newBlob)
  const tempElement = document.createElement('a')
  tempElement.href = objectUrl
  tempElement.download = 'project.depl'
  tempElement.click() // trigger download

  URL.revokeObjectURL(objectUrl)
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
  console.log(saveDataString)

  const saveData = JSON.parse(saveDataString) as BDEngineSaveData

  const { bulkImportFromBDE, clearEntities } = useDisplayEntityStore.getState()

  // reset project and load data
  clearEntities()
  useEditorStore.getState().resetProject()

  bulkImportFromBDE(saveData).catch(console.error)

  return true
}
