import { ThreeEvent, useFrame } from '@react-three/fiber'
import { FC, MutableRefObject, memo } from 'react'
import { Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { Number3Tuple, isItemDisplayPlayerHead } from '@/types'

import BoundingBox from './BoundingBox'
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
  const {
    thisEntitySelected,
    thisEntityDisplay,
    thisEntityPlayerHeadProperties,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const thisEntity = state.entities.get(id)

      return {
        thisEntitySelected: state.selectedEntityIds.includes(id),
        thisEntityDisplay:
          thisEntity?.kind === 'item' ? thisEntity.display : undefined,
        thisEntityPlayerHeadProperties:
          thisEntity != null && isItemDisplayPlayerHead(thisEntity)
            ? thisEntity.playerHeadProperties
            : undefined,
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
      {/* {thisEntitySelected && <Helper type={BoxHelper} args={['gold']} />} */}
      <BoundingBox
        object={ref?.current}
        visible={thisEntitySelected}
        color="#06b6d4" // tailwind v3 cyan-500
      />

      <group onClick={onClick}>
        <MemoizedModel
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
          playerHeadTextureData={
            thisEntityPlayerHeadProperties?.texture ?? undefined
          }
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
