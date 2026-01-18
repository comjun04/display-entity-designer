import { useFrame } from '@react-three/fiber'
import type { FC } from 'react'

// import { useShallow } from 'zustand/shallow'
import { getLogger } from '@/lib/logger'
// import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useInstancedMeshStore } from '@/stores/instancedMeshStore'

// import { InstancedEntityGroup } from './canvas/instanced'

const logger = getLogger('InstancedMeshesRootGroup')

export const InstancedMeshesRootGroup: FC = () => {
  // const instancedMeshGroup = useDisplayEntityStore(
  //   useShallow((state) => [...state.instancedMeshGroup.keys()]),
  // )

  const batches = useInstancedMeshStore((state) => state.batches)

  useFrame(() => {
    const { batches, rebuildBatch } = useInstancedMeshStore.getState()
    batches.forEach((batch) => {
      if (batch.dirty) {
        logger.debug(`Rebuilding batch ${batch.key}`)
        rebuildBatch(batch.key)
      }
    })
  })

  return (
    <>
      {/* <group name="InstancedMesh Root Group">
        {instancedMeshGroup.map((key) => (
          <InstancedEntityGroup key={key} id={key} />
        ))}
      </group> */}

      {[...batches.values()].map((batch) => (
        <primitive key={batch.key} object={batch.mesh} />
      ))}
    </>
  )
}
