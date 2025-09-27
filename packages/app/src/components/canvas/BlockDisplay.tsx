import type { ThreeEvent } from '@react-three/fiber'
import { type FC, type MutableRefObject, memo, useEffect } from 'react'
import { Group } from 'three'
import { useShallow } from 'zustand/shallow'

import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import BoundingBox from './BoundingBox'
import Model from './Model'

type BlockDisplayProps = {
  id: string
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color?: number | string
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const MemoizedModel = memo(Model)

const BlockDisplay: FC<BlockDisplayProps> = ({
  id,
  type,
  // size,
  // position,
  // rotation,
  onClick,
  objectRef: ref,
}) => {
  const { thisEntity, thisEntitySelected } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.get(id),
      thisEntitySelected: state.selectedEntityIds.includes(id),
    })),
  )

  // =====

  const { data: blockstatesData } = useBlockStates(type)

  // blockstates 데이터가 변경되었을 경우 현재 block display에 적용되어 있는 값을 확인 후
  // 새 blockstates key 값 목록에 있다면 그대로 두고, 없다면 기본값을 적용
  useEffect(() => {
    if (blockstatesData == null) return

    const thisEntity = useDisplayEntityStore.getState().entities.get(id)
    if (thisEntity?.kind !== 'block') return

    const newBlockstateObject: Record<string, string> = {}
    for (const [
      blockstateKey,
      blockstateValues,
    ] of blockstatesData.blockstates.entries()) {
      const existingValue = thisEntity.blockstates[blockstateKey]
      if (existingValue == null) {
        newBlockstateObject[blockstateKey] = blockstateValues.states.has(
          blockstateValues.default,
        )
          ? blockstateValues.default
          : [...blockstateValues.states.values()][0]
      }
    }

    useDisplayEntityStore
      .getState()
      .setBDEntityBlockstates(id, newBlockstateObject, true)
  }, [blockstatesData, id])

  if (thisEntity?.kind !== 'block') return null

  return (
    <group ref={ref}>
      <BoundingBox
        object={ref?.current}
        visible={thisEntitySelected}
        color="gold"
      />

      <group name="base2" onClick={onClick}>
        {(blockstatesData?.models ?? []).map((model, idx) => {
          let shouldRender = model.when.length < 1 // when 배열 안에 조건이 정의되어 있지 않다면 무조건 렌더링
          for (const conditionObject of model.when) {
            let andConditionCheckSuccess = true
            for (const conditionKey in conditionObject) {
              if (
                thisEntity.blockstates[conditionKey] == null ||
                !conditionObject[conditionKey].includes(
                  thisEntity.blockstates[conditionKey],
                )
              ) {
                andConditionCheckSuccess = false
                break
              }
            }

            if (andConditionCheckSuccess) {
              shouldRender = true
              break
            }
          }

          if (!shouldRender) return null

          // apply가 여러 개 있는 경우(랜덤), 맨 처음 것만 고정으로 사용
          const modelToApply = model.apply[0]
          return (
            <MemoizedModel
              key={idx}
              initialResourceLocation={modelToApply.model}
              xRotation={modelToApply.x}
              yRotation={modelToApply.y}
            />
          )
        })}
      </group>
    </group>
  )
}

export default BlockDisplay
