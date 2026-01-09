import i18n from '@/lib/i18n/config'
import { useDialogStore } from '@/stores/dialogStore'
import { useDisplayEntityStore } from '@/stores/displayEntityStore'
import { useHistoryStore } from '@/stores/historyStore'

const { t } = i18n

/**
 * 상단바 그룹 버튼을 눌렀거나 단축키를 입력했을 때 실행하는 함수
 * 선택한 엔티티가 그룹되어 있지 않다면 그룹하고, 이미 그룹되어 있다면 그룹을 하제
 */
export function toggleGroup() {
  const { entities, selectedEntityIds, groupEntities, ungroupEntityGroup } =
    useDisplayEntityStore.getState()

  const alreadyGrouped =
    selectedEntityIds.length === 1 &&
    entities.get(selectedEntityIds[0])?.kind === 'group'
  if (alreadyGrouped) {
    ungroupEntityGroup(selectedEntityIds[0])
  } else {
    groupEntities(selectedEntityIds)
  }
}

export function newProject() {
  const { entities, clearEntities } = useDisplayEntityStore.getState()
  const { undoStack, redoStack, clearHistory } = useHistoryStore.getState()

  const clearProjectFn = () => {
    clearHistory()
    clearEntities()
  }

  const dirty =
    entities.size > 0 || undoStack.length > 0 || redoStack.length > 0
  if (dirty) {
    useDialogStore.getState().openPromptDialog({
      title: t(($) => $.dialog.prompt.createNewProject.title),
      content: t(($) => $.dialog.prompt.createNewProject.content),
      buttonText: {
        positive: t(($) => $.dialog.prompt.createNewProject.button.yes),
        negative: t(($) => $.dialog.prompt.createNewProject.button.no),
      },
      onChoice: (choice) => {
        if (choice) {
          clearProjectFn()
        }
      },
    })
  } else {
    clearProjectFn()
  }
}
