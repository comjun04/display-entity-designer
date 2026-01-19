import { Mutex } from 'async-mutex'
import {
  type BufferGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  type Material,
  Matrix4,
} from 'three'
import { create } from 'zustand'

import { loadModel } from '@/lib/resources/model'
import { generateModelMeshIngredients } from '@/lib/resources/modelMesh'
import { stripMinecraftPrefix } from '@/lib/utils'

const DEFAULT_CAPACITY = 16
const ZeroScaleMatrix4 = new Matrix4().makeScale(0, 0, 0)

// Use one global mutex to ensure allocation must be done one at a time
// This prevents race-condition when setting `batches` map asynchronously
const instancedMeshMutex = new Mutex()

interface InstancedMeshStoreState {
  batches: Map<
    string,
    {
      key: string

      mesh: InstancedMesh
      geometry: BufferGeometry
      materials: Material[]

      capacity: number
      usedCount: number
      freeSlots: number[]
      dirty: boolean

      instances: Map<
        string,
        {
          instanceIndex: number
        }
      > // model id -> instance data
    }
  >

  allocateInstance: (
    resourceLocation: string,
    modelId: string,
  ) => Promise<number>
  freeInstance: (resourceLocation: string, modelId: string) => void

  setMatrix: (key: string, modelId: string, matrix: Matrix4) => void

  rebuildBatch: (resourceLocation: string) => void
}
export const useInstancedMeshStore = create<InstancedMeshStoreState>(
  (set, get) => ({
    batches: new Map(),

    allocateInstance: async (resourceLocation, modelId) => {
      return await instancedMeshMutex.runExclusive(async () => {
        const { batches } = get()
        const batchesDraft = new Map(batches)

        let batch = batches.get(resourceLocation)
        if (batch == null) {
          const { data: modelData, isBlockShapedItemModel } =
            await loadModel(resourceLocation)
          const isItemModel =
            stripMinecraftPrefix(resourceLocation).startsWith('item/')

          const meshIngredients = await generateModelMeshIngredients({
            modelResourceLocation: resourceLocation,
            elements: modelData.elements,
            textures: modelData.textures,
            isItemModel,
            isBlockShapedItemModel,
            playerHeadData: undefined,
          })
          if (meshIngredients == null) {
            throw new Error(
              `Failed to load model mesh data for ${resourceLocation}`,
            )
          }

          const newMesh = new InstancedMesh(
            meshIngredients.geometry,
            meshIngredients.materials,
            DEFAULT_CAPACITY,
          )
          newMesh.instanceMatrix.setUsage(DynamicDrawUsage)
          newMesh.instanceMatrix.set(Array(DEFAULT_CAPACITY * 16).fill(0)) // hide all instances by default
          newMesh.instanceMatrix.needsUpdate = true

          batch = {
            key: resourceLocation,

            mesh: newMesh,
            geometry: meshIngredients.geometry,
            materials: meshIngredients.materials,

            capacity: DEFAULT_CAPACITY,
            usedCount: 0,
            freeSlots: [],
            dirty: true,

            instances: new Map(),
          }
          batchesDraft.set(resourceLocation, batch)
        }

        // allocate new space
        let index: number
        if (batch.freeSlots.length > 0) {
          index = batch.freeSlots.shift()! // FIFO
        } else {
          if (batch.usedCount + 1 >= batch.capacity) {
            // grow batch
            batch.dirty = true
            batch.capacity *= 2
            // NOTE: we rebuild lazily
          }
          index = batch.usedCount++
        }

        batch.instances.set(modelId, {
          instanceIndex: index,
        })

        set({ batches: batchesDraft })

        return index
      })
    },
    freeInstance: (resourceLocation, modelId) => {
      const { batches } = get()
      const batch = batches.get(resourceLocation)
      if (batch == null) return

      const batchesDraft = new Map(batches)

      const existing = batch.instances.get(modelId)
      if (existing != null) {
        batch.instances.delete(modelId)
        batch.freeSlots.push(existing.instanceIndex)

        // hide instance
        batch.mesh.setMatrixAt(existing.instanceIndex, ZeroScaleMatrix4)
        batch.mesh.instanceMatrix.needsUpdate = true
      }

      set({ batches: batchesDraft })
    },

    setMatrix: (key, modelId, matrix) => {
      const batch = get().batches.get(key)
      if (batch == null) {
        console.error(`Cannot set matrix of unknown batch: ${key}`)
        return
      }

      const instance = batch.instances.get(modelId)
      if (instance == null) {
        console.error(
          `Cannot set matrix to unknown instance ${modelId} of batch ${key}`,
        )
        return
      }

      const { instanceIndex } = instance

      if (
        batch.mesh.count <= instanceIndex ||
        batch.freeSlots.includes(instanceIndex)
      ) {
        console.error(
          `Cannot set matrix to unallocated/unused instance ${instanceIndex} at batch ${key} (total capacity: ${batch.mesh.count})`,
        )
        return
      }

      batch.mesh.setMatrixAt(instanceIndex, matrix)
      batch.mesh.instanceMatrix.needsUpdate = true
    },

    rebuildBatch: (resourceLocation) => {
      const { batches } = get()
      const old = batches.get(resourceLocation)
      if (old == null) return

      const batchesDraft = new Map(batches)

      // create new InstancedMesh with updated capacity
      const newMesh = new InstancedMesh(
        old.geometry,
        old.materials,
        old.capacity,
      )
      newMesh.instanceMatrix.setUsage(DynamicDrawUsage)
      newMesh.instanceMatrix.copyArray(old.mesh.instanceMatrix.array)
      newMesh.instanceMatrix.set(
        Array((newMesh.count - old.mesh.count) * 16).fill(0),
        old.mesh.count * 16,
      ) // hide newly created instance slots by default
      newMesh.instanceMatrix.needsUpdate = true

      old.mesh.dispose()

      old.mesh = newMesh
      old.dirty = false

      set({ batches: batchesDraft })
    },
  }),
)
