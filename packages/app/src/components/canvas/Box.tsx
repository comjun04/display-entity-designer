import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/store'
import { FC, Ref, useEffect, useMemo } from 'react'
import { BoxGeometry, EdgesGeometry, LineBasicMaterial, Object3D } from 'three'
import { useShallow } from 'zustand/shallow'
import Model from './Model'

type BoxProps = {
  id: string
  type: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  color?: number | string
  object3DRef?: Ref<Object3D>
}

const Box: FC<BoxProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const { thisEntity, selectedEntity, setSelected, setEntityBlockstates } =
    useDisplayEntityStore(
      useShallow((state) => ({
        thisEntity: state.entities.find((e) => e.id === id),
        selectedEntity: state.getSelectedEntity(),
        setSelected: state.setSelected,
        setEntityBlockstates: state.setEntityBlockstates,
      })),
    )

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])

  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ color: 'gold' }),
    [],
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
      newBlockstateObject[blockstateKey] = [...blockstateValues.values()][0]
    }

    setEntityBlockstates(id, newBlockstateObject)
  }, [blockstatesData, id, setEntityBlockstates])

  if (thisEntity == null) return null

  return (
    <object3D position={position} ref={ref} scale={size} rotation={rotation}>
      <lineSegments
        visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        position={[0.5, 0.5, 0.5]}
      />

      <group onClick={() => setSelected(id)}>
        {(blockstatesData?.models ?? []).map((model, idx) => {
          let shouldRender = false
          for (const conditionObject of model.when) {
            let andConditionCheckSuccess = true
            for (const conditionKey in conditionObject) {
              if (
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

export default Box
