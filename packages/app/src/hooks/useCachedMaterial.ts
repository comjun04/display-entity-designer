import { useTexture } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { MeshStandardMaterial, NearestFilter } from 'three'

import { useCacheStore, useClassObjectCacheStore } from '@/stores/cacheStore'
import { getTextureColor } from '@/utils'

type CachedMaterialHookArgs = {
  textureResourceLocation: string
  modelResourceLocation: string
  textureLayer?: string
  textureSize?: [number, number]
  tintindex?: number
}

const useCachedMaterial = ({
  textureResourceLocation,
  modelResourceLocation,
  textureLayer,
  textureSize = [16, 16],
  tintindex,
}: CachedMaterialHookArgs) => {
  const [processedImageDataUrl, setProcessedImageDataUrl] = useState<string>()
  const [materialLoaded, setMaterialLoaded] = useState(false)
  const materialRef = useRef<MeshStandardMaterial>()

  const texture = useTexture(
    processedImageDataUrl ??
      `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`,
    (texture) => {
      // 텍스쳐 픽셀끼리 뭉쳐져서 blur되어 보이지 않게 설정
      // https://discourse.threejs.org/t/low-resolution-texture-is-very-blurry-how-can-i-get-around-this-issue/29948
      // https://github.com/mrdoob/three.js/blob/37d6f280a5cd642e801469bb048f52300d31258e/examples/webgl_geometry_minecraft.html#L154
      texture.magFilter = NearestFilter
      // SRGB로 설정해야 텍스쳐에 하얀색 끼가 들어가지 않고 제대로 보임임
      texture.colorSpace = 'srgb'
    },
  )

  const [width, height] = textureSize

  const textureColor = getTextureColor(
    modelResourceLocation,
    textureLayer,
    tintindex,
  )

  useEffect(() => {
    if (materialLoaded) return

    const { croppedTextureDataUrls, setCroppedTextureDataUrl } =
      useCacheStore.getState()
    const { materials, setMaterial } = useClassObjectCacheStore.getState()

    const key = `${textureResourceLocation};${textureColor}`
    if (!materials.has(key)) {
      if (processedImageDataUrl == null) {
        // process texture

        // 한번에 많은 양의 block display가 추가된 경우 (예: 프로젝트 파일을 로드할 때) state update로 인한 rerender가 일어나기 전에 이 부분이 먼저 실행되어
        // 캐시에 데이터가 이미 있음에도 불구하고 새로 처리하는 문제가 발생
        // 따라서 state update event는 발생 안했는데 state는 변경된 경우를 체크하여 이 경우 텍스쳐 처리를 하지 않도록 코드 추가
        let cachedCroppedTextureDataUrl =
          croppedTextureDataUrls[textureResourceLocation]
        if (cachedCroppedTextureDataUrl == null) {
          // 텍스쳐 사진을 처음 로드했을 경우 맨 위 16x16만 잘라서 적용

          const img = texture.image as HTMLImageElement

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height)

          const croppedTextureDataUrl = canvas.toDataURL()
          cachedCroppedTextureDataUrl = croppedTextureDataUrl
          setCroppedTextureDataUrl(
            textureResourceLocation,
            croppedTextureDataUrl,
          )
        }

        setProcessedImageDataUrl(cachedCroppedTextureDataUrl)
        return
      }

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
      materialRef.current = material
    } else {
      materialRef.current = materials.get(key)
    }

    setMaterialLoaded(true)
  }, [
    textureResourceLocation,
    textureColor,
    processedImageDataUrl,
    width,
    height,
    texture,
    materialLoaded,
  ])

  return materialRef.current
}

export default useCachedMaterial
