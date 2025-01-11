import { Matrix4Tuple } from 'three'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { BlockDisplayEntity, DisplayEntity } from '@/types'

const FILE_VERSION = 0

const fileVersionArrayBuffer = new ArrayBuffer(4)
const fileVersionDataView = new DataView(fileVersionArrayBuffer)
fileVersionDataView.setUint32(0, FILE_VERSION, false)

type DisplayEntitySaveData = Pick<DisplayEntity, 'kind'> &
  Partial<Pick<BlockDisplayEntity, 'type'>> & {
    transforms: Matrix4Tuple
    children?: DisplayEntitySaveData[]
  }

export async function saveToFile() {
  const { entities } = useDisplayEntityStore.getState()
  const { entityRefs } = useEntityRefStore.getState()

  const generateEntitySaveData: (
    entity: DisplayEntity,
  ) => DisplayEntitySaveData = (entity) => {
    const refData = entityRefs.find((d) => d.id === entity.id)!
    const transforms = refData.objectRef.current.matrixWorld
      .clone()
      .transpose()
      .toArray()

    const children =
      'children' in entity
        ? entity.children.map((childrenEntityId) => {
            const e = entities.find((e) => e.id === childrenEntityId)!
            return generateEntitySaveData(e)
          })
        : undefined

    return {
      kind: entity.kind,
      type: 'type' in entity ? entity.type : undefined,
      transforms,
      children,
    }
  }

  const rootEntities = entities
    .filter((e) => e.parent == null)
    .map((e) => generateEntitySaveData(e))
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
  const newBlob = new Blob(['DEPL', fileVersionArrayBuffer, blob])

  const objectUrl = URL.createObjectURL(newBlob)
  const tempElement = document.createElement('a')
  tempElement.href = objectUrl
  tempElement.download = 'project.depl'
  tempElement.click() // trigger download

  URL.revokeObjectURL(objectUrl)
}
