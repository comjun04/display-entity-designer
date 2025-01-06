import { nanoid } from 'nanoid'
import { Box3 } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { useEntityRefStore } from '@/stores/entityRefStore'
import {
  DisplayEntity,
  DisplayEntityGroup,
  ModelDisplayPositionKey,
  Number3Tuple,
  PartialNumber3Tuple,
} from '@/types'

import { useEditorStore } from './editorStore'

export type DisplayEntityState = {
  entities: DisplayEntity[]
  selectedEntityIds: string[]

  createNew: (kind: DisplayEntity['kind'], type: string) => void
  setSelected: (ids: string[]) => void
  addToSelected: (id: string) => void
  setEntityTranslation: (id: string, translation: PartialNumber3Tuple) => void
  setEntityRotation: (id: string, rotation: PartialNumber3Tuple) => void
  setEntityScale: (id: string, scale: PartialNumber3Tuple) => void
  batchSetEntityTransformation: (
    data: {
      id: string
      translation?: PartialNumber3Tuple
      rotation?: PartialNumber3Tuple
      scale?: PartialNumber3Tuple
    }[],
  ) => void
  setEntityDisplayType: (
    id: string,
    display: ModelDisplayPositionKey | null,
  ) => void
  setBDEntityBlockstates: (
    id: string,
    blockstates: Record<string, string>,
  ) => void
  deleteEntity: (id: string) => void

  groupSelected: () => void
  ungroupSelected: () => void
}

export const useDisplayEntityStore = create(
  immer<DisplayEntityState>((set) => ({
    entities: [],
    selectedEntityIds: [],

    createNew: (kind, type) => {
      const id = nanoid(16)

      return set((state) => {
        useEntityRefStore.getState().createEntityRef(id)

        if (kind === 'block') {
          state.entities.push({
            kind: 'block',
            id,
            type,
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
            blockstates: {},
          })
        } else if (kind === 'item') {
          state.entities.push({
            kind: 'item',
            id,
            type,
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
          })
        }
      })
    },
    setSelected: (ids) =>
      set((state) => {
        if (state.selectedEntityIds[0] !== ids[0]) {
          const firstSelectedEntity = state.entities.find(
            (e) => e.id === ids[0],
          )

          useEditorStore.getState().setSelectionBaseTransformation({
            position: firstSelectedEntity?.position,
            rotation: firstSelectedEntity?.rotation,
            size: firstSelectedEntity?.size,
          })
        }

        state.selectedEntityIds = ids
      }),
    addToSelected: (id) =>
      set((state) => {
        if (!state.selectedEntityIds.includes(id)) {
          state.selectedEntityIds.push(id)
        }
      }),
    setEntityTranslation: (id, translation) =>
      set((state) => {
        console.debug(
          'displayEntityStore setEntityTranslation',
          id,
          translation,
        )

        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityTranslation(): unknown entity ${id}`,
          )
          return
        }

        const positionDraft = entity.position.slice() as Number3Tuple
        translation.forEach((d, idx) => {
          if (d != null) {
            positionDraft[idx] = d
          }
        })
        entity.position = positionDraft
      }),
    setEntityRotation: (id, rotation) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityRotation(): unknown entity ${id}`,
          )
          return
        }

        const rotationDraft = entity.rotation.slice() as Number3Tuple
        rotation.forEach((d, idx) => {
          if (d != null) {
            rotationDraft[idx] = d
          }
        })
        entity.rotation = rotationDraft
      }),
    setEntityScale: (id, scale) =>
      set((state) => {
        console.debug('displayEntityStore setEntityScale', id, scale)

        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `displayEntityStore.setEntityScale(): unknown entity ${id}`,
          )
          return
        }

        const scaleDraft = entity.size.slice() as Number3Tuple
        scale.forEach((d, idx) => {
          if (d != null) {
            scaleDraft[idx] = d
          }
        })
        entity.size = scaleDraft
      }),
    batchSetEntityTransformation: (data) =>
      set((state) => {
        console.debug('displayEntityStore batchSetEntityTransformation', data)

        data.forEach((item) => {
          const entity = state.entities.find((e) => e.id === item.id)
          if (entity == null) return

          if (item.translation != null) {
            const positionDraft = entity.position.slice() as Number3Tuple
            item.translation.forEach((d, idx) => {
              if (d != null) {
                positionDraft[idx] = d
              }
            })
            entity.position = positionDraft
          }
          if (item.rotation != null) {
            const rotationDraft = entity.rotation.slice() as Number3Tuple
            item.rotation.forEach((d, idx) => {
              if (d != null) {
                rotationDraft[idx] = d
              }
            })
            entity.rotation = rotationDraft
          }
          if (item.scale != null) {
            const scaleDraft = entity.size.slice() as Number3Tuple
            item.scale.forEach((d, idx) => {
              if (d != null) {
                scaleDraft[idx] = d
              }
            })
            entity.size = scaleDraft
          }
        })
      }),
    setEntityDisplayType: (id, display) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `Attempted to set display type for unknown display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'item') {
          console.error(
            `Attempted to set display type for non-item display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        entity.display = display
      }),
    setBDEntityBlockstates: (id, blockstates) =>
      set((state) => {
        const entity = state.entities.find((e) => e.id === id)
        if (entity == null) {
          console.error(
            `Attempted to set blockstates for unknown block display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'block') {
          console.error(
            `Attempted to set blockstates for non-block display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        entity.blockstates = { ...entity.blockstates, ...blockstates }
      }),
    deleteEntity: (id) =>
      set((state) => {
        const entityIdx = state.entities.findIndex((e) => e.id === id)
        if (entityIdx < 0) {
          console.error(
            `displayEntityStore.deleteEntity(): Attempt to remove unknown entity with id ${id}`,
          )
          return
        }

        const entity = state.entities[entityIdx]

        // parent가 있을 경우 parent entity에서 children으로 등록된 걸 삭제
        if (entity.parent != null) {
          const parentElement = state.entities.find(
            (e) => e.id === entity.parent,
          )
          if (parentElement == null || parentElement.kind !== 'group') return

          const idx = parentElement.children.findIndex((d) => d === id)
          if (idx >= 0) {
            parentElement.children.splice(idx, 1)
          }
        }

        // children으로 등록된 entity들이 있다면 같이 삭제
        if (entity.kind === 'group') {
          entity.children.forEach((id) => state.deleteEntity(id))
        }

        useEntityRefStore.getState().deleteEntityRef(id)
        state.entities.splice(entityIdx, 1)

        const selectedEntityIdIdx = state.selectedEntityIds.findIndex(
          (entityId) => entityId === id,
        )
        if (selectedEntityIdIdx >= 0) {
          state.selectedEntityIds.splice(selectedEntityIdIdx, 1)
        }
      }),

    groupSelected: () =>
      set((state) => {
        const groupId = nanoid(16)

        const selectedEntities = state.entities.filter((e) =>
          state.selectedEntityIds.includes(e.id),
        )
        if (selectedEntities.length < 1) {
          console.error(
            'displayEntityStore.groupSelected(): no selected entities to group',
          )
          return
        }

        const firstSelectedEntityParentId = selectedEntities[0].parent
        if (
          !selectedEntities.every(
            (e) => e.parent === firstSelectedEntityParentId,
          )
        ) {
          console.error(
            'displayEntityStore.groupSelected(): cannot group entities with different parent',
          )
          return
        }

        const previousParentGroup =
          firstSelectedEntityParentId != null
            ? (state.entities.find(
                (e) => e.id === firstSelectedEntityParentId,
              ) as DisplayEntityGroup) // WritableDraft<DisplayEntityGroup>
            : undefined

        // box3로 그룹 안에 포함될 모든 entity들을 포함하도록 늘려서 측정
        const box3 = new Box3()
        const entityRefs = useEntityRefStore.getState().entityRefs
        for (const selectedEntity of selectedEntities) {
          const entityRefData = entityRefs.find(
            (d) => d.id === selectedEntity.id,
          )!
          box3.expandByObject(entityRefData.objectRef.current)

          selectedEntity.parent = groupId
          if (previousParentGroup != null) {
            // group하기 전 엔티티가 다른 그룹에 속해 있었다면 children 목록에서 제거
            const idx = previousParentGroup.children.findIndex(
              (id) => id === selectedEntity.id,
            )
            if (idx >= 0) {
              previousParentGroup.children.splice(idx, 1)
            }
          }
        }
        for (const selectedEntity of selectedEntities) {
          selectedEntity.position[0] -= box3.min.x
          selectedEntity.position[1] -= box3.min.y
          selectedEntity.position[2] -= box3.min.z
        }

        useEntityRefStore.getState().createEntityRef(groupId)

        state.entities.unshift({
          kind: 'group',
          id: groupId,
          position: box3.min.toArray(),
          rotation: [0, 0, 0],
          size: [1, 1, 1],
          parent: firstSelectedEntityParentId,
          children: [...state.selectedEntityIds],
        } satisfies DisplayEntityGroup)
        if (previousParentGroup != null) {
          // 새로 만들어진 그룹을 기존에 엔티티들이 있었던 그룹의 children으로 추가
          previousParentGroup.children.push(groupId)
        }

        // 선택된 디스플레이 엔티티를 방금 생성한 그룹으로 설정
        state.selectedEntityIds = [groupId]
      }),
    ungroupSelected: () =>
      set((state) => {
        if (state.selectedEntityIds.length !== 1) {
          console.error(
            `displayEntityStore.ungroupSelected(): Cannot ungroup ${state.selectedEntityIds.length} items; Only single group can be ungrouped.`,
          )
          return
        }

        const entityGroupId = state.selectedEntityIds[0]
        const selectedEntityGroup = state.entities.find(
          (e) => e.id === entityGroupId,
        )
        if (selectedEntityGroup?.kind !== 'group') {
          console.error(
            `displayEntityStore.ungroupSelected(): selected entity ${entityGroupId} (kind: ${selectedEntityGroup?.kind}) is not a group`,
          )
          return
        }

        const parentEntityGroup =
          selectedEntityGroup.parent != null
            ? (state.entities.find(
                (e) => e.id === selectedEntityGroup.parent,
              ) as DisplayEntityGroup) // WritableDraft<DisplayEntityGroup>
            : undefined
        if (parentEntityGroup != null) {
          const idx = parentEntityGroup.children.findIndex(
            (id) => id === entityGroupId,
          )
          if (idx >= 0) {
            parentEntityGroup.children.splice(idx, 1)
          }
        }

        state.entities
          .filter((e) => selectedEntityGroup.children.includes(e.id))
          .forEach((e) => {
            e.parent = parentEntityGroup?.id
            if (parentEntityGroup != null) {
              parentEntityGroup.children.push(e.id)
            }

            e.position[0] += selectedEntityGroup.position[0]
            e.position[1] += selectedEntityGroup.position[1]
            e.position[2] += selectedEntityGroup.position[2]
          })

        // 그룹의 children을 비우기
        // 그룹 삭제는 DisplayEntity.tsx의 useEffect()에서 수행 (그룹에 children이 비어있을 경우 삭제)
        // 여기서 먼저 삭제할 경우 그룹에 속한 엔티티들의 reparenting이 진행되기 전에 엔티티 instance가 삭제되어 버려서
        // 화면에 렌더링이 안되는 문제가 있음
        selectedEntityGroup.children = []

        // ungroup한 뒤에는 모든 선택된 엔티티들의 선택을 해제
        state.selectedEntityIds = []
      }),
  })),
)
