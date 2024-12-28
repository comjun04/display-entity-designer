import { FC, MutableRefObject, useEffect } from 'react'
import { Group, Object3D } from 'three'

import { DisplayEntity } from '@/types'

import DisplayEntityImpl from './DisplayEntity'

type DisplayEntityGroupProps = {
  // id: string
  size: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  children: DisplayEntity[]
  object3DRef?: MutableRefObject<Object3D>
}

const DisplayEntityGroup: FC<DisplayEntityGroupProps> = ({
  // id,
  position,
  rotation,
  size,
  children,
  object3DRef: ref,
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
      {children.map((entity) => (
        <DisplayEntityImpl key={entity.id} id={entity.id} />
      ))}
    </group>
  )
}

export default DisplayEntityGroup
