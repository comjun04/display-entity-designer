import { FC, MutableRefObject, useEffect } from 'react'
import { Group } from 'three'

type DisplayEntityGroupProps = {
  // id: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  objectRef?: MutableRefObject<Group>
}

const DisplayEntityGroup: FC<DisplayEntityGroupProps> = ({
  // id,
  position,
  rotation,
  size,
  objectRef: ref,
}) => {
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
    <group ref={ref as MutableRefObject<Group>}>
      {/* 그룹 안에 들어가야 할 display entity들은 portal을 사용해서 이 안에서 렌더링됨 */}
    </group>
  )
}

export default DisplayEntityGroup
