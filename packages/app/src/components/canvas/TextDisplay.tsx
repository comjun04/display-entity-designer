import { ThreeEvent, invalidate, useFrame } from '@react-three/fiber'
import { FC, MutableRefObject, useEffect, useRef } from 'react'
import { Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { createTextMesh } from '@/services/resources/textMesh'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { Number3Tuple } from '@/types'

import BoundingBox from './BoundingBox'

type TextDisplayProps = {
  id: string
  text: string
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const TextDisplay: FC<TextDisplayProps> = ({
  id,
  text,
  position,
  rotation,
  size,
  objectRef: ref,
  onClick,
}) => {
  const {
    thisEntityLineLength,
    thisEntityBackgroundColor,
    thisEntitySelected,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const thisEntity = state.entities.get(id)
      return {
        thisEntityLineLength:
          thisEntity?.kind === 'text' ? thisEntity.lineLength : undefined,
        thisEntityBackgroundColor:
          thisEntity?.kind === 'text' ? thisEntity.backgroundColor : undefined,
        thisEntitySelected: state.selectedEntityIds.includes(id),
      }
    }),
  )
  const forceUnifont = useEditorStore(
    (state) => state.settings.general.forceUnifont,
  )

  const innerGroupRef = useRef<Group>(null)
  const textModelGroupRef = useRef<Group>()

  useEffect(() => {
    const asyncFn = async () => {
      if (
        innerGroupRef.current == null ||
        thisEntityLineLength == null ||
        thisEntityBackgroundColor == null
      ) {
        return
      }

      const textModelGroup = await createTextMesh({
        text,
        font: forceUnifont ? 'uniform' : 'default',
        lineLength: thisEntityLineLength,
        backgroundColor: thisEntityBackgroundColor,
        color: '#dddddd',
      })

      if (textModelGroupRef.current != null) {
        innerGroupRef.current.remove(textModelGroupRef.current)
      }
      innerGroupRef.current.add(textModelGroup)
      textModelGroupRef.current = textModelGroup

      invalidate()
    }

    asyncFn().catch(console.error)
  }, [id, text, thisEntityLineLength, thisEntityBackgroundColor, forceUnifont])

  useFrame(() => {
    if (!thisEntitySelected) {
      ref?.current?.position.set(...position)
      ref?.current?.rotation.set(...rotation)
      ref?.current?.scale.set(...size)
    }
  })

  return (
    <object3D ref={ref}>
      <BoundingBox
        object={ref?.current}
        visible={thisEntitySelected}
        color="#fb2c36"
      />

      <group onClick={onClick} ref={innerGroupRef} />
    </object3D>
  )
}

export default TextDisplay
