import { Helper } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { FC, MutableRefObject, memo, useEffect } from 'react'
import { BoxHelper, Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { Number3Tuple } from '@/types'

import Model from './Model'

type ItemDisplayProps = {
  id: string
  type: string
  size: Number3Tuple
  position: Number3Tuple
  rotation: Number3Tuple
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const MemoizedModel = memo(Model)

const ItemDisplay: FC<ItemDisplayProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  onClick,
  objectRef: ref,
}) => {
  const { thisEntitySelected, thisEntityDisplay, selectedEntityIds } =
    useDisplayEntityStore(
      useShallow((state) => {
        const thisEntity = state.entities.find((e) => e.id === id)

        return {
          thisEntitySelected: state.selectedEntityIds.includes(id),
          thisEntityDisplay:
            thisEntity?.kind === 'item' ? thisEntity.display : undefined,
          selectedEntityIds: state.selectedEntityIds,
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

      <group onClick={onClick}>
        <MemoizedModel
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
