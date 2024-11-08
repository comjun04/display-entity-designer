import fetcher from '@/fetcher'
import {
  CDNModelResponse,
  ModelDisplayPositionKey,
  ModelElement,
  ModelFaceKey,
} from '@/types'
import { generateBuiltinItemModel, stripMinecraftPrefix } from '@/utils'
import { FC, ReactNode, Suspense, useEffect, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import BlockFace from './BlockFace'
import { MathUtils, Vector3 } from 'three'
import { useModelDataStore } from '@/store'
import { useShallow } from 'zustand/shallow'

type ModelProps = {
  initialResourceLocation: string
  displayType?: ModelDisplayPositionKey
  xRotation?: number
  yRotation?: number
}

const Model: FC<ModelProps> = ({
  initialResourceLocation,
  displayType,
  xRotation = 0,
  yRotation = 0,
}) => {
  const { cachedModelData, setCachedModelData } = useModelDataStore(
    useShallow((state) => ({
      cachedModelData: state.modelData[initialResourceLocation], // nullable
      setCachedModelData: state.setModelData,
    })),
  )

  const isItemModel = stripMinecraftPrefix(initialResourceLocation).startsWith(
    'item/',
  )
  const [isBlockItemModel, setIsBlockItemModel] = useState(false)
  const [currentResourceLocation, setCurrentResourceLocation] = useState(
    initialResourceLocation,
  )

  // textures, display, elements들은 캐싱된 데이터가 있을 경우 받아오고,
  // 없을 경우 밑에서 연산하면서 데이터를 저장함
  const [textures, setTextures] = useState<Record<string, string>>(
    cachedModelData?.textures ?? {},
  )
  const [display, setDisplay] = useState(cachedModelData?.display ?? {})
  const [elements, setElements] = useState<ModelElement[]>(
    cachedModelData?.elements ?? [],
  )

  const { data } = useSWRImmutable<CDNModelResponse>(
    currentResourceLocation.length > 0
      ? `/assets/minecraft/models/${currentResourceLocation}.json`
      : null,
    fetcher,
  )

  useEffect(() => {
    // 모델 파일 데이터가 없거나, 캐싱된 데이터가 있다면 모델 데이터 계산을 수행하지 않음
    if (data == null || cachedModelData != null) return

    // 불러온 model 데이터들을 합쳐서 state로 저장
    setTextures((textures) => ({ ...data.textures, ...textures }))
    setDisplay((display) => ({ ...data.display, ...display }))

    // parent 값이 있다면 state에다 설정해서
    // 다음 render할 떄 parent의 model 데이터를 불러오도록 처리
    if (data.parent != null) {
      if (data.parent === 'builtin/generated' && elements.length < 1) {
        // item display model 파일에 parent가 builtin/generated인 경우
        // layer{n} 텍스쳐 이미지에서 모델 구조를 직접 생성
        const textureLayerPromises = Object.keys(textures)
          .filter((key) => /^layer\d{1,}$/.test(key))
          .sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))
          .map((key) =>
            generateBuiltinItemModel(
              stripMinecraftPrefix(textures[key]),
              parseInt(key.slice(5)),
            ),
          )
        Promise.all(textureLayerPromises)
          .then((modelJsonList) => {
            setElements(
              modelJsonList.reduce<ModelElement[]>(
                (acc, cur) => [...acc, ...cur.elements],
                [],
              ),
            )
          })
          .catch(console.error)
      } else {
        if (isItemModel && data.parent.startsWith('block/')) {
          setIsBlockItemModel(true)
        }
        setCurrentResourceLocation(stripMinecraftPrefix(data.parent))
      }
    }

    if (
      elements.length < 1 &&
      data.elements != null &&
      data.elements.length > 0
    ) {
      setElements(data.elements)
    }
  }, [data, elements, textures, cachedModelData, isItemModel])

  // elements 데이터가 있고, data.parent 값이 null일 경우(=최상위 model 파일에 도달한 경우)
  // 다음에 로드 시 모델 데이터를 다시 계산할 필요가 없도록 캐싱
  useEffect(() => {
    if (data == null || elements.length < 1) return

    if (data.parent == null) {
      setCachedModelData(initialResourceLocation, {
        elements,
        textures,
        display,
      })
    }
  }, [
    data,
    display,
    elements,
    textures,
    initialResourceLocation,
    setCachedModelData,
  ])

  // ==========

  if (!isItemModel && (data == null || cachedModelData == null)) {
    return null
  }

  // elements가 없을 경우 렌더링할 것이 없으므로 그냥 null을 리턴
  if (elements == null || elements.length < 1) {
    return null
  }

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

  // display rotat

  const displayInfo = displayType != null ? display[displayType] : {}
  const displayRotation = (displayInfo.rotation ?? [0, 0, 0]).map((d) =>
    MathUtils.degToRad(d),
  ) as [number, number, number]
  const displayTranslation = new Vector3(
    ...(displayInfo.translation ?? [0, 0, 0]),
  )
    .max(new Vector3(-80, -80, -80))
    .min(new Vector3(80, 80, 80))
    .divideScalar(16)
  const displayScale = new Vector3(...(displayInfo.scale ?? [1, 1, 1])).min(
    new Vector3(4, 4, 4),
  )

  return (
    <group rotation={modelRotation} position={[0.5, 0.5, 0.5]}>
      <group position={[-0.5, -0.5, -0.5]}>
        <group rotation={displayRotation} scale={displayScale}>
          <group position={displayTranslation}>
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
                    modelResourceLocation={initialResourceLocation}
                    textureResourceLocation={texture}
                    faceName={face}
                    uv={faceData.uv}
                    rotation={faceData.rotation}
                    tintindex={faceData.tintindex}
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
              const vec2 = rotationOriginVec
                .clone()
                .subScalar(isBlockItemModel ? 0.5 : 0)

              // rotation origin 적용할 때
              // 1. centerVec - rotationOriginVec 위치로 이동 => 회전 중심위치가 (0,0,0)에 위치하도록 함
              // 2. 부모 group에서 rotation을 적용하고 원래 위치로 다시 움직임 (centerVec - rotationOriginVec + rotationOriginVec = centerVec)
              return (
                <group
                  key={idx}
                  rotation={rotation}
                  position={vec2}
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
      </group>
    </group>
  )
}

export default Model
