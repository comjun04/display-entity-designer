import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { FC, RefObject, useEffect, useRef } from 'react'
import { Box3, Box3Helper, Group, Vector3 } from 'three'
import { useShallow } from 'zustand/shallow'

const infinityVector = new Vector3(Infinity, Infinity, Infinity)
const minusInfinityVector = new Vector3(-Infinity, -Infinity, -Infinity)
const dummyBox = new Box3(infinityVector, minusInfinityVector)

type SelectionPivotProps = {
  pivotRef: RefObject<Group>
}

const SelectionPivot: FC<SelectionPivotProps> = ({ pivotRef }) => {
  const { selectedEntityIds } = useDisplayEntityStore(
    useShallow((state) => ({
      selectedEntityIds: state.selectedEntityIds,
    })),
  )

  const helperRef = useRef<Box3Helper>(null)

  useEffect(() => {
    if (helperRef.current == null) return

    const box = helperRef.current.box
    box.set(infinityVector, minusInfinityVector) // 넓이 초기화

    selectedEntityIds.forEach((entityId) => {
      const refData = useEntityRefStore
        .getState()
        .entityRefs.find((d) => d.id === entityId)!
      box.expandByObject(refData.objectRef.current)
    })
  }, [selectedEntityIds])

  return (
    <>
      <group name="pivot" ref={pivotRef} />
      {selectedEntityIds.length > 1 && (
        <box3Helper args={[dummyBox, 'white']} ref={helperRef} />
      )}
    </>
  )
}

export default SelectionPivot
