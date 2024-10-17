import fetcher from '@/fetcher'
import { CDNModelResponse, ModelElement, ModelFaceKey } from '@/types'
import { stripMinecraftPrefix } from '@/utils'
import { FC, ReactNode, Suspense, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import BlockFace from './BlockFace'
import { Vector3 } from 'three'

type ModelProps = {
  initialResourceLocation: string
}

const Model: FC<ModelProps> = ({ initialResourceLocation }) => {
  const [currentResourceLocation, setCurrentResourceLocation] = useState(
    initialResourceLocation,
  )
  const [textures, setTextures] = useState<Record<string, string>>({})
  const [display, setDisplay] = useState({})
  const [elements, setElements] = useState<ModelElement[]>()

  const { data } = useSWRImmutable<CDNModelResponse>(
    currentResourceLocation.length > 0
      ? `/assets/minecraft/models/${currentResourceLocation}.json`
      : null,
    fetcher,
  )

  if (data == null) {
    return null
  }

  console.log(currentResourceLocation, textures, display, elements)

  if (data.parent != null) {
    setCurrentResourceLocation(stripMinecraftPrefix(data.parent))

    setTextures({ ...textures, ...data.textures })
    setDisplay({ ...display, ...data.display })
    if (elements == null) {
      setElements(data.elements)
    }

    return null
  }

  if (elements == null || elements.length < 1) return null

  const getTexture = (key: string) => {
    if (key.startsWith('#')) return getTexture(key.slice(1))

    if (!(key in textures)) return

    if (textures[key].startsWith('#')) return getTexture(textures[key].slice(1))
    else return stripMinecraftPrefix(textures[key])
  }

  return (
    <group>
      {elements.map((element, idx) => {
        const fromVec = new Vector3(...element.from).divideScalar(16)
        const toVec = new Vector3(...element.to).divideScalar(16)
        const sizeVec = new Vector3().add(toVec).sub(fromVec)

        const faces: ReactNode[] = []
        for (const faceKey in element.faces) {
          const face = faceKey as ModelFaceKey
          const faceData = element.faces[face]!
          const texture = getTexture(faceData.texture)
          if (texture == null) continue

          faces.push(
            <BlockFace
              key={face}
              textureResourceLocation={texture}
              faceName={face}
              uv={faceData.uv}
              parentElementSize={sizeVec.toArray()}
              parentElementFrom={element.from}
              parentElementTo={element.to}
            />,
          )
        }

        return (
          <group key={idx}>
            <Suspense>{faces}</Suspense>
          </group>
        )
      })}
    </group>
  )
}

export default Model
