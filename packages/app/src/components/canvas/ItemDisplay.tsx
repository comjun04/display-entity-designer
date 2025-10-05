import type { ThreeEvent } from '@react-three/fiber'
import { type FC, type MutableRefObject, memo, useRef } from 'react'
import { Group } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { type Number3Tuple, isItemDisplayPlayerHead } from '@/types'

import BoundingBox from './BoundingBox'
import Model from './Model'
import PlayerHeadPainter from './PlayerHeadPainter'

type ItemDisplayProps = {
  id: string
  type: string
  size: Number3Tuple
  position: Number3Tuple
  rotation: Number3Tuple
  onClick?: (event: ThreeEvent<MouseEvent>) => void
  objectRef?: MutableRefObject<Group>
}

const MemoizedModel = memo(Model)

const ItemDisplay: FC<ItemDisplayProps> = ({
  id,
  type,
  // size,
  // position,
  // rotation,
  onClick,
  objectRef: ref,
}) => {
  const {
    thisEntitySelected,
    thisEntityDisplay,
    thisEntityIsPlayerHead,
    thisEntityPlayerHeadProperties,
  } = useDisplayEntityStore(
    useShallow((state) => {
      const thisEntity = state.entities.get(id)

      return {
        thisEntitySelected: state.selectedEntityIds.includes(id),
        thisEntityDisplay:
          thisEntity?.kind === 'item' ? thisEntity.display : undefined,
        thisEntityIsPlayerHead:
          thisEntity != null && isItemDisplayPlayerHead(thisEntity),
        thisEntityPlayerHeadProperties:
          thisEntity != null && isItemDisplayPlayerHead(thisEntity)
            ? thisEntity.playerHeadProperties
            : undefined,
      }
    }),
  )
  const headPainterMode = useEditorStore((state) => state.headPainterMode)

  const boundingBoxTargetRef = useRef<Group>(null)

  return (
    <object3D ref={ref}>
      {/* {thisEntitySelected && <Helper type={BoxHelper} args={['gold']} />} */}
      <BoundingBox
        object={boundingBoxTargetRef.current ?? undefined}
        visible={thisEntitySelected}
        color="#06b6d4" // tailwind v3 cyan-500
      />

      <group onClick={onClick} ref={boundingBoxTargetRef}>
        <MemoizedModel
          initialResourceLocation={`item/${type}`}
          displayType={thisEntityDisplay ?? undefined}
          playerHeadTextureData={
            thisEntityPlayerHeadProperties?.texture ?? undefined
          }
        />
      </group>

      {thisEntityIsPlayerHead &&
        thisEntityPlayerHeadProperties != null &&
        headPainterMode && (
          <PlayerHeadPainter
            entityId={id}
            playerHeadProperties={thisEntityPlayerHeadProperties}
          />
        )}
    </object3D>
  )
}

export default ItemDisplay
