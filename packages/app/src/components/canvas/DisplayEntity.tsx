import { FC, MutableRefObject } from 'react'
import { Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'

import BlockDisplay from './BlockDisplay'
import ItemDisplay from './ItemDisplay'

type DisplayEntityProps = {
  id: string
}

const DisplayEntity: FC<DisplayEntityProps> = ({ id }) => {
  const { thisEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.findEntity(id),
    })),
  )

  const { thisEntityRef } = useEntityRefStore(
    useShallow((state) => ({
      thisEntityRef: state.entityRefs.find((e) => e.id === id),
    })),
  )

  if (thisEntity == null) return null

  if (thisEntity.kind === 'block') {
    return (
      <BlockDisplay
        id={id}
        type={thisEntity.type}
        position={thisEntity.position}
        rotation={thisEntity.rotation}
        size={thisEntity.size}
        object3DRef={thisEntityRef?.objectRef}
      />
    )
  } else if (thisEntity.kind === 'item') {
    return (
      <ItemDisplay
        id={id}
        type={thisEntity.type}
        position={thisEntity.position}
        rotation={thisEntity.rotation}
        size={thisEntity.size}
        object3DRef={thisEntityRef?.objectRef}
      />
    )
  } else if (thisEntity.kind === 'group') {
    return (
      <group ref={thisEntityRef?.objectRef as MutableRefObject<Group>}>
        {thisEntity.children.map((entity) => {
          console.log('aa', entity)
          return <DisplayEntity key={entity.id} id={entity.id} />
        })}
      </group>
    )
  }

  return null
}

export default DisplayEntity
