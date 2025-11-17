# 🧩 Error Capture — 前端錯誤捕捉工具

`error-capture` 是一個用於前端專案的全域錯誤監聽與捕捉工具，能自動攔截各種常見錯誤來源，並提供 callback 讓開發者自行決定錯誤要如何處理，例如上報後端、寫入 Log、顯示提示訊息等。工具本身具備重複錯誤去重機制，能避免短時間內大量相同錯誤造成 Log 風暴，並提供錯誤訊息格式化功能以利保存與分析。

---

## 🔥 功能特色

- 自動捕捉前端常見錯誤來源
- 支援多個自訂 callback，錯誤處理彈性高
- 重複錯誤去重（預設 3 秒）
- 提供錯誤訊息格式化工具

---

## 🧭 可捕捉的錯誤類型

| 錯誤類型 | 說明 |
|---------|------|
| `Console Warning` | `console.warn()` |
| `Console Error` | `console.error()` |
| `Vue Error` | Vue `errorHandler` 產生的錯誤 |
| `Runtime Error` | JavaScript 執行期錯誤 |
| `Promise Rejection` | 未捕捉的 Promise 錯誤 |
| `Resource Error` | 靜態資源載入錯誤（如圖片、script） |
| `Fetch Error` | fetch 請求錯誤 |
| `XHR Error` | XMLHttpRequest 請求錯誤 |

每個錯誤都會產生一個 `ConsoleCaptureData`：

```ts
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
```

---

## 🚀 使用方法

1. 初始化 Error Capture

專案入口檔（例如 `main.ts` 或 `main.js`）中註冊：

```ts
import { errorCaptureInit } from 'error-capture'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(errorCaptureInit, {
  silent: false // 是否在控制台顯示啟動訊息
})

app.mount('#app')
```

2. 註冊錯誤回呼 addErrorCallback

`addErrorCallback` 用於註冊自訂錯誤處理邏輯，例如上報後端或顯示提示訊息。

```ts
import { addErrorCallback } from 'error-capture'

addErrorCallback((data) => {
  console.log('捕捉到錯誤：', data)

  // 可在此處：
  // - 上報後端 API
  // - 寫入本地 log
  // - 顯示提示訊息
})
```

3. 格式化錯誤訊息 formattedMessages (可選)

因error物件直接轉成string會導致stack資訊被忽略，`formattedMessages` 可以將error物件中的stack資訊轉成字串。

```ts
import { addErrorCallback, formattedMessages } from 'error-capture'

addErrorCallback((data) => {
  const message = formattedMessages(data.message)
  // message 會包含 error 的 message 和 stack
})
```
