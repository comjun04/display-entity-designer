import { useTexture } from '@react-three/drei'
import { FC } from 'react'
import { MathUtils, NearestFilter } from 'three'

type BlockFaceProps = {
  faceName: 'up' | 'down' | 'north' | 'south' | 'west' | 'east'
  textureResourceLocation: string
  uv?: [number, number, number, number]
}

const BlockFace: FC<BlockFaceProps> = ({
  textureResourceLocation,
  uv,
  faceName,
}) => {
  const texture = useTexture(
    `${import.meta.env.VITE_CDN_BASE_URL}/assets/minecraft/textures/${textureResourceLocation}.png`,
  )

  // 텍스쳐 픽셀끼리 뭉쳐져서 blur되어 보이지 않게 설정
  // https://discourse.threejs.org/t/low-resolution-texture-is-very-blurry-how-can-i-get-around-this-issue/29948
  // https://github.com/mrdoob/three.js/blob/37d6f280a5cd642e801469bb048f52300d31258e/examples/webgl_geometry_minecraft.html#L154
  texture.magFilter = NearestFilter

  let position: [number, number, number] = [0, 0, 0]
  let rotation: [number, number, number] = [0, 0, 0]
  const deg90 = MathUtils.degToRad(90)

  switch (faceName) {
    case 'up':
      position = [0, 0.5, 0]
      rotation = [-deg90, 0, 0]
      break
    case 'down':
      position = [0, -0.5, 0]
      rotation = [deg90, 0, 0]
      break
    case 'north':
      position = [0, 0, -0.5]
      rotation = [0, 2 * deg90, 0]
      break
    case 'south':
      position = [0, 0, 0.5]
      rotation = [0, 0, 0]
      break
    case 'west':
      position = [-0.5, 0, 0]
      rotation = [0, -deg90, 0]
      break
    case 'east':
      position = [0.5, 0, 0]
      rotation = [0, deg90, 0]
      break
  }

  if (uv == null) {
    switch (faceName) {
      case 'up':
        uv = [0, 0, 16, 16]
        break
      case 'down':
        uv = [0, 0, 16, 16]
        break
      case 'north':
        uv = [0, 0, 16, 16]
        break
      case 'south':
        uv = [0, 0, 16, 16]
        break
      case 'west':
        uv = [0, 0, 16, 16]
        break
      case 'east':
        uv = [0, 0, 16, 16]
        break
    }
  }

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  )
}

export default BlockFace
