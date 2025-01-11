import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { DisplayEntitySaveDataItem } from '@/types'

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

export function openFromFile() {
  const inputElement = document.createElement('input')
  inputElement.type = 'file'
  inputElement.onchange = async (evt) => {
    const file = (evt.target as HTMLInputElement).files?.[0]
    if (file == null) {
      return
    }

    if (file.size < 10) {
      console.error(
        'Cannot open project file: cannot extract file header, file too small',
      )
      return
    }

    const magic = await file.slice(0, 4).text()
    if (magic !== FILE_MAGIC) {
      console.error(
        'Cannot open project file: project file magic does not match',
      )
      return
    }

    const versionArrayBuffer = await file.slice(4, 8).arrayBuffer()
    const dataview = new DataView(versionArrayBuffer)
    const version = dataview.getUint32(0, false)
    if (version < FILE_VERSION) {
      console.error(
        `Cannot open project file (version ${version}) higher than supported version ${FILE_VERSION}`,
      )
      return
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

    bulkImport(saveData.entities)
  }

  inputElement.click()
}

export async function saveToFile() {
  const rootEntities = useDisplayEntityStore.getState().exportAll()
  const finalSaveObject = {
    __version: FILE_VERSION,
    __program: 'Display Entity Platform',
    entities: rootEntities,
  }

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
