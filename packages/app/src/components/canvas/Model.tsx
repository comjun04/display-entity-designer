import { FC, ReactNode, Suspense } from 'react'
import { MathUtils, Vector3 } from 'three'

import useModel from '@/hooks/useModel'
import { ModelDisplayPositionKey, ModelFaceKey, Number3Tuple } from '@/types'
import { stripMinecraftPrefix } from '@/utils'

import BlockFace from './BlockFace'

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
  const { modelData, isBlockShapedItemModel } = useModel(
    initialResourceLocation,
  )

  const isItemModel = stripMinecraftPrefix(initialResourceLocation).startsWith(
    'item/',
  )

  // ==========

  if (modelData == null || isBlockShapedItemModel == null) {
    return null
  }

  const { display, elements, textures, textureSize } = modelData

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

  // display info

  const displayInfo = displayType != null ? (display[displayType] ?? {}) : {}
  const displayRotation = (displayInfo.rotation ?? [0, 0, 0]).map((d) =>
    MathUtils.degToRad(d),
  ) as Number3Tuple
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
    // set y rotation
    <group
      rotation={[0, MathUtils.degToRad(-yRotation), 0]}
      position={[0.5, 0.5, 0.5]}
    >
      <group position={[-0.5, -0.5, -0.5]}>
        {/* set x rotation */}
        <group
          rotation={[MathUtils.degToRad(-xRotation), 0, 0]}
          position={[0.5, 0.5, 0.5]}
        >
          <group position={[-0.5, -0.5, -0.5]}>
            {/* set display translation, rotation and scale */}
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

                    const textureLayer =
                      isItemModel && /^#layer\d{1,}$/.test(faceData.texture)
                        ? faceData.texture.slice(6)
                        : undefined

                    faces.push(
                      <BlockFace
                        key={face}
                        modelResourceLocation={initialResourceLocation}
                        textureResourceLocation={texture}
                        faceName={face}
                        uv={faceData.uv}
                        textureLayer={textureLayer}
                        textureSize={textureSize}
                        rotation={faceData.rotation}
                        tintindex={faceData.tintindex}
                        parentElementSize={sizeVec.toArray()}
                        parentElementFrom={element.from}
                        parentElementTo={element.to}
                      />,
                    )
                  }

                  // element rotation
                  let rotation = [0, 0, 0] satisfies Number3Tuple
                  let groupScale = [1, 1, 1] satisfies Number3Tuple
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
                    .subScalar(isBlockShapedItemModel ? 0.5 : 0)

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
      </group>
    </group>
  )
}

export default Model
