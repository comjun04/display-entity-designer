import { useEditorStore } from '@/stores/editorStore'
import { LogLevel } from '@/types'

const logLevelOrder: readonly LogLevel[] = ['debug', 'info', 'warn', 'error']

type LogFunction = ((logLevel: LogLevel, ...content: unknown[]) => void) & {
  debug: (...content: unknown[]) => void
  info: (...content: unknown[]) => void
  log: (...content: unknown[]) => void
  warn: (...content: unknown[]) => void
  error: (...content: unknown[]) => void
}

export function getLogger(prefix: string) {
  const func: LogFunction = (logLevel, ...content) => {
    const {
      settings: { minLogLevel },
    } = useEditorStore.getState()

    const logLevelIdx = logLevelOrder.findIndex((d) => d === logLevel)
    const minLogLevelIdx = logLevelOrder.findIndex((d) => d === minLogLevel)
    if (logLevelIdx < minLogLevelIdx) return

    const bracketedPrefix = `[${prefix}]`
    switch (logLevel) {
      case 'debug':
        console.debug(bracketedPrefix, ...content)
        break
      case 'info':
        console.log(bracketedPrefix, ...content)
        break
      case 'warn':
        console.warn(bracketedPrefix, ...content)
        break
      case 'error':
        console.error(bracketedPrefix, ...content)
    }
  }

  func['debug'] = (...content) => {
    func('debug', ...content)
  }

  func['info'] = (...content) => {
    func('info', ...content)
  }
  func['log'] = (...content) => {
    func('info', ...content)
  }

  func['warn'] = (...content) => {
    func('warn', ...content)
  }

  func['error'] = (...content) => {
    func('error', ...content)
  }

  return func
}
