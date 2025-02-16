import { ThreeEvent } from '@react-three/fiber'
import { FC, MutableRefObject } from 'react'
import { Group } from 'three'

import { Number3Tuple } from '@/types'

type TextDisplayProps = {
  id: string
  type: string
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const TextDisplay: FC<TextDisplayProps> = () => {
  return <></>
}

export default TextDisplay
