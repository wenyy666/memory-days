import type { Memorial, Quota } from '@/types/memorial'

export interface StorageAdapter {
  list(): Promise<Memorial[]>
  save(item: Memorial): Promise<void>
  remove(id: string): Promise<void>
  getQuota(): Promise<Quota>
  setQuota(quota: Quota): Promise<void>
  clear(): Promise<void>
}

export const STORAGE_KEYS = {
  memorials: 'memorials',
  quota: 'quota'
} as const

export const COLLECTIONS = {
  memory: 'user_memory',
  quota: 'user_quota'
} as const
