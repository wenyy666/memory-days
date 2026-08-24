/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_CLOUD_ENABLED: string
  readonly VITE_CLOUD_ENV_ID: string
  readonly VITE_AD_REWARD_ID: string
  readonly VITE_AD_BANNER_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
