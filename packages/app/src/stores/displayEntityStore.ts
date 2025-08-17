import merge from 'lodash.merge'
import { nanoid } from 'nanoid'
import { Box3, Euler, Matrix4, Quaternion, Vector3 } from 'three'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getLogger } from '@/services/loggerService'
import { preloadResources } from '@/services/resources/preload'
import { useEntityRefStore } from '@/stores/entityRefStore'
import {
  BDEngineSaveData,
  BDEngineSaveDataItem,
  DeepPartial,
  DisplayEntity,
  DisplayEntityGroup,
  DisplayEntitySaveDataItem,
  ModelDisplayPositionKey,
  Number3Tuple,
  PartialNumber3Tuple,
  PlayerHeadProperties,
  TextDisplayEntity,
  TextureValue,
  isItemDisplayPlayerHead,
} from '@/types'

import { useEditorStore } from './editorStore'

const logger = getLogger('displayEntityStore')

const ENTITY_ID_LENGTH = 16

/**
 * 새로운 id를 생성합니다.
 * @param idUsabiityCheckPredicate id가 사용 가능한지 판별하는 함수. 중복값을 걸러내야 할 때 등에 사용할 수 있습니다.
 * 지정하지 않을 경우 생성된 id를 항상 사용 가능하다고 판별합니다.
 * @returns 새로 생성된 id
 */
const generateId = (
  length: number,
  idUsabiityCheckPredicate: (id: string) => boolean = () => true,
) => {
  const id = nanoid(length)
  if (!idUsabiityCheckPredicate(id)) {
    return generateId(length, idUsabiityCheckPredicate)
  }

  return id
}

export type DisplayEntityState = {
  entities: Map<string, DisplayEntity>
  selectedEntityIds: string[]

  /**
   * 새로운 디스플레이 엔티티를 생성합니다.
   * @param kind 디스플레이 엔티티의 종류. `block`, `item` 혹은 `text`
   * @param typeOrText `kind`가 `block` 또는 `item`일 경우 블록/아이템 id, `text`일 경우 입력할 텍스트 (JSON Format)
   * @returns 생성된 디스플레이 엔티티 데이터 id
   */
  createNew: (kind: DisplayEntity['kind'], typeOrText: string) => string
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
  setTextDisplayProperties: (
    id: string,
    properties: DeepPartial<
      Omit<
        TextDisplayEntity,
        'id' | 'kind' | 'position' | 'rotation' | 'size' | 'parent'
      >
    >,
  ) => void
  setItemDisplayPlayerHeadProperties: (
    entityId: string,
    data: PlayerHeadProperties,
  ) => void
  deleteEntities: (entityIds: string[]) => void

  bulkImport: (items: DisplayEntitySaveDataItem[]) => Promise<void>
  bulkImportFromBDE: (saveData: BDEngineSaveData) => Promise<void>
  exportAll: () => DisplayEntitySaveDataItem[]

  clearEntities: () => void

  groupSelected: () => void
  ungroupSelected: () => void
}

export const useDisplayEntityStore = create(
  immer<DisplayEntityState>((set, get) => ({
    entities: new Map(),
    selectedEntityIds: [],

    createNew: (kind, typeOrText) => {
      const id = generateId(ENTITY_ID_LENGTH)

      set((state) => {
        useEntityRefStore.getState().createEntityRefs([id])

        if (kind === 'block') {
          state.entities.set(id, {
            kind: 'block',
            id,
            type: typeOrText,
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
            blockstates: {},
          })
        } else if (kind === 'item') {
          state.entities.set(id, {
            kind: 'item',
            id,
            type: typeOrText,
            size: [1, 1, 1],
            position: typeOrText === 'player_head' ? [0, 0.5, 0] : [0, 0, 0],
            rotation: [0, 0, 0],
            display: null,
          })

          const entity = state.entities.get(id)!
          if (isItemDisplayPlayerHead(entity)) {
            // is player_head
            entity.playerHeadProperties = {
              texture: {
                baked: false,
              },
            }
          }
        } else if (kind === 'text') {
          state.entities.set(id, {
            kind: 'text',
            id,
            text: typeOrText,
            textColor: 0xffffffff, // #ffffffff, white
            textEffects: {
              bold: false,
              italic: false,
              underlined: false,
              strikethrough: false,
              obfuscated: false,
            },
            size: [1, 1, 1],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            alignment: 'center',
            backgroundColor: 0xff000000, // #ff000000, black
            defaultBackground: false,
            lineWidth: 200,
            seeThrough: false,
            shadow: false,
            textOpacity: 255,
          })
        }
      })

      return id
    },
    setSelected: (ids) =>
      set((state) => {
        if (state.selectedEntityIds[0] !== ids[0]) {
          const firstSelectedEntity = state.entities.get(ids[0])

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
        logger.debug('setEntityTranslation', id, translation)

        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(`setEntityTranslation(): unknown entity ${id}`)
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
        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(`setEntityRotation(): unknown entity ${id}`)
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
        logger.debug('setEntityScale', id, scale)

        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(`setEntityScale(): unknown entity ${id}`)
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
        logger.debug('batchSetEntityTransformation', data)

        data.forEach((item) => {
          const entity = state.entities.get(item.id)
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
        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(
            `Attempted to set display type for unknown display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'item') {
          logger.error(
            `Attempted to set display type for non-item display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        entity.display = display
      }),
    setBDEntityBlockstates: (id, blockstates) =>
      set((state) => {
        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(
            `Attempted to set blockstates for unknown block display entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'block') {
          logger.error(
            `Attempted to set blockstates for non-block display entity: ${id}, kind: ${entity.kind}`,
          )
          return
        }

        // 변경할 게 없으면 그냥 종료
        if ([...Object.keys(blockstates)].length < 1) {
          return
        }

        entity.blockstates = { ...entity.blockstates, ...blockstates }
      }),
    setTextDisplayProperties: (id, properties) =>
      set((state) => {
        const entity = state.entities.get(id)
        if (entity == null) {
          logger.error(
            `Attempted to set properties for unknown text displau entity: ${id}`,
          )
          return
        } else if (entity.kind !== 'text') {
          logger.error(
            `Attempted to set properties for non-text display entity: ${id}`,
          )
          return
        }

        if (
          properties.lineWidth != null &&
          // TODO: specific type check (int)
          (!isFinite(properties.lineWidth) || properties.lineWidth < 0)
        ) {
          logger.error(
            `Text Display \`lineWidth\` must be positive integer or zero, but tried to set ${properties.lineWidth} to entity ${id}`,
          )
          return
        }

        merge(entity, properties)
      }),
    setItemDisplayPlayerHeadProperties: (entityId, data) =>
      set((state) => {
        const entity = state.entities.get(entityId)
        if (entity == null) {
          console.error(
            `Attempted to set player_head properties on entity which does not exist: ${entityId}`,
          )
          return
        } else if (!isItemDisplayPlayerHead(entity)) {
          console.error(
            `Attempted to set player_head properties on non player_head display`,
          )
          return
        }

        entity.playerHeadProperties = data
      }),
    deleteEntities: (entityIds) =>
      set((state) => {
        const deletePendingEntityIds = new Set<string>()

        const recursivelyDelete = (ids: string[]) => {
          for (const id of ids) {
            // 이미 삭제 대상인 entity일 경우 스킵
            // 이 entity의 parent entity가 삭제 대상이라 이미 처리한 경우임
            if (deletePendingEntityIds.has(id)) continue

            const entity = state.entities.get(id)
            if (entity == null) {
              logger.error(
                `deleteEntities(): Attempt to remove unknown entity with id ${id}`,
              )
              continue
            }

            // parent가 있을 경우 parent entity에서 children으로 등록된 걸 삭제
            if (entity.parent != null) {
              const parentElement = state.entities.get(entity.parent)
              if (parentElement != null && parentElement.kind === 'group') {
                const idx = parentElement.children.findIndex((d) => d === id)
                if (idx >= 0) {
                  parentElement.children.splice(idx, 1)
                }
              }
            }

            // children으로 등록된 entity들이 있다면 같이 삭제
            if (entity.kind === 'group') {
              // children entity에서 parent entity의 children id 배열을 건드릴 경우 for ... of 배열 순환에 문제가 생김
              // index가 하나씩 앞으로 당겨지면서 일부 엔티티가 삭제 처리가 안됨
              recursivelyDelete(entity.children.slice())
            }

            deletePendingEntityIds.add(id)
          }
        }

        recursivelyDelete(entityIds)

        useEntityRefStore
          .getState()
          .deleteEntityRefs([...deletePendingEntityIds.values()])
        for (const entityIdToDelete of deletePendingEntityIds) {
          state.entities.delete(entityIdToDelete)
        }
        state.selectedEntityIds = state.selectedEntityIds.filter(
          (entityId) => !deletePendingEntityIds.has(entityId),
        )
      }),

    bulkImport: async (items) => {
      const { createEntityRefs } = useEntityRefStore.getState()

      const entities = new Map<string, DisplayEntity>()

      const tempMatrix4 = new Matrix4()
      const tempPositionVec = new Vector3()
      const tempScaleVec = new Vector3()
      const tempQuaternion = new Quaternion()
      const tempEuler = new Euler()

      const f: (
        itemList: DisplayEntitySaveDataItem[],
        parentEntityId?: string,
      ) => string[] = (itemList, parentEntityId) => {
        return itemList.map((item) => {
          const id = nanoid(16)

          tempMatrix4.fromArray(item.transforms)
          tempMatrix4.decompose(tempPositionVec, tempQuaternion, tempScaleVec)
          const position = tempPositionVec.toArray()
          const scale = tempScaleVec.toArray()
          tempEuler.setFromQuaternion(tempQuaternion)
          const rotation = [
            tempEuler.x,
            tempEuler.y,
            tempEuler.z,
          ] satisfies Number3Tuple

          if (item.kind === 'group') {
            const children = item.children ?? []
            const childrenIds = f(children, id)

            entities.set(id, {
              kind: 'group',
              id,
              position,
              rotation,
              size: scale,
              children: childrenIds,
              parent: parentEntityId,
            })
          } else if (item.kind === 'block') {
            // blockstate가 없을 경우 empty string을 key로 사용하게 되어 들어가게 되므로 빼주기
            const blockstatesCopy = Object.assign({}, item.blockstates)
            delete blockstatesCopy['']

            entities.set(id, {
              kind: 'block',
              id,
              type: item.type,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,
              blockstates: item.blockstates,
              display: item.display,
            })
          } else if (item.kind === 'item') {
            entities.set(id, {
              kind: 'item',
              id,
              type: item.type,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,
              display: item.display,
            })

            const entity = entities.get(id)!
            if (isItemDisplayPlayerHead(entity)) {
              if ('playerHeadProperties' in item) {
                // is player_head
                entity.playerHeadProperties =
                  item.playerHeadProperties as PlayerHeadProperties
              } else {
                // savefile v1 -> v2
                // fill default playerHeadProperties if not exist
                entity.playerHeadProperties = {
                  texture: {
                    baked: false,
                  },
                }
              }
            }
          } else if (item.kind === 'text') {
            entities.set(id, {
              kind: 'text',
              id,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,
              text: item.text,
              textColor: item.textColor,
              textEffects: item.textEffects,
              alignment: item.alignment,
              backgroundColor: item.backgroundColor,
              defaultBackground: item.defaultBackground,
              lineWidth: item.lineWidth,
              seeThrough: item.seeThrough,
              shadow: item.shadow,
              textOpacity: item.textOpacity,
            })
          }

          return id
        })
      }

      f(items)

      await preloadResources([...entities.values()])

      createEntityRefs([...entities.keys()])
      set({ entities })
    },
    bulkImportFromBDE: async (saveData) => {
      const entities = new Map<string, DisplayEntity>()

      const tempMatrix4 = new Matrix4()
      const tempPositionVec = new Vector3()
      const tempScaleVec = new Vector3()
      const tempQuaternion = new Quaternion()
      const tempEuler = new Euler()

      const f: (
        items: BDEngineSaveDataItem[],
        parentEntityId?: string,
      ) => (string | null)[] = (items, parentEntityId) => {
        return items.map((item) => {
          const id = nanoid(16)

          tempMatrix4.fromArray(item.transforms).transpose()
          tempMatrix4.decompose(tempPositionVec, tempQuaternion, tempScaleVec)
          const position = tempPositionVec.toArray()
          const scale = tempScaleVec.toArray()
          tempEuler.setFromQuaternion(tempQuaternion)
          const rotation = [
            tempEuler.x,
            tempEuler.y,
            tempEuler.z,
          ] satisfies Number3Tuple

          const itemType = item.name.split('[')[0] // block_type[some_blockstate=value,another_blockstate=value2]
          const extraDataList = item.name
            .slice(itemType.length + 1, -1)
            .split(',')
          const extraData: Record<string, string> = extraDataList.reduce(
            (acc, cur) => {
              const [k, v] = cur.split('=')
              // blockstate가 없을 경우 empty string을 key로 사용하게 되어 들어가게 되므로 빼주기
              if (k.length < 1) return acc
              return { ...acc, [k]: v }
            },
            {},
          )

          if ('isCollection' in item && item.isCollection) {
            // group

            const children = item.children ?? []
            const childrenIds = f(children, id)

            entities.set(id, {
              kind: 'group',
              id,
              position,
              rotation,
              size: scale,
              children: childrenIds.filter((id) => id != null),
              parent: parentEntityId,
            })
          } else if ('isBlockDisplay' in item && item.isBlockDisplay) {
            // block display

            entities.set(id, {
              kind: 'block',
              id,
              type: itemType,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,
              blockstates: extraData,
              display: extraData['display'] as ModelDisplayPositionKey,
            })
          } else if ('isItemDisplay' in item && item.isItemDisplay) {
            // item display

            entities.set(id, {
              kind: 'item',
              id,
              type: itemType,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,
              display: extraData['display'] as ModelDisplayPositionKey,
            })

            const entity = entities.get(id)!
            if (isItemDisplayPlayerHead(entity)) {
              let textureUrl: string | undefined
              if (item.defaultTextureValue != null) {
                const decodedTextureValue = JSON.parse(
                  atob(item.defaultTextureValue),
                ) as TextureValue
                textureUrl = decodedTextureValue.textures.SKIN?.url
              }

              entity.playerHeadProperties = {
                texture:
                  textureUrl != null
                    ? {
                        baked: true,
                        url: textureUrl,
                      }
                    : {
                        baked: false,
                      },
              }
            }
          } else if ('isTextDisplay' in item && item.isTextDisplay) {
            // text display

            const textColorRGB = parseInt(item.options.color.slice(1), 16)
            const backgroundColorRGB = parseInt(
              item.options.backgroundColor.slice(1),
              16,
            )
            const backgroundColorARGB =
              (((item.options.backgroundColorAlpha * 255) << 24) |
                backgroundColorRGB) >>>
              0

            entities.set(id, {
              kind: 'text',
              id,
              position,
              rotation,
              size: scale,
              parent: parentEntityId,

              text: item.name,
              textColor: textColorRGB,
              textEffects: {
                bold: item.options.bold,
                italic: item.options.italic,
                underlined: item.options.underline,
                strikethrough: item.options.strikeThrough,
                obfuscated: item.options.obfuscated,
              },
              alignment: item.options.align,
              backgroundColor: backgroundColorARGB,
              defaultBackground: false,
              lineWidth: item.options.lineLength,
              seeThrough: false,
              shadow: false,
              textOpacity: item.options.alpha * 255,
            })
          } else {
            return null
          }

          return id
        })
      }

      // saveData[0]이 최상단 그룹으로 확인되어 이거만 처리함
      f(saveData[0].children)

      await preloadResources([...entities.values()])

      const { createEntityRefs } = useEntityRefStore.getState()

      createEntityRefs([...entities.keys()])
      set({ entities })
    },
    exportAll: () => {
      const { entities } = get()
      const { entityRefs } = useEntityRefStore.getState()

      const generateEntitySaveData: (
        entity: DisplayEntity,
      ) => DisplayEntitySaveDataItem = (entity) => {
        const refData = entityRefs.get(entity.id)!
        const transforms = refData.objectRef.current.matrix.toArray()

        if (entity.kind === 'block') {
          return {
            kind: entity.kind,
            type: entity.type,
            transforms,
            blockstates: entity.blockstates,
            display: entity.display,
          }
        } else if (entity.kind === 'item') {
          return {
            kind: entity.kind,
            type: entity.type,
            transforms,
            display: entity.display,
            playerHeadProperties:
              'playerHeadProperties' in entity
                ? entity.playerHeadProperties
                : undefined,
          }
        } else if (entity.kind === 'text') {
          return {
            kind: entity.kind,
            transforms,
            text: entity.text,
            textColor: entity.textColor,
            textEffects: entity.textEffects,
            alignment: entity.alignment,
            backgroundColor: entity.backgroundColor,
            defaultBackground: entity.defaultBackground,
            lineWidth: entity.lineWidth,
            seeThrough: entity.seeThrough,
            shadow: entity.shadow,
            textOpacity: entity.textOpacity,
          }
        } else if (entity.kind === 'group') {
          const children = entity.children.map((childrenEntityId) => {
            const e = entities.get(childrenEntityId)!
            return generateEntitySaveData(e)
          })
          return {
            kind: entity.kind,
            transforms,
            children,
          }
        }

        // This should not happen
        throw new Error(
          `Unexpected entity kind ${(entity as DisplayEntity).kind}`,
        )
      }

      const rootEntities = [...entities.values()]
        .filter((e) => e.parent == null)
        .map((e) => generateEntitySaveData(e))

      return rootEntities
    },

    clearEntities: () =>
      set((state) => {
        state.entities.clear()
        state.selectedEntityIds = []

        useEntityRefStore.getState().clearEntityRefs()
      }),

    groupSelected: () =>
      set((state) => {
        const groupId = nanoid(16)

        const selectedEntities = [...state.entities.values()].filter((e) =>
          state.selectedEntityIds.includes(e.id),
        )
        if (selectedEntities.length < 1) {
          logger.error('groupSelected(): no selected entities to group')
          return
        }

        const firstSelectedEntityParentId = selectedEntities[0].parent
        if (
          !selectedEntities.every(
            (e) => e.parent === firstSelectedEntityParentId,
          )
        ) {
          logger.error(
            'groupSelected(): cannot group entities with different parent',
          )
          return
        }

        const previousParentGroup =
          firstSelectedEntityParentId != null
            ? (state.entities.get(
                firstSelectedEntityParentId,
              ) as DisplayEntityGroup) // WritableDraft<DisplayEntityGroup>
            : undefined

        // box3로 그룹 안에 포함될 모든 entity들을 포함하도록 늘려서 측정
        const box3 = new Box3()
        const entityRefs = useEntityRefStore.getState().entityRefs
        for (const selectedEntity of selectedEntities) {
          const entityRefData = entityRefs.get(selectedEntity.id)!
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

        useEntityRefStore.getState().createEntityRefs([groupId])

        // unshift 이제 더 이상 안됨 흑흑
        state.entities.set(groupId, {
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
          logger.error(
            `ungroupSelected(): Cannot ungroup ${state.selectedEntityIds.length} items; Only single group can be ungrouped.`,
          )
          return
        }

        const entityGroupId = state.selectedEntityIds[0]
        const selectedEntityGroup = state.entities.get(entityGroupId)
        if (selectedEntityGroup?.kind !== 'group') {
          logger.error(
            `ungroupSelected(): selected entity ${entityGroupId} (kind: ${selectedEntityGroup?.kind}) is not a group`,
          )
          return
        }

        const parentEntityGroup =
          selectedEntityGroup.parent != null
            ? (state.entities.get(
                selectedEntityGroup.parent,
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

        const { entityRefs } = useEntityRefStore.getState()

        const groupTransformationMatrix = entityRefs
          .get(entityGroupId)!
          .objectRef.current.matrix.clone()

        ;[...state.entities.values()]
          .filter((e) => selectedEntityGroup.children.includes(e.id))
          .forEach((e) => {
            e.parent = parentEntityGroup?.id
            if (parentEntityGroup != null) {
              parentEntityGroup.children.push(e.id)
            }

            const refData = entityRefs.get(e.id)!
            const entityInstance = refData.objectRef.current
            const newEntityMatrix = entityInstance.matrix
              .clone()
              .premultiply(groupTransformationMatrix) // entityInstance.applyMatrix4(groupTransformationMatrix)

            const newPosition = new Vector3().setFromMatrixPosition(
              newEntityMatrix,
            )
            const newRotation = new Euler().setFromRotationMatrix(
              newEntityMatrix,
            )
            const newScale = new Vector3().setFromMatrixScale(newEntityMatrix)

            e.position = newPosition.toArray()
            e.rotation = [newRotation.x, newRotation.y, newRotation.z]
            e.size = newScale.toArray()
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
