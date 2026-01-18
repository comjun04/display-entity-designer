import { Instance, Instances } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type FC, useEffect, useRef, useState } from 'react'
import { type BufferGeometry, Group, Material } from 'three'

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

  console.log(groupData)

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
  modelId: string
  resourceLocation: string
}
export const InstancedModel: FC<InstacedModelProps> = ({
  modelId,
  resourceLocation,
}) => {
  const [instanceId, setInstanceId] = useState<number>()
  const objectRef = useRef<Group>(null)

  useEffect(() => {
    useInstancedMeshStore
      .getState()
      .allocateInstance(resourceLocation, modelId)
      .then((id) => setInstanceId(id))
      .catch(console.error)
  }, [resourceLocation, modelId])

  useEffect(() => {
    // move cleanup function separate from allocation
    // to prevent re-allocation on instanceId state change on first render
    return () => {
      if (instanceId == null) return
      useInstancedMeshStore
        .getState()
        .freeInstance(resourceLocation, instanceId)
    }
  }, [resourceLocation, instanceId, modelId]) // include modelId to run cleanup on modelId change

  useFrame(() => {
    if (objectRef.current == null || instanceId == null) return

    objectRef.current.updateWorldMatrix(true, false)

    useInstancedMeshStore
      .getState()
      .setMatrix(resourceLocation, instanceId, objectRef.current.matrixWorld)
  })

  return <group ref={objectRef} matrixWorldAutoUpdate />
}
