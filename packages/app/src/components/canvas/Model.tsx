import { invalidate } from '@react-three/fiber'
import { type FC, useEffect, useRef, useState } from 'react'
import { Euler, MathUtils, Matrix4, Mesh, Quaternion, Vector3 } from 'three'

import useModelData from '@/hooks/useModelData'
import { getLogger } from '@/services/loggerService'
import { loadModelMesh } from '@/services/resources/modelMesh'
import { useProjectStore } from '@/stores/projectStore'
import type {
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

const OriginVec = new Vector3()
const DisplayTranslationMinVec = new Vector3(-80, -80, -80)
const DisplayTranslationMaxVec = new Vector3(80, 80, 80)
const DisplayScaleMaxVec = new Vector3(4, 4, 4)

const HalfBlockTranslatedMatrix = new Matrix4().makeTranslation(0.5, 0.5, 0.5)
const ReverseHalfBlockTranslatedMatrix = new Matrix4().makeTranslation(
  -0.5,
  -0.5,
  -0.5,
)

const logger = getLogger('Model')

const Model: FC<ModelNewProps> = ({
  initialResourceLocation,
  displayType,
  xRotation = 0,
  yRotation = 0,
  playerHeadTextureData,
}) => {
  const mergedMeshRef = useRef<Mesh>()
  const [meshLoaded, setMeshLoaded] = useState(false)

  const targetGameVersion = useProjectStore((state) => state.targetGameVersion)

  const { data: modelDataTemp, loading: modelDataLoading } = useModelData(
    initialResourceLocation,
  )

  useEffect(() => {
    setMeshLoaded(false)
  }, [targetGameVersion])

  useEffect(() => {
    setMeshLoaded(false)
  }, [playerHeadTextureData])

  useEffect(() => {
    if (modelDataTemp == null || modelDataLoading) return
    if (meshLoaded) return

    const { data: modelData, isBlockShapedItemModel } = modelDataTemp
    const isItemModel = stripMinecraftPrefix(
      initialResourceLocation,
    ).startsWith('item/')

    const fn = async () => {
      setMeshLoaded(false)

      const loadedMesh = await loadModelMesh({
        modelResourceLocation: initialResourceLocation,
        elements: modelData.elements,
        textures: modelData.textures,
        isItemModel,
        isBlockShapedItemModel,
        playerHeadTextureData,
      })

      if (loadedMesh == null) {
        logger.error(`Failed to load model mesh for ${initialResourceLocation}`)
        return
      }

      if (mergedMeshRef.current != null) {
        mergedMeshRef.current.geometry.dispose()
      }
      mergedMeshRef.current = loadedMesh
      setMeshLoaded(true)
    }

    fn().catch(logger.error)

    return () => {
      mergedMeshRef.current?.geometry.dispose()
    }
  }, [
    initialResourceLocation,
    modelDataTemp,
    modelDataLoading,
    meshLoaded,
    playerHeadTextureData,
  ])

  useEffect(() => {
    const loadedMesh = mergedMeshRef.current
    if (loadedMesh == null) return

    if (modelDataTemp == null) return
    const { data: modelData } = modelDataTemp

    // display info
    const { display } = modelData
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

    loadedMesh.matrixAutoUpdate = false
    loadedMesh.matrix
      .makeTranslation(displayTranslation) // set display translation first
      .premultiply(
        // set display rotation and scale
        new Matrix4().compose(
          OriginVec,
          new Quaternion().setFromEuler(new Euler(...displayRotation)),
          displayScale,
        ),
      )
      .premultiply(ReverseHalfBlockTranslatedMatrix)
      .premultiply(
        // set x rotation
        new Matrix4().makeRotationFromQuaternion(
          new Quaternion().setFromEuler(
            new Euler(MathUtils.degToRad(-xRotation), 0, 0),
          ),
        ),
      )
      .premultiply(
        // set y rotation
        new Matrix4().makeRotationFromQuaternion(
          new Quaternion().setFromEuler(
            new Euler(0, MathUtils.degToRad(-yRotation), 0),
          ),
        ),
      )
      .premultiply(HalfBlockTranslatedMatrix)
    loadedMesh.matrix.decompose(
      loadedMesh.position,
      loadedMesh.quaternion,
      loadedMesh.scale,
    )

    invalidate()
  }, [meshLoaded, modelDataTemp, displayType, xRotation, yRotation])

  useEffect(() => {
    if (meshLoaded) {
      invalidate()
    }
    invalidate()
  }, [meshLoaded])

  // ==========

  if (modelDataTemp == null) {
    return null
  }

  const { data: modelData } = modelDataTemp
  const { elements } = modelData

  // elements가 없을 경우 렌더링할 것이 없으므로 그냥 null을 리턴
  if (elements == null || elements.length < 1) {
    return null
  }

  if (!meshLoaded) return null

  return <primitive object={mergedMeshRef.current!} />
}

export default Model
