import { Helper } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect } from 'react'
import { BoxHelper, Group } from 'three'
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

  useEffect(() => {
    ref?.current?.position.set(...position)
  }, [ref, position])
  useEffect(() => {
    ref?.current?.rotation.set(...rotation)
  }, [ref, rotation])
  useEffect(() => {
    ref?.current?.scale.set(...size)
  }, [ref, size])

  return (
    <group ref={ref as MutableRefObject<Group>} onClick={onClick}>
      {thisEntitySelected && <Helper type={BoxHelper} args={['green']} />}
      {/* 그룹 안에 들어가야 할 display entity들은 portal을 사용해서 이 안에서 렌더링됨 */}
    </group>
  )
}

export default DisplayEntityGroup
