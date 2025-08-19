import { invalidate } from '@react-three/fiber'
import { FC, useEffect, useRef, useState } from 'react'
import { Group, MathUtils, Mesh, Vector3 } from 'three'
import { useShallow } from 'zustand/shallow'

import { getLogger } from '@/services/loggerService'
import { loadModelMesh } from '@/services/resources/modelMesh'
import { useCacheStore } from '@/stores/cacheStore'
import {
  ModelDisplayPositionKey,
  Number3Tuple,
  PlayerHeadProperties,
} from '@/types'
import { stripMinecraftPrefix } from '@/utils'

type ModelNewProps = {
  initialResourceLocation: string
  displayType?: ModelDisplayPositionKey
  xRotation?: number
  yRotation?: number
  playerHeadTextureData?: NonNullable<PlayerHeadProperties['texture']>
}

const DisplayTranslationMinVec = new Vector3(-80, -80, -80)
const DisplayTranslationMaxVec = new Vector3(80, 80, 80)
const DisplayScaleMaxVec = new Vector3(4, 4, 4)

const logger = getLogger('Model')

const ModelNew: FC<ModelNewProps> = ({
  initialResourceLocation,
  displayType,
  xRotation = 0,
  yRotation = 0,
  playerHeadTextureData,
}) => {
  const groupRef = useRef<Group>(null)
  const mergedMeshRef = useRef<Mesh>()
  const [meshLoaded, setMeshLoaded] = useState(false)

  const { modelData: modelDataTemp, modelDataLoading } = useCacheStore(
    useShallow((state) => ({
      modelData: state.modelData[initialResourceLocation],
      modelDataLoading: state.modelDataLoading.has(initialResourceLocation),
    })),
  )

  const isItemModel = stripMinecraftPrefix(initialResourceLocation).startsWith(
    'item/',
  )

  useEffect(() => {
    if (modelDataTemp != null) return

    const { modelDataLoading: latestModelDataLoading, loadModelData } =
      useCacheStore.getState()

    if (latestModelDataLoading.has(initialResourceLocation)) return

    loadModelData(initialResourceLocation)
  }, [initialResourceLocation, modelDataTemp, modelDataLoading])

  useEffect(() => {
    setMeshLoaded(false)
  }, [playerHeadTextureData])

  useEffect(() => {
    if (modelDataTemp == null) return
    if (meshLoaded) return

    const { data: modelData, isBlockShapedItemModel } = modelDataTemp

    const fn = async () => {
      const loadResult = await loadModelMesh({
        modelResourceLocation: initialResourceLocation,
        elements: modelData.elements,
        textures: modelData.textures,
        textureSize: modelData.textureSize,
        isItemModel,
        isBlockShapedItemModel,
        playerHeadTextureData,
      })

      if (loadResult == null) {
        logger.error(`Failed to load model mesh for ${initialResourceLocation}`)
        return
      }

      if (mergedMeshRef.current != null) {
        mergedMeshRef.current.geometry.dispose()
      }
      mergedMeshRef.current = loadResult
      setMeshLoaded(true)
    }

    fn().catch(logger.error)

    return () => {
      mergedMeshRef.current?.geometry.dispose()
    }
  }, [
    initialResourceLocation,
    modelDataTemp,
    meshLoaded,
    isItemModel,
    playerHeadTextureData,
  ])

  useEffect(() => {
    if (mergedMeshRef.current == null) return

    if (meshLoaded) {
      groupRef.current?.add(mergedMeshRef.current)
    } else {
      groupRef.current?.remove(mergedMeshRef.current)
    }
    invalidate()
  }, [meshLoaded])

  // ==========

  if (modelDataTemp == null) {
    return null
  }

  const { data: modelData } = modelDataTemp

  const { display, elements } = modelData

  // elements가 없을 경우 렌더링할 것이 없으므로 그냥 null을 리턴
  if (elements == null || elements.length < 1) {
    return null
  }

  // display info

  const displayInfo = displayType != null ? (display[displayType] ?? {}) : {}
  const displayRotation = (displayInfo.rotation ?? [0, 0, 0]).map((d) =>
    MathUtils.degToRad(d),
  ) as Number3Tuple
  const displayTranslation = new Vector3(
    ...(displayInfo.translation ?? [0, 0, 0]),
  )
    .max(DisplayTranslationMinVec)
    .min(DisplayTranslationMaxVec)
    .divideScalar(16)
  const displayScale = new Vector3(...(displayInfo.scale ?? [1, 1, 1])).min(
    DisplayScaleMaxVec,
  )

  return (
    // set y rotation
    <group
      rotation={[0, MathUtils.degToRad(-yRotation), 0]}
      position={[0.5, 0.5, 0.5]}
    >
      <group position={[-0.5, -0.5, -0.5]}>
        {/* set x rotation */}
        <group
          rotation={[MathUtils.degToRad(-xRotation), 0, 0]}
          position={[0.5, 0.5, 0.5]}
        >
          <group position={[-0.5, -0.5, -0.5]}>
            {/* set display translation, rotation and scale */}
            <group rotation={displayRotation} scale={displayScale}>
              <group position={displayTranslation} ref={groupRef}>
                {/* ref로 직접 mesh 추가 */}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}

export default ModelNew
