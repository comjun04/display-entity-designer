import { useDisplayEntityStore } from '@/store'
import { FC, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, LineBasicMaterial } from 'three'
import { useShallow } from 'zustand/shallow'
import Model from './Model'

type ItemDisplayProps = {
  id: string
}

const ItemDisplay: FC<ItemDisplayProps> = ({ id }) => {
  const { thisEntity, selectedEntity, setSelected } = useDisplayEntityStore(
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
    <object3D>
      <lineSegments
        // visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        // position={[0.5, 0.5, 0.5]}
      />

      <group onClick={() => setSelected(id)} position={[-0.5, -0.5, -0.5]}>
        <Model initialResourceLocation="item/diamond" />
      </group>
    </object3D>
  )
}

export default ItemDisplay
