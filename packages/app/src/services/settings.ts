import { z } from 'zod'

import type { LogLevel } from '@/types'

const settingsSchema = z.object({
  general: z
    .object({
      language: z.enum(['en', 'ko']).default('en'),
      showWelcomeOnStartup: z.boolean().default(true),
      forceUnifont: z.boolean().default(false),
    })
    .prefault({}),
  performance: z
    .object({
      reducePixelRatio: z.boolean().default(false),
    })
    .prefault({}),
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
