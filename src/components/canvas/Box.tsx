import { FC, useMemo } from 'react'
import { BoxGeometry, MeshStandardMaterial } from 'three'

type BoxProps = {
  size: [number, number, number]
  position: [number, number, number]
  color?: number | string
}

const Box: FC<BoxProps> = ({ color = 0x888888, size, position }) => {
  const geometry = useMemo(
    () => new BoxGeometry(size[0], size[1], size[2]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size[0], size[1], size[2]],
  )
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
      }),
    [color],
  )

  return (
    <object3D position={position}>
      <mesh
        geometry={geometry}
        material={material}
        position={[size[0] / 2, size[1] / 2, size[2] / 2]} // 왼쪽 아래 점이 기준점이 되도록 각 축 변 길이의 반만큼 이동
      />
    </object3D>
  )
}

export default Box
