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

import { UnifontSizeOverrides } from '@/constants'
import { useCacheStore } from '@/stores/cacheStore'

const UNIFONT_FILENAME = 'unifont/unifont_all_no_pua-16.0.01.hex'

const fontAssetLoadMutexMap = new Map<string, Mutex>()
const unifontHexDataLoadMutex = new Mutex()

type CreateTextMeshArgs = {
  text: string // TODO: handle Raw JSON Text Format
  lineLength: number
  color: ColorRepresentation
  backgroundColor: ColorRepresentation
}

export async function createTextMesh({ text, lineLength }: CreateTextMeshArgs) {
  const textLinesGroup = new Group()

  // 모든 줄 통틀어서 최대 width를 가진 줄의 width
  let maxLineWidth = 0
  let offset = 0
  let lineLengthOverflowed = false
  const tempCharMeshList: Mesh[] = []

  for (const char of text.split('')) {
    if (char === '\n') {
      const lineGroup = new Group()
      lineGroup.add(...tempCharMeshList)
      textLinesGroup.add(lineGroup)

      tempCharMeshList.length = 0 // clear list
      continue
    }

    // TODO: mesh를 만들지 않고도 width를 구하는 함수 만들기
    const { mesh, widthPixels } = await createCharMesh(char)
    const width = widthPixels * 0.0125 // x0.0125 scale 적용

    const offsetPixels = offset / 0.0125

    // 주어진 line length의 2배 값이 한 줄에 입력된 글자의 픽셀 수(여백 포함)보다 많으면
    // 그 다음 글자부터 다음 줄로 내리기
    if (offsetPixels + widthPixels > lineLength * 2) {
      // 입력한 글자 전까지 한 줄로 묶기
      if (tempCharMeshList.length > 0) {
        const lineGroup = new Group()
        lineGroup.add(...tempCharMeshList)
        textLinesGroup.add(lineGroup)
      }

      // 입력한 글자는 다음 줄로 예약
      tempCharMeshList.length = 0
      if (char !== ' ') {
        // 다음 줄로 예약을 걸 경우 첫 문자가 `' '` (0x20)이 아닌 경우에만 새 줄에 넣기
        tempCharMeshList.push(mesh)
      }

      offset = 0
      lineLengthOverflowed = true
    } else {
      tempCharMeshList.push(mesh)
    }

    // lineLength 초과해서 다음 줄로 내려온 경우 첫 문자가 `' '` (0x20) 문자면 처리하지 않음음
    if (!lineLengthOverflowed || char !== ' ') {
      mesh.position.setX(offset)
      offset += width
      if (offset > maxLineWidth) {
        maxLineWidth = offset
      }
    }

    lineLengthOverflowed = false
  }
  if (tempCharMeshList.length > 0) {
    // 마지막 문자까지
    const lineGroup = new Group()
    lineGroup.add(...tempCharMeshList)
    textLinesGroup.add(lineGroup)
  }

  for (const [i, lineGroup] of textLinesGroup.children.entries()) {
    // line height calculation
    lineGroup.position.set(
      (maxLineWidth / 2) * -1, // 중앙에 위치하도록 조정
      0.0125 * 20 * (textLinesGroup.children.length - i - 1) + 2 * 0.0125, // 각 줄당 위아래 2픽셀 여백
      0,
    )
  }

  // 텍스트가 아무것도 없을 경우 (최대 width가 0일 경우) 좌우 여백도 표시하지 않음
  if (maxLineWidth > 0) {
    maxLineWidth += 0.0125 * 2 // 좌우 1픽셀 여백
  }
  const maxLineHeight = 0.0125 * 20 * textLinesGroup.children.length

  const backgroundGeometry = new PlaneGeometry(1, 1)
  const backgroundMaterial = new MeshBasicMaterial({
    color: 0x000000,
    side: FrontSide,
    opacity: 1,
    transparent: true,
    alphaTest: 0.01,
  })
  const backgroundMesh = new Mesh(backgroundGeometry, backgroundMaterial)
  backgroundMesh.position.set(0, maxLineHeight / 2, 0)
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

      // trimmedWidth의 홀짝 여부 상관없이 왼쪽 1픽셀 여백 추가
      newRow.unshift(false)
      if (trimmedWidth % 2 === 0) {
        // trimmedWidth이 짝수일 경우 오른쪽 1픽셀 여백도 추가
        newRow.push(false)
      }

      pixels[i] = newRow
    }
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
  geometry.scale(0.0125, 0.0125, 0.0125)

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
    widthPixels: width,
  }
}
