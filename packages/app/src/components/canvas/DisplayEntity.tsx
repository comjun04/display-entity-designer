import { FC, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'

import BlockDisplay from './BlockDisplay'
import DisplayEntityGroup from './DisplayEntityGroup'
import ItemDisplay from './ItemDisplay'

type DisplayEntityProps = {
  id: string
}

const DisplayEntity: FC<DisplayEntityProps> = ({ id }) => {
  const { thisEntity, deleteEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.find((e) => e.id === id),
      deleteEntity: state.deleteEntity,
    })),
  )

  const { thisEntityRef, parentGroupRefData } = useEntityRefStore(
    useShallow((state) => {
      // parent 값이 있다면
      const parentGroupRefData =
        thisEntity?.parent != null
          ? state.entityRefs.find((e) => e.id === thisEntity.parent)
          : state.rootGroupRefData

      return {
        thisEntityRef: state.entityRefs.find((e) => e.id === id),
        parentGroupRefData:
          parentGroupRefData?.refAvailable === true &&
          parentGroupRefData.objectRef != null
            ? parentGroupRefData
            : state.rootGroupRefData,
      }
    }),
  )

  // thisEntity.parent 값이 바뀌면 reparenting 진행
  useEffect(() => {
    if (!thisEntityRef?.refAvailable) return

    parentGroupRefData.objectRef.current.add(thisEntityRef.objectRef.current)
  }, [thisEntityRef, parentGroupRefData.objectRef, thisEntity?.parent])

  // 내가 group 안에 children이 더 이상 없으면 나 자신도 삭제
  useEffect(() => {
    if (thisEntity?.kind === 'group' && thisEntity.children.length < 1) {
      deleteEntity(id)
    }
  }, [id, thisEntity, deleteEntity])

  if (thisEntity == null) return null

  if (thisEntity.kind === 'block') {
    return (
      <BlockDisplay
        id={id}
        type={thisEntity.type}
        position={thisEntity.position}
        rotation={thisEntity.rotation}
        size={thisEntity.size}
        objectRef={thisEntityRef?.objectRef}
        parentGroupRef={parentGroupRefData.objectRef}
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
        objectRef={thisEntityRef?.objectRef}
      />
    )
  } else if (thisEntity.kind === 'group') {
    return (
      <DisplayEntityGroup
        position={thisEntity.position}
        rotation={thisEntity.rotation}
        size={thisEntity.size}
        objectRef={thisEntityRef?.objectRef}
      />
    )
  }

  return null
}

export default DisplayEntity
