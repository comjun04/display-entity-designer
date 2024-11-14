import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { FC, MutableRefObject, useEffect } from 'react'
import { BoxHelper, Object3D } from 'three'
import { useShallow } from 'zustand/shallow'
import Model from './Model'
import { Helper } from '@react-three/drei'
import { useEditorStore } from '@/stores/editorStore'

type BlockDisplayProps = {
  id: string
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color?: number | string
  object3DRef?: MutableRefObject<Object3D>
}

const BlockDisplay: FC<BlockDisplayProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const {
    thisEntity,
    thisEntitySelected,
    setSelected,
    setBDEntityBlockstates,
  } = useDisplayEntityStore(
    useShallow((state) => ({
      thisEntity: state.entities.find((e) => e.id === id),
      thisEntitySelected: state.selectedEntityIds.includes(id),
      setSelected: state.setSelected,
      setBDEntityBlockstates: state.setBDEntityBlockstates,
    })),
  )
  const { usingTransformControl } = useEditorStore(
    useShallow((state) => ({
      usingTransformControl: state.usingTransformControl,
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

    console.log('trigger')

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

  // useEffect(() => {
  //   if (!thisEntitySelected) {
  //     ref?.current.position.set(...position)
  //   } else if (firstSelectedEntityId === id) {
  //     ref?.current.position.set(0, 0, 0)
  //   } else {
  //     if (thisEntity?.position == null) return

  //     const firstSelectedEntity = useDisplayEntityStore
  //       .getState()
  //       .entities.find((e) => e.id === firstSelectedEntityId)!
  //     const delta = [
  //       thisEntity.position[0] - firstSelectedEntity.position[0],
  //       thisEntity.position[1] - firstSelectedEntity.position[1],
  //       thisEntity.position[2] - firstSelectedEntity.position[2],
  //     ] satisfies [number, number, number]
  //     ref?.current.position.set(...delta)
  //   }
  // }, [
  //   ref,
  //   position,
  //   thisEntity?.position,
  //   thisEntitySelected,
  //   id,
  //   firstSelectedEntityId,
  // ])
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

  if (thisEntity?.kind !== 'block') return null

  return (
    <object3D ref={ref}>
      {thisEntitySelected && <Helper type={BoxHelper} args={['gold']} />}
      <group
        onClick={() => {
          if (!usingTransformControl) {
            setSelected([id])
          }
        }}
      >
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
            <Model
              key={idx}
              initialResourceLocation={modelToApply.model}
              xRotation={modelToApply.x}
              yRotation={modelToApply.y}
            />
          )
        })}
      </group>
    </object3D>
  )
}

export default BlockDisplay
