import type { Memorial, Quota } from '@/types/memorial'
import { normalizeQuota } from '@/types/memorial'
import { STORAGE_KEYS, type StorageAdapter } from '@/services/storage/types'

function read<T>(key: string, fallback: T): T {
  const value = uni.getStorageSync(key)
  if (value === '' || value === undefined || value === null) return fallback
  return value as T
}

export const localStore: StorageAdapter = {
  async list() {
    return read<Memorial[]>(STORAGE_KEYS.memorials, [])
  },

  async save(item: Memorial) {
    const list = read<Memorial[]>(STORAGE_KEYS.memorials, [])
    const index = list.findIndex((row) => row.id === item.id)
    if (index >= 0) {
      list[index] = item
    } else {
      list.unshift(item)
    }
    uni.setStorageSync(STORAGE_KEYS.memorials, list)
  },

  async remove(id: string) {
    const list = read<Memorial[]>(STORAGE_KEYS.memorials, []).filter((row) => row.id !== id)
    uni.setStorageSync(STORAGE_KEYS.memorials, list)
  },

  async getQuota() {
    return normalizeQuota(read<unknown>(STORAGE_KEYS.quota, { extraSlots: 0 }))
  },

  async setQuota(quota: Quota) {
    uni.setStorageSync(STORAGE_KEYS.quota, quota)
  },

  async clear() {
    uni.removeStorageSync(STORAGE_KEYS.memorials)
    uni.removeStorageSync(STORAGE_KEYS.quota)
  }
}
