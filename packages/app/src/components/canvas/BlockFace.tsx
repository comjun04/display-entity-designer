import { useTexture } from '@react-three/drei'
import { FC, useEffect, useState } from 'react'
import { MathUtils, NearestFilter } from 'three'

type BlockFaceProps = {
  faceName: 'up' | 'down' | 'north' | 'south' | 'west' | 'east'
  modelResourceLocation: string
  textureResourceLocation: string
  parentElementSize: [number, number, number]
  parentElementFrom: [number, number, number]
  parentElementTo: [number, number, number]
  uv?: [number, number, number, number]
  rotation?: 0 | 90 | 180 | 270
  tintindex?: number
}

const blocksUsingDefaultGrassColors = [
  'block/grass_block',
  'block/short_grass',
  'block/tall_grass',
  'block/fern',
  'block/large_fern_top',
  'block/large_fern_bottom',
  'block/potted_fern',
]
const blocksUsingDefaultFoliageColors = [
  'block/oak_leaves',
  'block/jungle_leaves',
  'block/acacia_leaves',
  'block/dark_oak_leaves',
  'block/vine',
  'block/mangrove_leaves',
]
function getTextureColor(modelResourceLocation: string, tintindex?: number) {
  if (tintindex == null) {
    return 0xffffff
  }

  // 잔디 색
  if (
    blocksUsingDefaultGrassColors.includes(modelResourceLocation) &&
    tintindex === 0
  ) {
    // https://minecraft.fandom.com/wiki/Grass_Block#Item
    return 0x7cbd6b
  }

  if (
    blocksUsingDefaultFoliageColors.includes(modelResourceLocation) &&
    tintindex === 0
  ) {
    // net.minecraft.world.biome.FoliageColors.getDefaultColor()
    return 0x48b518
  }
  if (modelResourceLocation === 'block/birch_leaves' && tintindex === 0) {
    // net.minecraft.world.biome.FoliageColors.getBirchColor()
    return 0x80a755
  }
  if (modelResourceLocation === 'block/spruce_leaves' && tintindex === 0) {
    // net.minecraft.world.biome.FoliageColors.getSpruceColor()
    return 0x619961
  }

  // lily_pad
  if (modelResourceLocation === 'block/lily_pad') {
    // minecraft wiki에 0x208030이라고 적혀 있지만, 블록 디스플레이로 렌더링할 때는 다른 색을 사용
    // net.minecraft.world.biome.FoliageColors class 코드에서 확인 가능
    return 0x71c35c
  }

  // 수박, 호박 줄기
  // minecraft:block/melon_stem_stage{n} (0 <= n <= 7)
  // minecraft:block/pumpkin_stem_stage{n}
  if (/^block\/(melon|pumpkin)_stem_stage[0-7]$/.test(modelResourceLocation)) {
    const age = modelResourceLocation.slice(-1)
    switch (age) {
      case '0':
        return 0x00ff00
      case '1':
        return 0x20f704
      case '2':
        return 0x40ef08
      case '3':
        return 0x60e70c
      case '4':
        return 0x80df10
      case '5':
        return 0xa0d714
      case '6':
        return 0xc0cf18
      case '7':
        return 0xe0c71c
    }
  }

  // 다 자란 수박/호박 줄기
  if (
    ['block/attached_melon_stem', 'block/attached_pumpkin_stem'].includes(
      modelResourceLocation,
    )
  ) {
    return 0xe0c71c
  }

  // redstone_wire
  if (
    modelResourceLocation.startsWith('block/redstone_dust_') &&
    tintindex === 0
  ) {
    // 항상 꺼진 상태
    return 0x4b0000
  }

  return 0xffffff
}

const BlockFace: FC<BlockFaceProps> = ({
  modelResourceLocation,
  textureResourceLocation,
  parentElementSize: elementSize,
  parentElementFrom: elementFrom,
  parentElementTo: elementTo,
  uv,
  rotation = 0,
  faceName,
  tintindex,
}) => {
  const [processedImageDataUrl, setProcessedImageDataUrl] = useState<string>()
  const texture = useTexture(
    processedImageDataUrl ??
      `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`,
  )

  // 텍스쳐 사진을 처음 로드했을 경우 맨 위 16x16만 잘라서 적용
  useEffect(() => {
    if (processedImageDataUrl != null || texture == null) {
      return
    }

    const img = texture.image as HTMLImageElement

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 16
    canvas.height = 16

    ctx.drawImage(img, 0, 0, 16, 16, 0, 0, 16, 16)

    const croppedTextureDataUrl = canvas.toDataURL()
    setProcessedImageDataUrl(croppedTextureDataUrl)
  }, [processedImageDataUrl, texture])

  // 텍스쳐 픽셀끼리 뭉쳐져서 blur되어 보이지 않게 설정
  // https://discourse.threejs.org/t/low-resolution-texture-is-very-blurry-how-can-i-get-around-this-issue/29948
  // https://github.com/mrdoob/three.js/blob/37d6f280a5cd642e801469bb048f52300d31258e/examples/webgl_geometry_minecraft.html#L154
  texture.magFilter = NearestFilter

  let width = 1
  let height = 1
  let meshPosition: [number, number, number] = [0, 0, 0]
  let meshRotation: [number, number, number] = [0, 0, 0]
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

  const textureColor = getTextureColor(modelResourceLocation, tintindex)

  return (
    <mesh position={meshPosition} rotation={meshRotation}>
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
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        toneMapped={false} // 인게임에서는 블록이 실제 텍스쳐보다 덜 선명하게 렌더링됨
        color={textureColor}
      />
    </mesh>
  )
}

export default BlockFace
