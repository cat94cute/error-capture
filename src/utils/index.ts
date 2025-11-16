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
