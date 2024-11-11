import { useDisplayEntityStore } from '@/store'
import { FC, Ref } from 'react'
import { BoxHelper, Object3D } from 'three'
import { useShallow } from 'zustand/shallow'
import Model from './Model'
import { Helper } from '@react-three/drei'

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
  const { thisEntity, selectedEntity, setSelected } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.find((e) => e.id === id),
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
    })),
  )

  return (
    <object3D position={position} scale={size} rotation={rotation} ref={ref}>
      {selectedEntity?.id === id && <Helper type={BoxHelper} args={['gold']} />}

      <group onClick={() => setSelected(id)}>
        <Model
          initialResourceLocation={`item/${type}`}
          displayType={thisEntity?.display ?? undefined}
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
