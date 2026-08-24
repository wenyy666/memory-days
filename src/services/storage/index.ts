import { appEnv } from '@/config/env'
import { cloudStore } from '@/services/storage/cloud'
import { localStore } from '@/services/storage/local'
import type { StorageAdapter } from '@/services/storage/types'

export function getStore(): StorageAdapter {
  if (appEnv.cloudEnabled && appEnv.cloudEnvId) {
    return cloudStore
  }
  return localStore
}

export type { StorageAdapter } from '@/services/storage/types'
