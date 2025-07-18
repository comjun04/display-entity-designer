import { Mutex } from 'async-mutex'
import {
  CanvasTexture,
  ColorRepresentation,
  FrontSide,
  Group,
  ImageLoader,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PlaneGeometry,
  Texture,
} from 'three'

import { UnifontSizeOverrides } from '@/constants'
import fetcher from '@/fetcher'
import { useCacheStore, useClassObjectCacheStore } from '@/stores/cacheStore'
import { CDNFontProviderResponse } from '@/types'
import { stripMinecraftPrefix } from '@/utils'

const UNIFONT_FILENAME = 'unifont/unifont_all_no_pua-15.1.05.hex'

// const fontAssetLoadMutexMap = new Map<string, Mutex>()
const unifontHexDataLoadMutex = new Mutex()

type Font = 'default' | 'uniform'
type CreateTextMeshArgs = {
  text: string // TODO: handle Raw JSON Text Format
  font: Font
  lineWidth: number
  color: ColorRepresentation
  backgroundColor: number
}

const UNIT_PIXEL_SIZE = 0.0125
export async function createTextMesh({
  text,
  font = 'default',
  lineWidth,
  backgroundColor,
}: CreateTextMeshArgs) {
  const textLinesGroup = new Group()

  // 모든 줄 통틀어서 최대 width를 가진 줄의 width
  let maxLineWidth = 0
  let lineHeightPixels = 0
  let offset = 0
  let lineWidthOverflowed = false
  let prevCharFont: Font = 'default'
  const tempCharMeshList: Mesh[] = []
  const textLinesHeightPixelsList: number[] = []

  for (const [charIdx, char] of text.split('').entries()) {
    if (char === '\n') {
      const lineGroup = new Group()
      lineGroup.add(...tempCharMeshList)
      textLinesGroup.add(lineGroup)
      textLinesHeightPixelsList.push(lineHeightPixels)

      tempCharMeshList.length = 0
      lineHeightPixels = 0
      offset = 0
      continue
    }

    // 텍스트 중간에 SPACE 문자가 2개 이상 연속으로 붙어 있더라도 최대 1개만 렌더링 (마크 동작)
    if (char === ' ') {
      const prevChar = text[charIdx - 1]
      if (prevChar === ' ') {
        continue
      }
    }

    // TODO: mesh를 만들지 않고도 width를 구하는 함수 만들기
    const {
      mesh,
      widthPixels: widthRelativePixels,
      baseWidthPixels: baseWidthRelativePixels,
      heightPixels: heightRelativePixels,
      font: charFont,
    } = await createCharMesh(char, font)

    const widthPixels = widthRelativePixels * (charFont === 'uniform' ? 1 : 2)
    const heightPixels = heightRelativePixels * (charFont === 'uniform' ? 1 : 2)

    // scale, width of one pixel
    // scale = 0.025 if baseWidthPixels = 8
    // scale = 0.0125 if baseWidthPixels = 16
    const scale = 0.2 / baseWidthRelativePixels
    const width = widthRelativePixels * scale

    const offsetPixels = offset / scale

    // 주어진 line length의 2배 값이 한 줄에 입력된 글자의 픽셀 수(여백 포함)보다 많으면
    // 그 다음 글자부터 다음 줄로 내리기
    if (offsetPixels + widthPixels > lineWidth * 2) {
      // 입력한 글자 전까지 한 줄로 묶기
      if (tempCharMeshList.length > 0) {
        const lineGroup = new Group()
        lineGroup.add(...tempCharMeshList)
        textLinesGroup.add(lineGroup)
        textLinesHeightPixelsList.push(lineHeightPixels)

        offset += UNIT_PIXEL_SIZE * (charFont === 'uniform' ? 1 : 2)
        if (offset > maxLineWidth) {
          maxLineWidth = offset
        }
      }

      // 입력한 글자는 다음 줄로 예약
      tempCharMeshList.length = 0
      lineHeightPixels = 0
      if (char !== ' ') {
        // 다음 줄로 예약을 걸 경우 첫 문자가 `' '` (0x20)이 아닌 경우에만 새 줄에 넣기
        tempCharMeshList.push(mesh)
        if (lineHeightPixels < heightPixels) {
          lineHeightPixels = heightPixels
        }
      }

      offset = 0
      lineWidthOverflowed = true
    } else {
      tempCharMeshList.push(mesh)
      if (lineHeightPixels < heightPixels) {
        lineHeightPixels = heightPixels
      }
    }

    // lineWidth 초과해서 다음 줄로 내려온 경우 첫 문자가 `' '` (0x20) 문자면 처리하지 않음
    if (!lineWidthOverflowed || char !== ' ') {
      // 글자 왼쪽 spacing 계산
      if (tempCharMeshList.length > 1) {
        if (prevCharFont !== charFont) {
          offset += UNIT_PIXEL_SIZE
        } else if (charFont === 'default') {
          offset += UNIT_PIXEL_SIZE * 2
        }
      } else {
        offset += UNIT_PIXEL_SIZE * (charFont === 'uniform' ? 1 : 2)
      }
      console.log(offset, width)

      mesh.position.setX(offset)
      offset += width

      if (offset > maxLineWidth) {
        maxLineWidth = offset
      }
    }

    lineWidthOverflowed = false
    prevCharFont = charFont
  }
  if (tempCharMeshList.length > 0) {
    // 마지막 문자까지
    const lineGroup = new Group()
    lineGroup.add(...tempCharMeshList)
    textLinesGroup.add(lineGroup)
    textLinesHeightPixelsList.push(lineHeightPixels)

    offset += UNIT_PIXEL_SIZE * (prevCharFont === 'uniform' ? 1 : 2)
    if (offset > maxLineWidth) {
      maxLineWidth = offset
    }
  }

  let maxHeight = 0

  for (const [i, lineGroup] of textLinesGroup.children.toReversed().entries()) {
    const heightPixels =
      textLinesHeightPixelsList[textLinesHeightPixelsList.length - i - 1]
    const bottomSpacing = 4 * UNIT_PIXEL_SIZE // 줄 하단 여백
    const heightPixelsWithSpacing = heightPixels + 4 // 각 줄당 아래 2픽셀 여백
    lineGroup.position.set(
      (maxLineWidth / 2) * -1, // 중앙에 위치하도록 조정
      maxHeight + bottomSpacing,
      0,
    )

    maxHeight += heightPixelsWithSpacing * UNIT_PIXEL_SIZE
  }

  maxHeight += 2 * UNIT_PIXEL_SIZE // 맨 위 여백

  const backgroundGeometry = new PlaneGeometry(1, 1)

  const backgroundColorAlpha = ((backgroundColor >>> 24) & 0xff) / 0xff
  const backgroundColorRGB = (backgroundColor << 8) >>> 8 // ensure unsigned
  const backgroundMaterial = new MeshBasicMaterial({
    color: backgroundColorRGB,
    side: FrontSide,
    opacity: backgroundColorAlpha,
    transparent: true,
    alphaTest: 0.01,
  })
  const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial)
  backgroundMesh.position.set(0, maxHeight / 2, 0)
  backgroundMesh.scale.set(maxLineWidth, maxHeight, 1)
  textLinesGroup.add(backgroundMesh)

  return textLinesGroup
}

/*
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
*/

const imageLoader = new ImageLoader()
imageLoader.setCrossOrigin('anonymous')
async function createBitmapFontCharTexture(char: string) {
  const fontCharData = await getBitmapFontCharData(char)
  if (fontCharData == null) {
    return null
  }

  const img = await imageLoader.loadAsync(
    `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${stripMinecraftPrefix(fontCharData.file)}`,
  )

  const canvas = document.createElement('canvas')
  canvas.width = fontCharData.width
  canvas.height = fontCharData.height

  const ctx = canvas.getContext('2d')
  if (ctx == null) {
    throw new Error('Cannot get canvas 2d context')
  }

  ctx.drawImage(
    img,
    fontCharData.col * canvas.width,
    fontCharData.row * canvas.height,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // scan for non-transparent area
  let minX = canvas.width
  let maxX = 0
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4
      const alpha = imgData.data[idx + 3]
      if (alpha > 0) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
      }
    }
  }

  // if the character is blank (no pixels), use a fallbacl 1x1
  if (minX > maxX) {
    minX = 0
    maxX = 0
  }

  const croppedWidth = maxX - minX + 1

  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = croppedWidth
  croppedCanvas.height = canvas.height
  const croppedCanvasCtx = croppedCanvas.getContext('2d')!
  croppedCanvasCtx.drawImage(
    canvas,
    minX,
    0,
    maxX + 1,
    canvas.height,
    0,
    0,
    croppedWidth,
    canvas.height,
  )

  const texture = new CanvasTexture(croppedCanvas)
  return {
    texture,
    width: croppedWidth,
    baseWidth: canvas.width,
    height: canvas.height,
  }
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

async function getUnifontCharPixels(char: string) {
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

  /**
   * ## unifont 사용 시 (`unihex` provider)
   * 모든 문자 세로 16픽셀 고정, 가로는 정의상 8/16/24/32픽셀일 수 있으나 렌더링 시 아래 규칙에 따라 실제 width가 조정될 수 있음
   *
   * 줄 여백: 좌우 1픽셀, 위아래 2픽셀
   * 문자 여백:
   * - 좌우: (1) 해당 문자에서 좌우 여백을 제거하고 (2) 가로 픽셀수를 세서
   *   - 짝수면: 좌우에 여백 1픽셀 추가
   *   - 홀수면: 왼쪽에만 여백 1픽셀 추가
   *   - 단, unifont.json 파일에 `size_overrides`에 해당 문자가 포함되어 있을 경우 거기에 적힌 left와 right 값으로 width를 산출하고 여백 적용
   *     (좌우여백 자르고 픽셀수 세는거보다 이게 우선)
   */

  // 마크에서 사용하는 unifont는 width가 8픽셀 아니면 16픽셀만 존재하므로 단순하게 핸들링
  // TODO: 커스텀 리소스팩을 사용하는 경우 24, 32픽셀도 가능하므로 대응응
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
    // 좌우 여백 다 자르고 남은 width
    const trimmedWidth = totalRight - totalLeft + 1

    for (let i = 0; i < pixels.length; i++) {
      const row = pixels[i]
      const newRow = row.slice(totalLeft, totalRight + 1)

      // 왼쪽 여백은 항상 추가
      newRow.unshift(false)
      if (trimmedWidth % 2 === 0) {
        // trimmedWidth이 짝수일 경우 오른쪽 1픽셀 여백 추가
        newRow.push(false)
      }

      pixels[i] = newRow
    }
  }

  return pixels
}

async function getBitmapFontCharData(char: string) {
  const { fontProviders, setFontProviders } = useCacheStore.getState()

  // load character providers
  let defaultFontProviders = fontProviders['provider.default']
  if (fontProviders['provider.default'] == null) {
    const { providers } = (await fetcher(
      '/assets/minecraft/font/include/default.json',
    )) as CDNFontProviderResponse
    setFontProviders('provider.default', providers)
    defaultFontProviders = providers
  }

  // find character
  for (const provider of defaultFontProviders.filter(
    (provider) => provider.type === 'bitmap',
  )) {
    for (let i = 0; i < provider.chars.length; i++) {
      const idx = provider.chars[i].indexOf(char[0])
      if (idx >= 0) {
        const isAccentChar = provider.file.endsWith('/accented.png')

        // accented characters use 12x9 pixels, others use 8x8 (vertical x horizontial)
        return {
          file: provider.file,
          width: isAccentChar ? 9 : 8,
          height: (provider.height ?? isAccentChar) ? 12 : 8,
          ascent: provider.ascent,
          row: i,
          col: idx,
        }
      }
    }
  }
}

async function createCharMesh(char: string, preferFont: Font) {
  let texture!: Texture
  let geometry!: PlaneGeometry
  let material!: MeshBasicMaterial
  let width!: number // 애벽 자르고 난 뒤의 width
  let baseWidth!: number // 여백 자르기 전 원래 width
  let height!: number

  // check for cached glyph data
  const { fontGlyphs: cache, setFontGlyph } =
    useClassObjectCacheStore.getState()
  const key = `${preferFont};${char.charCodeAt(0).toString(16)}`

  const d = cache.get(key)
  if (d != null) {
    geometry = d.geometry
    material = d.material
    width = d.widthPixels
    baseWidth = d.baseWidthPixels
    height = d.heightPixels
  } else {
    if (preferFont === 'default') {
      const d = await createBitmapFontCharTexture(char)
      if (d == null) {
        return await createCharMesh(char, 'uniform')
      }

      texture = d.texture
      width = d.width
      baseWidth = d.baseWidth
      height = d.height

      geometry = new PlaneGeometry(width, d.height)
      geometry.translate(width / 2, d.height / 2, 0.1)
      geometry.scale(0.025, 0.025, 0.025)
    } else if (preferFont === 'uniform') {
      const pixels = await getUnifontCharPixels(char)
      height = pixels.length
      baseWidth = height // 여백 자르기 전에는 width와 height가 동일
      width = pixels[0].length

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

      texture = new CanvasTexture(canvas)

      geometry = new PlaneGeometry(width, height)
      geometry.translate(width / 2, height / 2, 0.1)
      geometry.scale(0.0125, 0.0125, 0.0125)
    }

    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter

    material = new MeshBasicMaterial({
      map: texture,
      side: FrontSide,
      transparent: true,
      opacity: 1,
      alphaTest: 0.01,
    })

    // cache glyph data
    setFontGlyph(key, {
      geometry,
      material,
      widthPixels: width,
      baseWidthPixels: baseWidth,
      heightPixels: height,
    })
  }

  const mesh = new Mesh(geometry, material)
  return {
    mesh,
    widthPixels: width,
    baseWidthPixels: baseWidth,
    heightPixels: height,
    font: preferFont,
  }
}
