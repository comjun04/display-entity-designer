import { Helper } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { FC, MutableRefObject, memo } from 'react'
import { BoxHelper, Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { Number3Tuple } from '@/types'

import Model from './ModelNew'

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
        const thisEntity = state.entities.get(id)

        return {
          thisEntitySelected: state.selectedEntityIds.includes(id),
          thisEntityDisplay:
            thisEntity?.kind === 'item' ? thisEntity.display : undefined,
          selectedEntityIds: state.selectedEntityIds,
        }
      }),
    )

  useFrame(() => {
    if (!thisEntitySelected) {
      ref?.current?.position.set(...position)
      ref?.current?.rotation.set(...rotation)
      ref?.current?.scale.set(...size)
    }
  })

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
