import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { FC, memo, MutableRefObject, useEffect } from 'react'
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
  object3DRef?: MutableRefObject<Object3D>
}

const MemoizedModel = memo(Model)

const ItemDisplay: FC<ItemDisplayProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const {
    thisEntitySelected,
    thisEntityDisplay,
    selectedEntityIds,
    addToSelected,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const thisEntity = state.entities.find((e) => e.id === id)

      return {
        thisEntitySelected: state.selectedEntityIds.includes(id),
        thisEntityDisplay: thisEntity?.display,
        selectedEntityIds: state.selectedEntityIds,
        addToSelected: state.addToSelected,
      }
    }),
  )

  useEffect(() => {
    if (!thisEntitySelected) {
      ref?.current.position.set(...position)
    }
  }, [ref, position, thisEntitySelected])
  useEffect(() => {
    if (!thisEntitySelected) {
      ref?.current.rotation.set(...rotation)
    }
  }, [ref, rotation, thisEntitySelected])
  useEffect(() => {
    if (!thisEntitySelected) {
      ref?.current.scale.set(...size)
    }
  }, [ref, size, thisEntitySelected])

  return (
    <object3D ref={ref}>
      {selectedEntityIds.includes(id) && (
        <Helper type={BoxHelper} args={['gold']} />
      )}

        <MemoizedModel
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
