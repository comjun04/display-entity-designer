// Base code is from @react-three/drei `Select` component
// https://github.com/pmndrs/drei/blob/adae93761fa0925c2ee80b30dcb2f903e6d11f3c/src/web/Select.tsx

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEntityRefStore } from '@/stores/entityRefStore'
import { cn } from '@/utils'
import { useThree } from '@react-three/fiber'
import { FC, useEffect, useRef } from 'react'
import { Group, Vector2, Vector3 } from 'three'
import { shallow } from 'zustand/shallow'
import { SelectionBox } from './SelectionBox'

type DragSelectControlProps = {
  selectionBoxClassname?: string
}

const DragSelectControl: FC<DragSelectControlProps> = ({
  selectionBoxClassname,
}) => {
  const { camera, scene, controls, gl, size } = useThree()

  const groupRef = useRef<Group>(null)

  useEffect(() => {
    const selectionBox = new SelectionBox(camera, scene)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const oldControlsEnabled = (controls as any)?.enabled

    let isPointerDown = false

    // JSX 형태로 return하면 r3f element가 아니라는 오류가 발생하므로
    // element를 따로 생성해서 붙이는 방식을 사용
    const element = document.createElement('div')
    element.className = cn(
      'pointer-events-none fixed border-2 border-neutral-500/50 bg-neutral-500/20',
      selectionBoxClassname,
    )

    const startPoint = new Vector2()
    const pointTopLeft = new Vector2()
    const pointBottomRight = new Vector2()

    const prepareRay = (evt: PointerEvent, vec: Vector3) => {
      const { offsetX, offsetY } = evt
      const { width, height } = size
      vec.set((offsetX / width) * 2 - 1, -(offsetY / height) * 2 + 1, 0.5)
    }

    const updateSelectedList = () => {
      const entityRefs = useEntityRefStore.getState().entityRefs
      const allSelectedRefData = selectionBox
        .select()
        .filter(
          (o) =>
            entityRefs.find((d) => d.objectRef.current.id === o.id) != null,
        )
        .map((o) => entityRefs.find((d) => d.objectRef.current.id === o.id)!)
        .sort((a, b) => {
          const aIndex = entityRefs.findIndex((d) => d.id === a.id)
          const bIndex = entityRefs.findIndex((d) => d.id === b.id)
          return aIndex - bIndex
        })

      const { selectedEntityIds, setSelected } =
        useDisplayEntityStore.getState()
      const newSelectedEntityIds = allSelectedRefData.map((d) => d.id)
      if (!shallow(selectedEntityIds, newSelectedEntityIds)) {
        setSelected(newSelectedEntityIds)
      }
    }

    const pointerDown = (evt: PointerEvent) => {
      if (!evt.ctrlKey) return

      isPointerDown = true
      prepareRay(evt, selectionBox.startPoint)
      gl.domElement.parentElement?.appendChild(element)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      if (controls) (controls as any).enabled = false

      startPoint.x = evt.clientX
      startPoint.y = evt.clientY

      element.style.left = `${evt.clientX}px`
      element.style.top = `${evt.clientY}px`
      element.style.width = '0px'
      element.style.height = '0px'
    }
    const pointerUp = (evt: PointerEvent) => {
      if (!isPointerDown) return

      isPointerDown = false
      element.parentElement?.removeChild(element)

      if (controls != null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        ;(controls as any).enabled = oldControlsEnabled
      }

      prepareRay(evt, selectionBox.endPoint)
      updateSelectedList()
    }
    const pointerMove = (evt: PointerEvent) => {
      if (!isPointerDown) return

      pointTopLeft.x = Math.min(evt.clientX, startPoint.x)
      pointTopLeft.y = Math.min(evt.clientY, startPoint.y)
      pointBottomRight.x = Math.max(evt.clientX, startPoint.x)
      pointBottomRight.y = Math.max(evt.clientY, startPoint.y)

      element.style.left = `${pointTopLeft.x}px`
      element.style.top = `${pointTopLeft.y}px`
      element.style.width = `${pointBottomRight.x - pointTopLeft.x}px`
      element.style.height = `${pointBottomRight.y - pointTopLeft.y}px`
    }

    document.addEventListener('pointerdown', pointerDown, { passive: true })
    document.addEventListener('pointermove', pointerMove, { passive: true })
    document.addEventListener('pointerup', pointerUp, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', pointerDown)
      document.removeEventListener('pointermove', pointerMove)
      document.removeEventListener('pointerup', pointerUp)
    }
  }, [camera, controls, gl, scene, selectionBoxClassname, size])

  return <group ref={groupRef} />
}

export default DragSelectControl
