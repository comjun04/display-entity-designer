import useBlockStates from '@/hooks/useBlockStates'
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
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color?: number | string
  object3DRef?: Ref<Object3D>
}

const Box: FC<BoxProps> = ({
  id,
  type,
  color = 0x888888,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const { selectedEntity, setSelected } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
    })),
  )

  const blockstates = useBlockStates(type)
  console.log(blockstates)

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
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
    <object3D position={position} ref={ref} scale={size} rotation={rotation}>
      <mesh
        geometry={geometry}
        material={material}
        position={[0.5, 0.5, 0.5]} // 왼쪽 아래 점이 기준점이 되도록 geometry 각 축 변 길이의 반만큼 이동
        onClick={() => setSelected(id)}
      />

      <lineSegments
        visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        position={[0.5, 0.5, 0.5]}
      />
    </object3D>
  )
}

export default Box
