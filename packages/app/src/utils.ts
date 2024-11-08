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
) {
  const modelJson: {
    elements: ModelElement[]
  } = {
    elements: [
      {
        from: [-8, -8, -0.5],
        to: [8, 8, 0.5],
        faces: {
          north: { uv: [16, 0, 0, 16], texture: '#layer0' },
          south: { uv: [0, 0, 16, 16], texture: '#layer0' },
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
            texture: '#layer0',
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
