import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { Helper } from '@react-three/drei'
import { FC, RefObject, useEffect } from 'react'
import { BoxHelper, Group } from 'three'
import { useShallow } from 'zustand/shallow'

type SelectedEntityGroupProps = {
  groupRef: RefObject<Group>
}

const SelectedEntityGroup: FC<SelectedEntityGroupProps> = ({ groupRef }) => {
  const { selectedEntityIds } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
    })),
  )
  const { selectionBaseTransformation } = useEditorStore(
    useShallow((state) => ({
      selectionBaseTransformation: state.selectionBaseTransformation,
    })),
  )
  const { setSelectedEntityGroupRef } = useEntityRefStore(
    useShallow((state) => ({
      setSelectedEntityGroupRef: state.setSelectedEntityGroupRef,
    })),
  )

  useEffect(() => {
    setSelectedEntityGroupRef(groupRef)
  }, [groupRef, setSelectedEntityGroupRef])

  useEffect(() => {
    if (groupRef.current == null) return

    // console.log('sans', selectionBaseTransformation.size)

    groupRef.current.position.fromArray(selectionBaseTransformation.position)
    groupRef.current.rotation.fromArray(selectionBaseTransformation.rotation)
    groupRef.current.scale.fromArray(selectionBaseTransformation.size)
  }, [groupRef, selectionBaseTransformation])

  return (
    <group ref={groupRef}>
      {selectedEntityIds.length > 1 && (
        <Helper type={BoxHelper} args={['white']} />
      )}
    </group>
  )
}

export default SelectedEntityGroup
