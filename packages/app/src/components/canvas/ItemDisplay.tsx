import { Grid } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { type FC, type MutableRefObject, memo, useRef } from 'react'
import { Group, MathUtils } from 'three'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useEditorStore } from '@/stores/editorStore'
import { type Number3Tuple, isItemDisplayPlayerHead } from '@/types'

import BoundingBox from './BoundingBox'
import Model from './Model'

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

      {thisEntityIsPlayerHead && headPainterMode && (
        <>
          {/* top */}
          <group position={[0, 0.0001, 0]}>
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>

          {/* bottom */}
          <group
            position={[0, -(0.5 + 0.0001), 0]}
            rotation={[MathUtils.degToRad(180), 0, 0]}
          >
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>

          {/* front (south) */}
          <group
            position={[0, -0.25, -(0.25 + 0.0001)]}
            rotation={[MathUtils.degToRad(-90), 0, 0]}
          >
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>

          {/* back (north) */}
          <group
            position={[0, -0.25, 0.25 + 0.0001]}
            rotation={[MathUtils.degToRad(90), 0, 0]}
          >
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>

          {/* east */}
          <group
            position={[0.25 + 0.0001, -0.25, 0]}
            rotation={[0, 0, MathUtils.degToRad(-90)]}
          >
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>

          {/* west */}
          <group
            position={[-(0.25 + 0.0001), -0.25, 0]}
            rotation={[0, 0, MathUtils.degToRad(90)]}
          >
            <Grid
              args={[0.5, 0.5]}
              cellSize={0.5 / 8}
              cellThickness={1}
              cellColor="#ffffff"
              sectionSize={0}
            />
            {/* this is for detecting click area */}
            <mesh
              rotation={[MathUtils.degToRad(90), 0, 0]}
              onClick={(evt) => {
                console.log(
                  evt.point,
                  evt.object.worldToLocal(evt.point.clone()),
                )
              }}
            >
              <planeGeometry args={[0.5, 0.5]} />
              <meshBasicMaterial transparent opacity={0} alphaTest={0.01} />
            </mesh>
          </group>
        </>
      )}
    </object3D>
  )
}

export default ItemDisplay
