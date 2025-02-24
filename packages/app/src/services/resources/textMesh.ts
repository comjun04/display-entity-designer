import { Mutex } from 'async-mutex'
import {
  CanvasTexture,
  ColorRepresentation,
  FrontSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
} from 'three'

import { useCacheStore } from '@/stores/cacheStore'

const UNIFONT_FILENAME = 'unifont/unifont_all_no_pua-16.0.01.hex'

const fontAssetLoadMutexMap = new Map<string, Mutex>()
const unifontHexDataLoadMutex = new Mutex()

type CreateTextMeshArgs = {
  text: string // TODO: handle Raw JSON Text Format
  color: ColorRepresentation
  backgroundColor: ColorRepresentation
}

export async function createTextMesh({ text }: CreateTextMeshArgs) {
  const lines = text.split('\n') // TODO: trim()?
  const textLinesGroup = new Group()

  let maxLineWidth = 0

  for (const [i, line] of lines.entries()) {
    const lineGroup = new Group()
    let offset = 0

    const chars = line.split('')
    for (const ch of chars) {
      const { mesh, width, height } = await createCharMesh(ch)

      mesh.position.setX(offset)
      offset += width
      lineGroup.add(mesh)
    }

    if (offset > maxLineWidth) {
      maxLineWidth = offset
    }

    // line height calculation
    lineGroup.position.set(
      0.125, // 왼쪽 1픽셀 여백
      0.125 * 20 * (lines.length - i - 1) + 2 * 0.125, // 각 줄당 위아래 2픽셀 여백
      0,
    )

    textLinesGroup.add(lineGroup)
  }

  maxLineWidth += 0.125 // 왼쪽 1픽셀 여백
  const maxLineHeight = 0.125 * 20 * lines.length

  const backgroundGeometry = new PlaneGeometry(1, 1)
  const backgroundMaterial = new MeshBasicMaterial({
    color: 0x000000,
    side: FrontSide,
    opacity: 1,
    transparent: true,
    alphaTest: 0.01,
  })
  const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial)
  backgroundMesh.position.set(maxLineWidth / 2, maxLineHeight / 2, 0)
  backgroundMesh.scale.set(maxLineWidth, maxLineHeight, 1)
  textLinesGroup.add(backgroundMesh)

  return textLinesGroup
}

async function loadFontResource(filePath: string) {
  const { fontResources } = useCacheStore.getState()
  const fontResource = fontResources[filePath]
  if (fontResource != null) return fontResource

  if (!fontAssetLoadMutexMap.has(filePath)) {
    fontAssetLoadMutexMap.set(filePath, new Mutex())
  }
  const mutex = fontAssetLoadMutexMap.get(filePath)!

  return await mutex.runExclusive(async () => {
    const { fontResources } = useCacheStore.getState()
    const fontResource = fontResources[filePath]
    if (fontResource != null) return fontResources

    const d = await fetch(
      `${import.meta.env.VITE_CDN_BASE_URL}/font/${filePath}`,
    )

    // TODO: currently assuming font file as unifont hex
    // implement png font later
    // const
  })
}

async function loadUnifontHexFile(filePath: string) {
  const unifontHexFile = await fetch(
    `${import.meta.env.VITE_CDN_BASE_URL}/font/${filePath}`,
  ).then((res) => res.text())

  const unifontHexDataNewMap = new Map<number, string>()

  const lines = unifontHexFile.trim().split('\n')
  for (const line of lines) {
    const [charCodeStr, rawHex] = line.split(':')
    const hex = rawHex.trim()

    const charCode = parseInt(charCodeStr, 16)
    unifontHexDataNewMap.set(charCode, hex)
  }

  useCacheStore.getState().setUnifontHexData(unifontHexDataNewMap)
}

async function getCharPixels(char: string) {
  const charCode = char.charCodeAt(0)

  if (!useCacheStore.getState().unifontHexData.has(charCode)) {
    await unifontHexDataLoadMutex.runExclusive(async () => {
      if (useCacheStore.getState().unifontHexData.size < 1) {
        await loadUnifontHexFile(UNIFONT_FILENAME)
      }
    })
  }

  const hex = useCacheStore.getState().unifontHexData.get(charCode)
  if (hex == null) {
    throw new Error(`Unsupported character ${char[0]} (${charCode})!`)
  }

  const width = hex.length > 32 ? 16 : 8
  // const height = 16
  const pixels: boolean[][] = []

  const charsToRead = width / 4 // hex.length > 32 ? 4 : 2
  for (let i = 0; i < hex.length; i += charsToRead) {
    const chars = hex.slice(i, i + charsToRead)
    const num = parseInt(chars, 16)

    const pixelsRow: boolean[] = []
    for (let j = width - 1; j >= 0; j--) {
      pixelsRow.push(!!((num >> j) & 1))
    }

    pixels.push(pixelsRow)
  }

  return pixels
}

async function createCharMesh(char: string) {
  const pixels = await getCharPixels(char)
  const height = pixels.length
  const width = pixels[0].length

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (context == null) {
    throw new Error('Cannot get canvas 2d context')
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const pixelValue = pixels[row][col]
      // 0x123456 형식 안먹힘, 'white'나 '#000000' 같이 css에서 사용 가능한 형식만 먹힘
      const pixelColor = pixelValue ? '#ffffff' : '#00000000' // transparent if false

      context.fillStyle = pixelColor
      context.fillRect(col, row, 1, 1)
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter

  const geometry = new PlaneGeometry(width, height)
  geometry.translate(width / 2, height / 2, 0.1)
  geometry.scale(0.125, 0.125, 0.125)

  const material = new MeshBasicMaterial({
    map: texture,
    side: FrontSide,
    transparent: true,
    opacity: 1,
    alphaTest: 0.01,
  })

  const mesh = new Mesh(geometry, material)
  return {
    mesh,
    width: width * 0.125, // x0.125 scale 적용
    height: height * 0.125,
  }
}
