import { Mutex } from 'async-mutex'
import {
  ImageLoader,
  MeshStandardMaterial,
  NearestFilter,
  TextureLoader,
} from 'three'

import { useCacheStore, useClassObjectCacheStore } from '@/stores/cacheStore'
import { getTextureColor } from '@/utils'

const materialLoadMutexMap = new Map<string, Mutex>()

export type LoadMaterialArgs = {
  textureResourceLocation: string
  modelResourceLocation: string
  textureLayer?: string
  textureSize?: [number, number]
  tintindex?: number
}

export async function loadMaterial({
  textureResourceLocation,
  modelResourceLocation,
  textureLayer,
  textureSize = [16, 16],
  tintindex,
}: LoadMaterialArgs) {
  const { croppedTextureDataUrls, setCroppedTextureDataUrl } =
    useCacheStore.getState()
  const { setMaterial } = useClassObjectCacheStore.getState()

  const [width, height] = textureSize

  const textureColor = getTextureColor(
    modelResourceLocation,
    textureLayer,
    tintindex,
  )

  const key = `${textureResourceLocation};${textureColor}`

  // 동시에 여러 번 로딩하지 않도록 key값을 기준으로 lock을 구현
  if (!materialLoadMutexMap.has(key)) {
    materialLoadMutexMap.set(key, new Mutex())
  }
  const mutex = materialLoadMutexMap.get(key)!
  return await mutex.runExclusive(async () => {
    // check for cached
    const { materials } = useClassObjectCacheStore.getState()
    if (materials.has(key)) {
      return materials.get(key)!
    }

    console.log(`Loading material for ${textureResourceLocation}`)

    // process texture

    let cachedCroppedTextureDataUrl =
      croppedTextureDataUrls[textureResourceLocation]
    if (cachedCroppedTextureDataUrl == null) {
      const img = await new ImageLoader().loadAsync(
        `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`,
      )

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      // 텍스쳐 사진을 처음 로드했을 경우 맨 위 width x height 만큼 잘라서 적용
      canvas.width = width
      canvas.height = height

      ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height)

      const croppedTextureDataUrl = canvas.toDataURL()
      cachedCroppedTextureDataUrl = croppedTextureDataUrl
      setCroppedTextureDataUrl(textureResourceLocation, croppedTextureDataUrl)
    }

    const texture = await new TextureLoader().loadAsync(
      cachedCroppedTextureDataUrl,
    )
    // 텍스쳐 픽셀끼리 뭉쳐져서 blur되어 보이지 않게 설정
    // https://discourse.threejs.org/t/low-resolution-texture-is-very-blurry-how-can-i-get-around-this-issue/29948
    // https://github.com/mrdoob/three.js/blob/37d6f280a5cd642e801469bb048f52300d31258e/examples/webgl_geometry_minecraft.html#L154
    texture.magFilter = NearestFilter
    // SRGB로 설정해야 텍스쳐에 하얀색 끼가 들어가지 않고 제대로 보임임
    texture.colorSpace = 'srgb'

    // create material object and cache it
    const material = new MeshStandardMaterial({
      map: texture,
      transparent: true,
      //  transparent일 경우 빈 공간을 transparent 처리하면 opacity=0이 되는데
      //  alphaTest > 0 이어야 빈 공간이 실제로 렌더링되지 않음 (안 할 경우 빈 공간이 다른 mesh도 안보이게 만듬)
      alphaTest: 0.01,
      toneMapped: false, // 인게임에서는 블록이 실제 텍스쳐보다 덜 선명하게 렌더링됨
      color: textureColor,
    })

    setMaterial(key, material)
    return material
  })
}
