import { Mutex } from 'async-mutex'
import { CanvasTexture } from 'three'
import { FileLoader } from 'three'

import { UnifontSizeOverrides } from '@/constants'
import { useCacheStore } from '@/stores/cacheStore'

const fileLoader = new FileLoader()
fileLoader.setResponseType('json')

const unifontHexDataLoadMutex = new Mutex()

async function loadUnifontHexFile(filePath: string) {
  const unifontHexFile = await fetch(
    `${import.meta.env.VITE_CDN_BASE_ROOT_URL}/${filePath}`,
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
        // TODO: Extract version manifest loading
        const versionManifest = await fileLoader.loadAsync(
          `${import.meta.env.VITE_CDN_BASE_URL}/metadata.json`,
        )
        const { assetIndex, unifontHexFilePath } = versionManifest.sharedAssets
        const fullFilePath = `shared/${assetIndex}/${unifontHexFilePath}`

        await loadUnifontHexFile(fullFilePath)
      }
    })
  }

  const hex = useCacheStore.getState().unifontHexData.get(charCode)
  if (hex == null) {
    throw new Error(`Unsupported character ${char[0]} (${charCode})!`)
  }

  /**
   * ## unifont 사용 시 (`unihex` provider)
   * 모든 문자 세로 16픽셀 고정, 가로는 정의상 8/16/24/32픽셀일 수 있으나 렌더링 시 좌우 여백을 제거한 뒤의 길이
   */

  // 마크에서 사용하는 unifont는 width가 8픽셀 아니면 16픽셀만 존재하므로 단순하게 핸들링
  // TODO: 커스텀 리소스팩을 사용하는 경우 24, 32픽셀도 가능하므로 대응
  const width = hex.length > 32 ? 16 : 8
  // const height = 16
  const pixels: boolean[][] = []

  let totalLeft = width - 1
  let totalRight = 0

  // size_overrides에 정의된 문자면 left랑 right 값을 바로 적용
  const matchingSizeOverrideEntry = UnifontSizeOverrides.find(
    (overrideEntry) => {
      const from = overrideEntry.from.charCodeAt(0)
      const to = overrideEntry.to.charCodeAt(0)
      return from <= charCode && charCode <= to
    },
  )
  if (matchingSizeOverrideEntry != null) {
    totalLeft = matchingSizeOverrideEntry.left
    totalRight = matchingSizeOverrideEntry.right
  }

  const charsToRead = width / 4 // hex.length > 32 ? 4 : 2
  for (let i = 0; i < hex.length; i += charsToRead) {
    const chars = hex.slice(i, i + charsToRead)
    const num = parseInt(chars, 16)

    const binaryString = num.toString(2).padStart(width, '0')
    if (matchingSizeOverrideEntry == null) {
      const left = binaryString.indexOf('1')
      if (left >= 0) {
        totalLeft = Math.min(totalLeft, left)
      }
      const right = binaryString.lastIndexOf('1')
      if (right >= 0) {
        totalRight = Math.max(totalRight, right)
      }
    }

    const pixelsRow = binaryString.split('').map((d) => d === '1')
    pixels.push(pixelsRow)
  }

  // SPACE 문자가 아니고 색칠된 픽셀이 하나라도 있다면
  if (totalLeft <= totalRight && charCode !== 0x20) {
    for (let i = 0; i < pixels.length; i++) {
      const row = pixels[i]
      // 좌우 여백 자르기
      const newRow = row.slice(totalLeft, totalRight + 1)

      pixels[i] = newRow
    }
  }

  return pixels
}

export async function createCharTexture(char: string) {
  const pixels = await getCharPixels(char)
  const height = pixels.length
  const baseWidth = height // 여백 자르기 전에는 width와 height가 동일
  const width = pixels[0].length
  const advance = Math.floor(width / 2) + 1

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')!

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

  return {
    texture,
    width,
    baseWidth,
    height,
    advance,
  }
}
