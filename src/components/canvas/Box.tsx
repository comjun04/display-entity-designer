import { useDisplayEntityStore } from '@/store'
import { FC, Ref, useMemo } from 'react'
import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from 'three'
import { useShallow } from 'zustand/shallow'

type BoxProps = {
  id: string
  size: [number, number, number]
  position: [number, number, number]
  color?: number | string
  object3DRef?: Ref<Object3D>
}

const Box: FC<BoxProps> = ({
  id,
  color = 0x888888,
  size,
  position,
  object3DRef: ref,
}) => {
  const { selectedEntity, setSelected } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
    })),
  )

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

  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ color: 'gold' }),
    [],
  )

  return (
    <object3D position={position} ref={ref}>
      <mesh
        geometry={geometry}
        material={material}
        position={[size[0] / 2, size[1] / 2, size[2] / 2]} // 왼쪽 아래 점이 기준점이 되도록 각 축 변 길이의 반만큼 이동
        onClick={() => setSelected(id)}
      />

      <lineSegments
        visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        position={[size[0] / 2, size[1] / 2, size[2] / 2]}
      />
    </object3D>
  )
}

export default Box
