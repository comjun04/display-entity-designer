import { Instance, Instances } from '@react-three/drei'
import { invalidate, useFrame } from '@react-three/fiber'
import { type FC, useEffect, useRef, useState } from 'react'
import { type BufferGeometry, Group, Material, Matrix4, Vector3 } from 'three'

import useEntityRefObject from '@/hooks/useEntityRefObject'
import useModelData from '@/hooks/useModelData'
import { getLogger } from '@/lib/logger'
import { generateModelMeshIngredients } from '@/lib/resources/modelMesh'
import { stripMinecraftPrefix } from '@/lib/utils'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useInstancedMeshStore } from '@/stores/instancedMeshStore'

interface InstancedEntityProps {
  id: string
  entityId: string
  xRotation: number
  yRotation: number
}
export const InstancedEntity: FC<InstancedEntityProps> = ({ entityId }) => {
  const entityRef = useEntityRefObject(entityId)

  if (entityRef == null) {
    return
  }

  return <Instance matrix={entityRef.matrixWorld}></Instance>
}

interface InstancedEntityGroupProps {
  id: string
}
const instancedEntityGroupLogger = getLogger('InstancedEntityGroup')
export const InstancedEntityGroup: FC<InstancedEntityGroupProps> = ({ id }) => {
  const groupData = useDisplayEntityStore((state) =>
    state.instancedMeshGroup.get(id),
  )

  const [meshData, setMeshData] = useState<{
    geometry: BufferGeometry
    material: Material[]
  }>()

  const { data: modelDataRoot, loading: modelDataLoading } = useModelData(
    groupData?.modelResourceLocation,
  )

  useEffect(() => {
    if (
      groupData?.modelResourceLocation == null ||
      modelDataRoot == null ||
      modelDataLoading
    ) {
      return
    }

    const { data: modelData, isBlockShapedItemModel } = modelDataRoot
    const isItemModel = stripMinecraftPrefix(
      groupData.modelResourceLocation,
    ).startsWith('item/')

    const fn = async () => {
      const meshIngredients = await generateModelMeshIngredients({
        modelResourceLocation: groupData.modelResourceLocation,
        elements: modelData.elements,
        textures: modelData.textures,
        isItemModel,
        isBlockShapedItemModel,
        playerHeadData: undefined, // TODO: add support for player_head
      }).catch((err) => {
        instancedEntityGroupLogger.error(
          `Failed to load model mesh for ${groupData.modelResourceLocation}`,
        )
        instancedEntityGroupLogger.error(err)
        return
      })
      if (meshIngredients == null) {
        return
      }

      setMeshData({
        geometry: meshIngredients.geometry,
        material: meshIngredients.materials,
      })
    }

    fn().catch(console.error)
  }, [groupData?.modelResourceLocation, modelDataRoot, modelDataLoading])

  // TODO: prepare geometries and materials about this data

  if (groupData == null || meshData == null) return null

  return (
    <Instances geometry={meshData.geometry} material={meshData.material}>
      {groupData.meshes.map(({ id, entityId, xRotation, yRotation }) => (
        <InstancedEntity
          key={id}
          id={id}
          entityId={entityId}
          xRotation={xRotation}
          yRotation={yRotation}
        />
      ))}
    </Instances>
  )
}

// =====

interface InstacedModelProps {
  entityId: string
  modelId: string
  resourceLocation: string
}
export const InstancedModel: FC<InstacedModelProps> = ({
  entityId,
  modelId,
  resourceLocation,
}) => {
  const objectRef = useRef<Group>(null)
  const matrixRef = useRef<Matrix4>(new Matrix4())
  const isProperlyRenderedFirstTime = useRef(false)

  useEffect(() => {
    useInstancedMeshStore
      .getState()
      .allocateInstance(resourceLocation, modelId, entityId)
      .then(() => invalidate())
      .catch(console.error)

    return () => {
      useInstancedMeshStore.getState().freeInstance(resourceLocation, modelId)
    }
  }, [resourceLocation, modelId, entityId])

  useFrame(() => {
    const { batches, setMatrix } = useInstancedMeshStore.getState()

    if (objectRef.current == null) {
      if (!isProperlyRenderedFirstTime.current) {
        invalidate()
      }

      return
    }

    if (!isProperlyRenderedFirstTime.current) {
      // we need to set matrix for the first time... or not?
      setMatrix(resourceLocation, modelId, objectRef.current.matrixWorld)

      const batch = batches.get(resourceLocation)
      if (batch == null) return

      const instanceData = batch.instances.get(modelId)
      if (instanceData == null) return

      // check for matrix are actually applied
      const mat = new Matrix4()
      batch.mesh.getMatrixAt(instanceData.instanceIndex, mat)
      const vec = new Vector3().setFromMatrixScale(mat)
      // scale vector extracted from matrix can be NaN if scale is zero
      if (vec.toArray().every((d) => isNaN(d) || d === 0)) {
        // not yet applied, wait for next frame and do it again
        invalidate()
        return
      } else {
        // ok applied
        matrixRef.current.copy(objectRef.current.matrixWorld)

        isProperlyRenderedFirstTime.current = true
      }
    }

    objectRef.current.updateWorldMatrix(true, false)

    if (!objectRef.current.matrixWorld.equals(matrixRef.current)) {
      matrixRef.current.copy(objectRef.current.matrixWorld)
      setMatrix(resourceLocation, modelId, objectRef.current.matrixWorld)
    }
  })

  return <group ref={objectRef} matrixWorldAutoUpdate />
}
