export interface ConsoleCaptureData {
  type:
  | 'Console Warning'
  | 'Console Error'
  | 'Vue Error'
  | 'Runtime Error'
  | 'Promise Rejection'
  | 'Resource Error'
  | 'Fetch Error'
  | 'XHR Error'
  message: unknown[]
  time: Date
}

const callbacks = new Set<(data: ConsoleCaptureData) => void>()
const recentErrors = new Set<string>()
const ERROR_TTL = 3000

export function captureLog(data: ConsoleCaptureData): void {
  const hash = `${data.type}:${JSON.stringify(data.message)}`
  if (recentErrors.has(hash))
    return
  recentErrors.add(hash)
  setTimeout(() => recentErrors.delete(hash), ERROR_TTL)

  callbacks.size > 0
    ? callbacks.forEach(cb => cb(data))
    : console.info('[Captured]', data)
}

export function addErrorCallback(cb: (data: ConsoleCaptureData) => void): (() => void) {
  callbacks.add(cb)
  return () => callbacks.delete(cb)
}

export function formattedMessages(error: unknown): string {
  // 如果是陣列（例如 console.error([...args])）
  if (Array.isArray(error)) {
    return error.map(e => formatSingleError(e)).join('\n')
  }

  // 如果是單一錯誤
  return formatSingleError(error)
}

function formatSingleError(err: unknown): string {
  try {
    // Error 類型（包含 message + stack）
    if (err instanceof Error) {
      const message = err.message ?? '(no message)'
      const stack = err.stack ?? '(no stack trace)'

      return `Message:${message}\nStack:${stack}`
    }

    // 物件但不是 Error
    if (typeof err === 'object' && err !== null) {
      console.log(1, err)

      try {
        return JSON.stringify(err, null, 2)
      }
      catch {
        return String(err)
      }
    }

    // 字串或其他原始型別
    return String(err)
  }
  catch (e) {
    return `Error while formatting message: ${String(e)}`
  }
}
