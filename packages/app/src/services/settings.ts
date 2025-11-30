import { z } from 'zod'

import type { LogLevel } from '@/types'

export const HotkeyKeys = [
  // general
  'general.openFromFile',
  'general.saveToFile',
  'general.openSettings',
  'general.undo',
  'general.redo',
  // editor
  'editor.translateMode',
  'editor.rotateMode',
  'editor.scaleMode',
  'editor.duplicate',
  'editor.groupOrUngroup',
  'editor.deleteEntity',
] as const

const settingsSchema = z.object({
  general: z
    .object({
      language: z.enum(['en', 'ko']).default('en'),
      showWelcomeOnStartup: z.boolean().default(true),
      forceUnifont: z.boolean().default(false),
    })
    .prefault({}),
  appearance: z
    .object({
      quickActionPanel: z
        .object({
          location: z.enum(['top', 'bottom']).default('top'),
          margin: z.number().default(16), // 16px = 1rem
        })
        .prefault({}),
      gizmo: z
        .object({
          location: z
            .enum(['bottom-left', 'bottom-right'])
            .default('bottom-left'),
          marginWidth: z.number().default(60),
          marginHeight: z.number().default(60),
        })
        .prefault({}),
      sidebar: z
        .object({
          width: z.number().default(400),
        })
        .prefault({}),
    })
    .prefault({}),
  performance: z
    .object({
      reducePixelRatio: z.boolean().default(false),
    })
    .prefault({}),
  // hotkey settings
  // values must be `KeyboardEvent.key` value, multiple key inputs are deliminated by space
  // key value list: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
  hotkeys: z
    .record(z.enum(HotkeyKeys), z.union([z.string(), z.null()]))
    .prefault({
      // default hotkey settings
      'general.openFromFile': 'Control O',
      'general.saveToFile': 'Control S',
      'general.openSettings': 'Control ,',
      'general.undo': 'Control Z',
      'general.redo': 'Control Y',
      'editor.translateMode': 'T',
      'editor.rotateMode': 'R',
      'editor.scaleMode': 'S',
      'editor.duplicate': 'D',
      'editor.groupOrUngroup': 'G',
      'editor.deleteEntity': 'Delete',
    }),
  debug: z
    .object({
      testOption: z.boolean().default(false),
      minLogLevel: z
        .enum(['error', 'warn', 'info', 'debug'] satisfies LogLevel[])
        .default('info'),
      perfMonitorEnabled: z.boolean().default(false),
      alertUncaughtError: z.boolean().default(false),
    })
    .prefault({}),
})
export type Settings = z.infer<typeof settingsSchema>

export function getStoredSettings() {
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
