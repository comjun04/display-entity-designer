import useBlockStates from '@/hooks/useBlockStates'
import { useDisplayEntityStore } from '@/store'
import { FC, Ref, useEffect, useMemo, useState } from 'react'
import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  MeshStandardMaterial,
  Object3D,
} from 'three'
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
  color = 0x888888,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const { selectedEntity, setSelected } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntity: state.getSelectedEntity(),
      setSelected: state.setSelected,
    })),
  )

  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), [])
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
      }),
    [color],
  )

  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry), [geometry])
  const lineMaterial = useMemo(
    () => new LineBasicMaterial({ color: 'gold' }),
    [],
  )

  // =====

  const { data: blockstatesData, isLoading: isBlockstatesLoading } =
    useBlockStates(type)
  console.log(blockstatesData, isBlockstatesLoading)

  const [blockstates, setBlockstates] = useState<Record<string, string>>({})

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

    setBlockstates(newBlockstateObject)
  }, [blockstatesData])

  return (
    <object3D position={position} ref={ref} scale={size} rotation={rotation}>
      <mesh
        geometry={geometry}
        material={material}
        position={[0.5, 0.5, 0.5]} // 왼쪽 아래 점이 기준점이 되도록 geometry 각 축 변 길이의 반만큼 이동
        onClick={() => setSelected(id)}
      />

      <lineSegments
        visible={selectedEntity?.id === id}
        geometry={edgesGeometry}
        material={lineMaterial}
        position={[0.5, 0.5, 0.5]}
      />

      {(blockstatesData?.models ?? []).map((model, idx) => {
        let shouldRender = false
        for (const conditionObject of model.when) {
          let andConditionCheckSuccess = true
          for (const conditionKey in conditionObject) {
            if (
              !conditionObject[conditionKey].includes(blockstates[conditionKey])
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

        return <Model key={idx} initialResourceLocation={model.apply.model} />
      })}
    </object3D>
  )
}

export default Box
