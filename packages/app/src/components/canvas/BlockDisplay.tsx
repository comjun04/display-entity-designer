import { Helper } from '@react-three/drei'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { FC, MutableRefObject, memo, useEffect } from 'react'
import { BoxHelper, Group } from 'three'
import { useShallow } from 'zustand/shallow'

import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'

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
  size,
  position,
  rotation,
  onClick,
  objectRef: ref,
}) => {
  const { thisEntity, thisEntitySelected, setBDEntityBlockstates } =
    useDisplayEntityStore(
      useShallow((state) => ({
        thisEntity: state.entities.find((e) => e.id === id),
        thisEntitySelected: state.selectedEntityIds.includes(id),
        setBDEntityBlockstates: state.setBDEntityBlockstates,
      })),
    )

  // =====

  const { data: blockstatesData, isLoading: isBlockstatesLoading } =
    useBlockStates(type)
  console.log(
    `Blockstates data for ${type}, isLoading: ${isBlockstatesLoading}`,
    blockstatesData,
  )

  useEffect(() => {
    if (blockstatesData == null) return

    // console.log(
    //   'BlockDisplay: blockstates data changed maybe, resetting blockstates default values',
    // )

    const newBlockstateObject: Record<string, string> = {}
    for (const [
      blockstateKey,
      blockstateValues,
    ] of blockstatesData.blockstates.entries()) {
      newBlockstateObject[blockstateKey] = blockstateValues.states.has(
        blockstateValues.default,
      )
        ? blockstateValues.default
        : [...blockstateValues.states.values()][0]
    }

    setBDEntityBlockstates(id, newBlockstateObject)
  }, [blockstatesData, id, setBDEntityBlockstates])

  useFrame(() => {
    if (!thisEntitySelected) {
      ref?.current?.position.set(...position)
      ref?.current?.rotation.set(...rotation)
      ref?.current?.scale.set(...size)
    }
  })

  if (thisEntity?.kind !== 'block') return null

  return (
    <group ref={ref}>
      {thisEntitySelected && <Helper type={BoxHelper} args={['gold']} />}
      <group onClick={onClick}>
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
