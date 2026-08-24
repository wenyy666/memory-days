declare module 'uview-plus' {
  import type { Plugin } from 'vue'
  const uviewPlus: Plugin
  export default uviewPlus
}

declare const wx: {
  cloud?: {
    init: (opts: { env: string; traceUser?: boolean }) => void
    database: () => unknown
    callFunction: (opts: { name: string }) => Promise<{ result: { openid?: string } }>
  }
}
