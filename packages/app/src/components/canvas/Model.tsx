import fetcher from '@/fetcher'
import { CDNModelResponse, ModelElement, ModelFaceKey } from '@/types'
import { stripMinecraftPrefix } from '@/utils'
import { FC, ReactNode, Suspense, useEffect, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import BlockFace from './BlockFace'
import { MathUtils, Vector3 } from 'three'

type ModelProps = {
  initialResourceLocation: string
  xRotation?: number
  yRotation?: number
}

const Model: FC<ModelProps> = ({
  initialResourceLocation,
  xRotation = 0,
  yRotation = 0,
}) => {
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

  useEffect(() => {
    if (data == null) return

    if (data.parent != null) {
      setCurrentResourceLocation(stripMinecraftPrefix(data.parent))
    }

    setTextures((textures) => ({ ...data.textures, ...textures }))
    setDisplay((display) => ({ ...data.display, ...display }))

    if (elements == null) {
      setElements(data.elements)
    }
  }, [data, elements])

  // ==========

  if (data == null) {
    return null
  }

  console.log(currentResourceLocation, textures, display, elements)

  if (elements == null || elements.length < 1) return null

  const getTexture = (key: string) => {
    if (key.startsWith('#')) return getTexture(key.slice(1))

    if (!(key in textures)) return

    if (textures[key].startsWith('#')) return getTexture(textures[key].slice(1))
    else return stripMinecraftPrefix(textures[key])
  }

  const modelRotation = [
    MathUtils.degToRad(-xRotation),
    MathUtils.degToRad(-yRotation),
    0,
  ] satisfies [number, number, number]

  return (
    <group rotation={modelRotation} position={[0.5, 0.5, 0.5]}>
      <group position={[-0.5, -0.5, -0.5]}>
        {elements.map((element, idx) => {
          const fromVec = new Vector3(...element.from).divideScalar(16)
          const toVec = new Vector3(...element.to).divideScalar(16)
          const centerVec = new Vector3()
            .addVectors(fromVec, toVec)
            .divideScalar(2)
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
                rotation={faceData.rotation}
                parentElementSize={sizeVec.toArray()}
                parentElementFrom={element.from}
                parentElementTo={element.to}
              />,
            )
          }

          // element rotation
          let rotation = [0, 0, 0] as [number, number, number]
          let groupScale = [1, 1, 1] as [number, number, number]
          if (element.rotation != null) {
            const rad = MathUtils.degToRad(element.rotation.angle)

            switch (element.rotation.axis) {
              case 'x':
                rotation = [rad, 0, 0]
                break
              case 'y':
                rotation = [0, rad, 0]
                break
              case 'z':
                rotation = [0, 0, rad]
                break
            }

            if (element.rotation.rescale) {
              const scaleBy = 1 / Math.cos(rad)
              switch (element.rotation.axis) {
                case 'x':
                  groupScale = [1, scaleBy, scaleBy]
                  break
                case 'y':
                  groupScale = [scaleBy, 1, scaleBy]
                  break
                case 'z':
                  groupScale = [scaleBy, scaleBy, 1]
                  break
              }
            }
          }

          // 회전 중심 위치
          const rotationOriginVec = new Vector3(
            ...(element.rotation?.origin ?? ([0, 0, 0] as const)),
          ).divideScalar(16)

          const vec1 = centerVec.clone().sub(rotationOriginVec)

          // rotation origin 적용할 때
          // 1. centerVec - rotationOriginVec 위치로 이동 => 회전 중심위치가 (0,0,0)에 위치하도록 함
          // 2. 부모 group에서 rotation을 적용하고 원래 위치로 다시 움직임 (centerVec - rotationOriginVec + rotationOriginVec = centerVec)
          return (
            <group
              key={idx}
              rotation={rotation}
              position={rotationOriginVec}
              scale={groupScale}
            >
              <group position={vec1}>
                <Suspense>{faces}</Suspense>
              </group>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export default Model
