import { Helper } from '@react-three/drei'
import { FC, MutableRefObject, memo, useEffect } from 'react'
import { BoxHelper, Object3D } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { ItemDisplayEntity, Number3Tuple } from '@/types'

import Model from './Model'

type ItemDisplayProps = {
  id: string
  type: string
  size: Number3Tuple
  position: Number3Tuple
  rotation: Number3Tuple
  object3DRef?: MutableRefObject<Object3D>
}

const MemoizedModel = memo(Model)

const ItemDisplay: FC<ItemDisplayProps> = ({
  id,
  type,
  size,
  position,
  rotation,
  object3DRef: ref,
}) => {
  const {
    thisEntitySelected,
    thisEntityDisplay,
    selectedEntityIds,
    setSelected,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const thisEntity = state.entities.find(
        (e) => e.id === id && e.kind === 'item',
      ) as ItemDisplayEntity | undefined

      return {
        thisEntitySelected: state.selectedEntityIds.includes(id),
        thisEntityDisplay: thisEntity?.display,
        selectedEntityIds: state.selectedEntityIds,
        setSelected: state.setSelected,
      }
    }),
  )
  const { usingTransformControl } = useEditorStore(
    useShallow((state) => ({
      usingTransformControl: state.usingTransformControl,
    })),
  )

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

  return (
    <object3D ref={ref}>
      {selectedEntityIds.includes(id) && (
        <Helper type={BoxHelper} args={['gold']} />
      )}

      <group
        onClick={() => {
          if (!usingTransformControl) {
            setSelected([id])
          }
        }}
      >
        <MemoizedModel
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
        />
      </group>
    </object3D>
  )
}

export default ItemDisplay
