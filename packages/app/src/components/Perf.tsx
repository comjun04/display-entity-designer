import { invalidate, useFrame } from '@react-three/fiber'
import { Perf as R3FPerf } from 'r3f-perf'
import { FC, useRef } from 'react'

const Perf: FC = () => {
  const count = useRef(0)

  // r3f-perf가 초기화될 때 렌더링중이 아닐 경우 정상적으로 초기화되지 않으므로
  // 초기화되는 동안만 연속으로 렌더링시키기
  useFrame(() => {
    if (count.current < 30) {
      invalidate()
      count.current++
    }
  })

  return <R3FPerf position="bottom-left" style={{ zIndex: 10 }} />
}

export default Perf
