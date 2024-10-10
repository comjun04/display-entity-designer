import { FC, useMemo } from 'react'
import { BoxGeometry, MeshBasicMaterial } from 'three'

type BoxProps = {
  color?: number | string
}

const Box: FC<BoxProps> = ({ color = 0x888888 }) => {
  const geometry = useMemo(() => new BoxGeometry(), [])
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color,
      }),
    [color],
  )

  return <mesh geometry={geometry} material={material} />
}

export default Box
