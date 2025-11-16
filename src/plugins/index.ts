import type { App } from 'vue'
import { captureLog } from '@/utils/'

interface Options {
  silent?: boolean
}
export const errorCaptureInit = {
  install(app: App, options: Options = {
    silent: false
  }) {
    if (options.silent)
      console.info('%c[錯誤捕捉啟動]', 'color: green')

    // 攔截 console
    ; (['warn', 'error'] as const).forEach((method) => {
      const original = console[method].bind(console)
      console[method] = (...args: unknown[]) => {
        const type = method === 'warn' ? 'Console Warning' : 'Console Error'
        captureLog({
          type,
          message: args,
          time: new Date(),
        })
        original(...args)
      }
    })

    // Vue error handler
    app.config.errorHandler = (err, _instance, info) => {
      captureLog({
        type: 'Vue Error',
        message: [err, info],
        time: new Date(),
      })
    }

    // 全域 JS 錯誤
    window.onerror = (message, source, lineno, colno, error) => {
      captureLog({
        type: 'Runtime Error',
        message: [message, source, lineno, colno, error],
        time: new Date(),
      })
    }

    // Promise rejection
    window.onunhandledrejection = (event) => {
      captureLog({
        type: 'Promise Rejection',
        message: [event.reason],
        time: new Date(),
      })
    }

    // 資源加載錯誤（例如 script / link / image）
    window.addEventListener(
      'error',
      (event) => {
        const target = event.target as HTMLElement | null
        if (!target)
          return

        let url: string | undefined
        let resourceType: string | undefined

        if (target instanceof HTMLScriptElement) {
          url = target.src
          resourceType = 'script'
        }
        else if (target instanceof HTMLLinkElement) {
          url = target.href
          resourceType = 'link'
        }
        else if (target instanceof HTMLImageElement) {
          url = target.src
          resourceType = 'image'
        }

        if (url) {
          captureLog({
            type: 'Resource Error',
            message: [
              `Resource load error: ${resourceType}`,
              target.outerHTML,
            ],
            time: new Date(),
          })
        }
      },
      true,
    )

    // 攔截 Fetch
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      try {
        const res = await originalFetch(...args)
        if (!res.ok) {
          captureLog({
            type: 'Fetch Error',
            message: [`Fetch Error: ${res.status}`, res.url],
            time: new Date(),
          })
        }
        return res
      }
      catch (err) {
        captureLog({
          type: 'Fetch Error',
          message: ['Fetch Network Error', args, err],
          time: new Date(),
        })
        throw err
      }
    }

    // 攔截 XHR
    type XHRWithInfo = XMLHttpRequest & {
      _requestInfo?: [
        method: string,
        url: string | URL,
        async?: boolean,
        username?: string | null,
        password?: string | null,
      ]
    }

    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send

    XMLHttpRequest.prototype.open = function (
      this: XHRWithInfo,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ): void {
      this._requestInfo = [method, url, async, username, password]
      return originalOpen.call(this, method, url, async!, username, password)
    }

    XMLHttpRequest.prototype.send = function (
      this: XHRWithInfo,
      body?: Document | BodyInit | null,
    ): void {
      this.addEventListener('error', () => {
        captureLog({
          type: 'XHR Error',
          message: ['XHR Network Error', this._requestInfo],
          time: new Date(),
        })
      })

      this.addEventListener('load', () => {
        if (this.status >= 400) {
          captureLog({
            type: 'XHR Error',
            message: [`XHR HTTP Error: ${this.status}`, this._requestInfo],
            time: new Date(),
          })
        }
      })

      return originalSend.call(this, body as Document | XMLHttpRequestBodyInit | null)
    }
  },
}
