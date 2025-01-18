import { FC } from 'react'
import { MathUtils } from 'three'

import useCachedMaterial from '@/hooks/useCachedMaterial'
import { Number3Tuple } from '@/types'

type BlockFaceNewProps = {
  faceName: 'up' | 'down' | 'north' | 'south' | 'west' | 'east'
  modelResourceLocation: string
  textureResourceLocation: string
  parentElementSize: Number3Tuple
  parentElementFrom: Number3Tuple
  parentElementTo: Number3Tuple
  uv?: [number, number, number, number]
  rotation?: 0 | 90 | 180 | 270
  textureLayer?: string
  textureSize?: [number, number]
  tintindex?: number
}

const BlockFaceNew: FC<BlockFaceNewProps> = ({
  modelResourceLocation,
  textureResourceLocation,
  parentElementSize: elementSize,
  parentElementFrom: elementFrom,
  parentElementTo: elementTo,
  uv,
  rotation = 0,
  faceName,
  textureLayer,
  textureSize = [16, 16],
  tintindex,
}) => {
  const cachedMaterial = useCachedMaterial({
    modelResourceLocation,
    textureResourceLocation,
    textureSize,
    textureLayer,
    tintindex,
  })

  if (cachedMaterial == null) return

  let width = 1
  let height = 1
  let meshPosition: Number3Tuple = [0, 0, 0]
  let meshRotation: Number3Tuple = [0, 0, 0]
  const deg90 = MathUtils.degToRad(90)

  switch (faceName) {
    case 'up':
      width = elementSize[0]
      height = elementSize[2]
      meshPosition = [0, elementSize[1] / 2, 0]
      meshRotation = [-deg90, 0, 0]
      break
    case 'down':
      width = elementSize[0]
      height = elementSize[2]
      meshPosition = [0, -elementSize[1] / 2, 0]
      meshRotation = [deg90, 0, 0]
      break
    case 'north':
      width = elementSize[0]
      height = elementSize[1]
      meshPosition = [0, 0, -elementSize[2] / 2]
      meshRotation = [0, 2 * deg90, 0]
      break
    case 'south': // base
      width = elementSize[0]
      height = elementSize[1]
      meshPosition = [0, 0, elementSize[2] / 2]
      meshRotation = [0, 0, 0]
      break
    case 'west':
      width = elementSize[2]
      height = elementSize[1]
      meshPosition = [-elementSize[0] / 2, 0, 0]
      meshRotation = [0, -deg90, 0]
      break
    case 'east':
      width = elementSize[2]
      height = elementSize[1]
      meshPosition = [elementSize[0] / 2, 0, 0]
      meshRotation = [0, deg90, 0]
      break
  }

  if (uv == null) {
    switch (faceName) {
      case 'up':
      case 'down':
        uv = [elementFrom[0], elementFrom[2], elementTo[0], elementTo[2]]
        break
      case 'north':
      case 'south': // base
        uv = [elementFrom[0], elementFrom[1], elementTo[0], elementTo[1]]
        break
      case 'west':
      case 'east':
        uv = [elementFrom[2], elementFrom[1], elementTo[2], elementTo[1]]
        break
    }
  } else {
    uv = [uv[0], 16 - uv[3], uv[2], 16 - uv[1]] // y좌표 반전
  }

  // bottom-left first
  const [uvFrom, uvTo] = [
    [uv[0] / 16, uv[1] / 16],
    [uv[2] / 16, uv[3] / 16],
  ] as const

  const vertexUVTopLeft = [uvFrom[0], uvTo[1]]
  const vertexUVTopRight = [uvTo[0], uvTo[1]]
  const vertexUVBottomLeft = [uvFrom[0], uvFrom[1]]
  const vertexUVBottomRight = [uvTo[0], uvFrom[1]]

  let vertexUV = vertexUVTopLeft.concat(
    vertexUVTopRight,
    vertexUVBottomLeft,
    vertexUVBottomRight,
  )
  switch (rotation) {
    case 90:
      vertexUV = vertexUVBottomLeft.concat(
        vertexUVTopLeft,
        vertexUVBottomRight,
        vertexUVTopRight,
      )
      break
    case 180:
      vertexUV = vertexUVBottomRight.concat(
        vertexUVBottomLeft,
        vertexUVTopRight,
        vertexUVTopLeft,
      )
      break
    case 270:
      vertexUV = vertexUVTopRight.concat(
        vertexUVBottomRight,
        vertexUVTopLeft,
        vertexUVBottomLeft,
      )
      break
  }

  // three.js는 bottom left, bottom right, top left, top right 순으로 uv값을 받지만
  // 보통의 텍스쳐 이미지는 top left가 기준점이기 때문에 상하로 뒤집어줘야 방향이 맞음
  // top left, top right, bottom left, bottom right
  // const f = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0])
  const vertexUVArr = new Float32Array(vertexUV)

  return (
    <mesh
      position={meshPosition}
      rotation={meshRotation}
      material={cachedMaterial}
    >
      <planeGeometry args={[width, height]}>
        <bufferAttribute
          attach="attributes-uv"
          array={vertexUVArr}
          count={4}
          itemSize={2}
        />
      </planeGeometry>
      {/* transparent일 경우 빈 공간을 transparent 처리하면 opacity=0이 되는데 */}
      {/* alphaTest > 0 이어야 빈 공간이 실제로 렌더링되지 않음 (안 할 경우 빈 공간이 다른 mesh도 안보이게 만듬) */}
    </mesh>
  )
}

export default BlockFaceNew
