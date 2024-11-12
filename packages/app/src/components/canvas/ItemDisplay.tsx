import { useDisplayEntityStore } from '@/stores/displayEntityStore'
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
  const { thisEntityDisplay, selectedEntityId, setSelected } =
    useDisplayEntityStore(
      useShallow((state) => {
        const thisEntity = state.entities.find((e) => e.id === id)

        return {
          thisEntityDisplay: thisEntity?.display,
          selectedEntityId: state.selectedEntityId,
          setSelected: state.setSelected,
        }
      }),
    )

  return (
    <object3D position={position} scale={size} rotation={rotation} ref={ref}>
      {selectedEntityId === id && <Helper type={BoxHelper} args={['gold']} />}

      <group onClick={() => setSelected(id)}>
        <Model
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
