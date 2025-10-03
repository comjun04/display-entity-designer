import { merge } from 'lodash-es'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import i18n from '@/i18n/config'
import { getLogger } from '@/services/loggerService'
import { type Settings, getStoredSettings } from '@/services/settings'
import type { DeepPartial, Number3Tuple, PartialNumber3Tuple } from '@/types'

const logger = getLogger('editorStore')

// ==========

type EditorMode = 'translate' | 'rotate' | 'scale'
type TransformationData = {
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
}

type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void

  mobileSidebarOpened: boolean
  setMobileSidebarOpened: (opened: boolean) => void

  mobileDragHoldButtonPressed: boolean
  setMobileDragHoldButtonPressed: (pressed: boolean) => void

  usingTransformControl: boolean
  setUsingTransformControl: (value: boolean) => void

  /**
   * 선택된 display entity transformation 실시간 업데이트용
   */
  selectionBaseTransformation: TransformationData
  setSelectionBaseTransformation: (data: {
    position?: PartialNumber3Tuple
    rotation?: PartialNumber3Tuple
    size?: PartialNumber3Tuple
  }) => void

  projectDirty: boolean
  setProjectDirty: (isDirty: boolean) => void

  headPainterMode: boolean
  setHeadPainterMode: (mode: boolean) => void

  settings: Settings
  setSettings: (newSettings: DeepPartial<Settings>) => void

  resetProject: () => void
}

export const useEditorStore = create(
  immer<EditorState>((set) => {
    const initialSettings = getStoredSettings()
    globalThis.__depl_alertUncaughtError =
      initialSettings?.debug?.alertUncaughtError

    return {
      mode: 'translate',
      setMode: (newMode) =>
        set((state) => {
          state.mode = newMode
        }),

      mobileSidebarOpened: false,
      setMobileSidebarOpened: (opened) =>
        set((state) => {
          state.mobileSidebarOpened = opened
        }),

      mobileDragHoldButtonPressed: false,
      setMobileDragHoldButtonPressed: (pressed) =>
        set((state) => {
          state.mobileDragHoldButtonPressed = pressed
        }),

      usingTransformControl: false,
      setUsingTransformControl: (value) =>
        set((state) => {
          state.usingTransformControl = value
        }),

      selectionBaseTransformation: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        size: [1, 1, 1],
      },
      setSelectionBaseTransformation: (data) =>
        set((state) => {
          if (data?.position != null) {
            const positionDraft =
              state.selectionBaseTransformation.position.slice() as Number3Tuple
            data.position.forEach((d, idx) => {
              if (d != null) {
                positionDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.position = positionDraft
          }
          if (data?.rotation != null) {
            const rotationDraft =
              state.selectionBaseTransformation.rotation.slice() as Number3Tuple
            data.rotation.forEach((d, idx) => {
              if (d != null) {
                rotationDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.rotation = rotationDraft
          }
          if (data?.size != null) {
            const scaleDraft =
              state.selectionBaseTransformation.size.slice() as Number3Tuple
            data.size.forEach((d, idx) => {
              if (d != null) {
                scaleDraft[idx] = d
              }
            })
            state.selectionBaseTransformation.size = scaleDraft
          }
        }),

      projectDirty: false,
      setProjectDirty: (isDirty) =>
        set((state) => {
          state.projectDirty = isDirty
        }),

      headPainterMode: false,
      setHeadPainterMode: (mode) =>
        set((state) => {
          state.headPainterMode = mode
        }),

      settings: initialSettings,
      setSettings: (newSettings) =>
        set((state) => {
          merge(state.settings, newSettings)

          if (newSettings?.debug?.alertUncaughtError != null) {
            globalThis.__depl_alertUncaughtError =
              newSettings.debug.alertUncaughtError
          }

          if (newSettings.general?.language != null) {
            i18n
              .changeLanguage(newSettings.general.language)
              .catch(console.error)
          }

          try {
            window.localStorage.setItem(
              'settings',
              JSON.stringify(state.settings),
            )
          } catch (err) {
            logger.error(err)
          }
        }),

      resetProject: () =>
        set((state) => {
          state.selectionBaseTransformation = {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            size: [1, 1, 1],
          }
          state.usingTransformControl = false
          state.projectDirty = false
        }),
    }
  }),
)
