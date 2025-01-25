import { useDisplayEntityStore } from '@/stores/displayEntityStore'

/**
 * 상단바 그룹 버튼을 눌렀거나 단축키를 입력했을 때 실행하는 함수
 * 선택한 엔티티가 그룹되어 있지 않다면 그룹하고, 이미 그룹되어 있다면 그룹을 하제
 */
export function toggleGroup() {
  const { entities, selectedEntityIds, groupSelected, ungroupSelected } =
    useDisplayEntityStore.getState()

  const alreadyGrouped =
    selectedEntityIds.length === 1 &&
    entities.get(selectedEntityIds[0])?.kind === 'group'
  if (alreadyGrouped) {
    ungroupSelected()
  } else {
    groupSelected()
  }
}
