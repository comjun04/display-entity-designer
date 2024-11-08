import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ModelElement, ModelFaceKey } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMinecraftPrefix(input: string) {
  return input.startsWith('minecraft:') ? input.slice(10) : input
}

export async function generateBuiltinItemModel(
  textureResourceLocation: string,
  layerNumber: number,
) {
  const layerId = `#layer${layerNumber}`

  const modelJson: {
    elements: ModelElement[]
  } = {
    elements: [
      {
        from: [-8, -8, -0.5],
        to: [8, 8, 0.5],
        faces: {
          north: { uv: [16, 0, 0, 16], texture: layerId },
          south: { uv: [0, 0, 16, 16], texture: layerId },
        },
      },
    ],
  }

  const textureImage = new Image()
  textureImage.crossOrigin = 'anonymous'
  textureImage.src = `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`
  await new Promise((resolve) => {
    textureImage.onload = resolve
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  const width = 16
  const height = 16
  canvas.width = width
  canvas.height = height

  ctx.drawImage(textureImage, 0, 0, 16, 16, 0, 0, 16, 16)

  const checkNeighborPixelEmpty = (x: number, y: number) => {
    if (x < 0 || x > width) return true
    if (y < 0 || y > height) return true

    const alpha = ctx.getImageData(x, y, 1, 1).data[3]
    if (alpha === 0) return true

    return false
  }

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      // Skip if pixel is empty
      const alpha = ctx.getImageData(x, y, 1, 1).data[3]
      if (alpha === 0) continue

      const neighbours = {
        up: [x, y - 1],
        down: [x, y + 1],
        east: [x + 1, y],
        west: [x - 1, y],
      } as const

      const elementTemplate: ModelElement = {
        from: [x - 8, 16 - (y + 1) - 8, -0.5],
        to: [x + 1 - 8, 16 - y - 8, 0.5],
        faces: {},
      }

      let shouldAddElement = false
      for (const [faceName, direction] of Object.entries(neighbours)) {
        if (checkNeighborPixelEmpty(...direction)) {
          shouldAddElement = true
          elementTemplate.faces[faceName as ModelFaceKey] = {
            uv: [x, y, x + 1, y + 1],
            texture: layerId,
          }
        }
      }

      if (shouldAddElement) {
        modelJson.elements.push(elementTemplate)
      }
    }
  }

  return modelJson
}

// ==========

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
export function getTextureColor(
  modelResourceLocation: string,
  tintindex?: number,
) {
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
