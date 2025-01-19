import { ThreeEvent, useFrame } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef } from 'react'
import { BoxHelper, Group, Matrix4 } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'

type DisplayEntityGroupProps = {
  id: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const DisplayEntityGroup: FC<DisplayEntityGroupProps> = ({
  id,
  position,
  rotation,
  size,
  onClick,
  objectRef: ref,
}) => {
  const { thisEntitySelected } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntitySelected: state.selectedEntityIds.includes(id),
    })),
  )

  const boxHelper = useRef<BoxHelper>()

  useEffect(() => {
    let currentBoxHelper: BoxHelper | undefined = undefined
    let entityInstance: Group | undefined = undefined

    // 이 그룹 selection이 풀렸다면 boxHelper 제거
    if (!thisEntitySelected) {
      if (boxHelper.current != null) {
        ref?.current.remove(boxHelper.current)
        boxHelper.current.dispose()

        boxHelper.current = undefined
      }

      return
    }

    // boxHelper가 아직 생성되지 않았다면 새로 생성 후 처리
    if (ref?.current != null && boxHelper.current == null) {
      entityInstance = ref.current

      // BoxHelper가 object의 transformation이 초기 상태일 때만 위치와 크기를 제대로 계산하는 것으로 보임
      // 따라서 BoxHelper 생성 전에 초기 상태로 만든 다음 생성하고 나서 되돌리기
      const m = ref.current.matrix.clone()
      const freshMatrix = new Matrix4()
      freshMatrix.decompose(
        ref.current.position,
        ref.current.quaternion,
        ref.current.scale,
      )

      boxHelper.current = new BoxHelper(entityInstance, 'green')
      currentBoxHelper = boxHelper.current

      m.decompose(
        ref.current.position,
        ref.current.quaternion,
        ref.current.scale,
      )
      ref.current.updateMatrix()

      // Prevent the helpers from blocking rays
      currentBoxHelper.traverse((child) => (child.raycast = () => null))
      entityInstance.add(currentBoxHelper)

      // group이 제거될 때 boxHelper 인스턴스도 정리
      return () => {
        entityInstance?.remove(currentBoxHelper!)
        currentBoxHelper?.dispose()

        boxHelper.current = undefined
      }
    }
  }, [ref, thisEntitySelected])

  const entityChildrenCountRef = useRef<number>(0)
  useFrame(() => {
    if (ref?.current == null) return

    // 여러 엔티티들을 group할 때 group이 먼저 만들어지고 나서 각 그룹에서 useEffect로 parent를 변경하기 때문에
    // 그 전에 BoxHelper.update()를 호출할 경우 group의 children이 비어 있으므로 아무것도 그려지지 않음
    // 매 프레임마다 children의 개수를 확인하여 변경 사항이 있으면 그룹이 포함하는 테두리의 크기가 달라질 수 있으므로
    // BoxHelper update 필요

    // 수동으로 update()를 호출할 때에도 transformation 초기 상태에 있어야 제대로 위치와 크기 계산을 하므로
    // 임시로 parent를 빼고 transformation 건드리기
    if (ref.current.children.length !== entityChildrenCountRef.current) {
      const parent = ref.current.parent
      if (parent != null) {
        parent.remove(ref.current)
      }
      const m = ref.current.matrix.clone()
      const freshMatrix = new Matrix4()
      freshMatrix.decompose(
        ref.current.position,
        ref.current.quaternion,
        ref.current.scale,
      )

      boxHelper.current?.update?.()

      m.decompose(
        ref.current.position,
        ref.current.quaternion,
        ref.current.scale,
      )
      ref.current.updateMatrix()
      if (parent != null) {
        parent.add(ref.current)
      }

      entityChildrenCountRef.current = ref.current.children.length
    }
  })

  // entity group이 처음 생겼을 경우 transformation 설정 (id와 ref는 바뀔 일이 거의 없음)
  // 그룹이 생성될 때 자동으로 선택되는데, 이 때문에 아래 useFrame 코드에서 entity의 transformation이 세팅되지 않아 (0, 0, 0)에 있는 문제를 해결결
  useEffect(() => {
    const thisEntity = useDisplayEntityStore.getState().entities.get(id)
    if (thisEntity == null) return

    const { position, rotation, size } = thisEntity

    ref?.current?.position.set(...position)
    ref?.current?.rotation.set(...rotation)
    ref?.current?.scale.set(...size)
  }, [id, ref])

  // 매 프레임 렌더링 시마다 선택되어 있지 않을 경우 transformation 설정
  useFrame(() => {
    if (!thisEntitySelected) {
      ref?.current?.position.set(...position)
      ref?.current?.rotation.set(...rotation)
      ref?.current?.scale.set(...size)
    }
  })

  return (
    <group ref={ref as MutableRefObject<Group>} onClick={onClick}>
      {/* 그룹 안에 들어가야 할 display entity들은 portal을 사용해서 이 안에서 렌더링됨 */}
    </group>
  )
}

export default DisplayEntityGroup
