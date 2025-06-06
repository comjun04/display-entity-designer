import merge from 'lodash.merge'
import { z } from 'zod'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { getLogger } from '@/services/loggerService'
import { LogLevel, Number3Tuple, PartialNumber3Tuple } from '@/types'

const logger = getLogger('editorStore')

// ==========

type EditorMode = 'translate' | 'rotate' | 'scale'
type TransformationData = {
  position: Number3Tuple
  rotation: Number3Tuple
  size: Number3Tuple
}

const settingsSchema = z.object({
  debug: z
    .object({
      testOption: z.boolean().default(false),
      minLogLevel: z
        .enum<
          LogLevel,
          [LogLevel, ...LogLevel[]]
        >(['error', 'warn', 'info', 'debug'])
        .default('info'),
      perfMonitorEnabled: z.boolean().default(false),
      alertUncaughtError: z.boolean().default(false),
    })
    .default({}),
})
type Settings = z.infer<typeof settingsSchema>

type EditorState = {
  mode: EditorMode
  setMode: (newMode: EditorMode) => void

  mobileSidebarOpened: boolean
  setMobileSidebarOpened: (opened: boolean) => void

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

  settings: Settings
  setSettings: (newSettings: Partial<Settings>) => void

  resetProject: () => void
}

function getStoredSettings() {
  try {
    const settingsString = window.localStorage.getItem('settings')
    if (settingsString == null) return settingsSchema.parse({})

    const jsonParsedData = JSON.parse(settingsString) as unknown
    return settingsSchema.parse(jsonParsedData)
  } catch (err) {
    // logger.error()를 사용할 경우 settings 로드 과정에서 오류가 발생하면 순환참조 문제로 인해 로드 자체가 안되므로
    // 여기서는 그냥 console.error 사용
    console.error(err)
    return settingsSchema.parse({})
  }
}

export const useEditorStore = create(
  immer<EditorState>((set) => {
    const initialSettings = getStoredSettings() ?? {
      testOption: false,
      minLogLevel: 'info',
    }
    globalThis.__depl_alertUncaughtError =
      initialSettings.debug.alertUncaughtError

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

      settings: initialSettings,
      setSettings: (newSettings) =>
        set((state) => {
          merge(state.settings, newSettings)

          if (newSettings.debug.alertUncaughtError != null) {
            globalThis.__depl_alertUncaughtError =
              newSettings.debug.alertUncaughtError
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
        }),
    }
  }),
)
