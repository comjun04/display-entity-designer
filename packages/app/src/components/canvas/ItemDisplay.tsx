import { useDisplayEntityStore } from '@/store'
import { FC, Ref, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, LineBasicMaterial, Object3D } from 'three'
import { useShallow } from 'zustand/shallow'
import Model from './Model'

type ItemDisplayProps = {
  id: string
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  object3DRef?: Ref<Object3D>
}

const ItemDisplay: FC<ItemDisplayProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const { selectedEntity, setSelected } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.find((e) => e.id === id),
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
    })),
  )

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])

  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ color: 'gold' }),
    [],
  )

  return (
    <object3D position={position} scale={size} rotation={rotation} ref={ref}>
      <lineSegments
        visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        // position={[0.5, 0.5, 0.5]}
      />

      <group onClick={() => setSelected(id)} position={[-0.5, -0.5, -0.5]}>
        <Model initialResourceLocation={`item/${type}`} />
      </group>
    </object3D>
  )
}

export default ItemDisplay
