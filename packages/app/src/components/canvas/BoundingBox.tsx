import { useFrame } from '@react-three/fiber'
import { FC, useRef } from 'react'
import { BoxHelper, ColorRepresentation, Matrix4, Object3D } from 'three'

const dummyObject = new Object3D()

type BoundingBoxProps = {
  object?: Object3D
  visible: boolean
  color?: ColorRepresentation
}

const BoundingBox: FC<BoundingBoxProps> = ({ object, visible, color }) => {
  const boxHelperRef = useRef<BoxHelper>(null)

  useFrame(() => {
    if (object == null || boxHelperRef.current == null) return
    if (!visible) return

    // BoxHelper가 object의 transformation이 초기 상태일 때만 위치와 크기를 제대로 계산하는 것으로 보임
    // 따라서 BoxHelper 생성 전에 초기 상태로 만든 다음 생성하고 나서 되돌리기
    const m = object.matrix.clone()
    const freshMatrix = new Matrix4()
    freshMatrix.decompose(object.position, object.quaternion, object.scale)

    boxHelperRef.current.setFromObject(object)

    m.decompose(object.position, object.quaternion, object.scale)
    object.updateMatrix()

    // Prevent the helpers from blocking rays
    boxHelperRef.current.traverse((child) => (child.raycast = () => null))

    object.add(boxHelperRef.current)
  })

  return (
    <boxHelper
      args={[dummyObject, color]}
      visible={visible}
      ref={boxHelperRef}
    />
  )
}

export default BoundingBox
