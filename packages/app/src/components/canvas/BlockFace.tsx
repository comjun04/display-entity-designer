import { useTexture } from '@react-three/drei'
import { FC } from 'react'
import { NearestFilter } from 'three'

type BlockFaceProps = {
  face: 'up' | 'down' | 'north' | 'south' | 'west' | 'east'
  textureResourceLocation: string
  uv?: [number, number, number, number]
}

const BlockFace: FC<BlockFaceProps> = ({ textureResourceLocation }) => {
  const texture = useTexture(
    `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`,
  )

  // 텍스쳐 픽셀끼리 뭉쳐져서 blur되어 보이지 않게 설정
  // https://discourse.threejs.org/t/low-resolution-texture-is-very-blurry-how-can-i-get-around-this-issue/29948
  // https://github.com/mrdoob/three.js/blob/37d6f280a5cd642e801469bb048f52300d31258e/examples/webgl_geometry_minecraft.html#L154
  texture.magFilter = NearestFilter

  return (
    <mesh>
      <planeGeometry />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

export default BlockFace
