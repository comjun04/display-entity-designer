import { ThreeEvent } from '@react-three/fiber'
import { FC, useCallback, useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { useEntityRefStore } from '@/stores/entityRefStore'

import BlockDisplay from './BlockDisplay'
import DisplayEntityGroup from './DisplayEntityGroup'
import ItemDisplay from './ItemDisplay'

type DisplayEntityProps = {
  id: string
}

const DisplayEntity: FC<DisplayEntityProps> = ({ id }) => {
  const { thisEntity } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.get(id),
    })),
  )

  const { thisEntityRef, parentGroupRefData } = useEntityRefStore(
    useShallow((state) => {
      // parent 값이 있다면
      const parentGroupRefData =
        thisEntity?.parent != null
          ? state.entityRefs.get(thisEntity.parent)
          : state.rootGroupRefData

      if (
        thisEntity?.parent != null &&
        !state.entityRefs.has(thisEntity.parent)
      ) {
        console.warn(
          'thisEntity.parent is not null, but parent entity ref is null',
        )
      }

      return {
        thisEntityRef: state.entityRefs.get(id),
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
      useDisplayEntityStore.getState().deleteEntities([id])
    }
  }, [id, thisEntity])

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (thisEntity == null) return

      const { usingTransformControl } = useEditorStore.getState()
      if (usingTransformControl) return

      const { selectedEntityIds, setSelected } =
        useDisplayEntityStore.getState()

      if (thisEntity.kind !== 'group') {
        // group이 아닌 경우 최상단에 있거나, 다른 그룹둘에 둘러싸여 트리 최하단에 있음.
        if (
          thisEntity.parent == null ||
          (selectedEntityIds.length === 1 &&
            selectedEntityIds.includes(thisEntity.parent))
        ) {
          setSelected([id])
          // 현재 엔티티/그룹의 부모 + 화면상에 여러 그룹이나 엔티티가 겹쳐 있을때 클릭한 경우 자기보다 멀리 떨어져 있는 엔티티한테도 이벤트 전달하는걸 방지함.
          // 이렇게 해야 클릭한 시점에서 화면에 완전히 보이는 엔티티만 처리하게 만들 수 있고
          // 부모 엔티티가 자신이 선택되어야 하는 시점으로 오해해 이상하게 엔티티가 선택되는 것을 방지할 수 있음
          // https://r3f.docs.pmnd.rs/api/events#event-propagation-(bubbling)
          event.stopPropagation()
        }
      } else {
        // 다중선택되어 있거나 아무것도 선택되어 있지 않은 경우, 이 그룹이 최상단에 있디만 선택함
        if (selectedEntityIds.length !== 1 && thisEntity.parent == null) {
          setSelected([id])
          event.stopPropagation()
        } else if (selectedEntityIds.length === 1) {
          // 1개만 선택되어 있는 경우
          // 그룹 안의 엔티티가 선택된 경우일 수 있으므로 순서를 체크해야 함
          if (
            thisEntity.parent != null &&
            selectedEntityIds.includes(thisEntity.parent)
          ) {
            // 내가 최상단이 아니고 부모가 선택되어 있는 상태일 경우 내가 선택될 차례이므로 선택 처리
            // (내 부모 엔티티 그룹) -> (나)
            setSelected([id])
            event.stopPropagation()
          } else if (thisEntity.parent == null) {
            // 내가 최상단일 경우
            // 내 자식으로 등록된 엔티티들은 나까지 오기 전에 이미 처리되고 이벤트 전파되지 않음
            // 자식 중 제일 최하단에 등록된 엔티티거나, 다른 그룹에 있는 엔티티/그룹이거나일 경우에만 여기까지 실행되므로
            // 선택 처리
            setSelected([id])
          }
        }
      }

      if (thisEntity.parent == null) {
        event.stopPropagation()
      }
    },
    [thisEntity, id],
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
        onClick={handleClick}
        objectRef={thisEntityRef?.objectRef}
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
        onClick={handleClick}
        objectRef={thisEntityRef?.objectRef}
      />
    )
  } else if (thisEntity.kind === 'group') {
    return (
      <DisplayEntityGroup
        id={id}
        position={thisEntity.position}
        rotation={thisEntity.rotation}
        size={thisEntity.size}
        onClick={handleClick}
        objectRef={thisEntityRef?.objectRef}
      />
    )
  }

  return null
}

export default DisplayEntity
