import type { FC } from 'react'
import { useShallow } from 'zustand/shallow'

import { useDisplayEntityStore } from '@/stores/displayEntityStore'

import { InstancedEntityGroup } from './canvas/instanced'

export const InstancedMeshesRootGroup: FC = () => {
  const instancedMeshGroup = useDisplayEntityStore(
    useShallow((state) => [...state.instancedMeshGroup.keys()]),
  )

  return (
    <group name="InstancedMesh Root Group">
      {instancedMeshGroup.map((key) => (
        <InstancedEntityGroup key={key} id={key} />
      ))}
    </group>
  )
}
