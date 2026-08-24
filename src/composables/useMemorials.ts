import { computed, readonly, ref } from 'vue'
import { nextExpiresAt } from '@/config/env'
import { useQuota } from '@/composables/useQuota'
import { getStore } from '@/services/storage'
import type { Memorial, MemorialDraft, MemorialView } from '@/types/memorial'
import { buildMemorialView } from '@/utils/countdown'
import { createId } from '@/utils/id'

const list = ref<Memorial[]>([])

function sortViews(views: MemorialView[]): MemorialView[] {
  return [...views].sort((a, b) => {
    const aKey = a.daysUntil >= 0 ? a.daysUntil : 100000 + Math.abs(a.daysUntil)
    const bKey = b.daysUntil >= 0 ? b.daysUntil : 100000 + Math.abs(b.daysUntil)
    return aKey - bKey
  })
}

export function useMemorials() {
  const store = getStore()
  const quotaApi = useQuota()
  const views = computed(() => sortViews(list.value.map((item) => buildMemorialView(item))))

  async function loadMemorials() {
    await quotaApi.loadQuota()
    const rows = await store.list()
    const patched: Memorial[] = []
    for (const row of rows) {
      if (typeof row.expiresAt === 'number' && row.expiresAt > 0) {
        patched.push(row)
        continue
      }
      const next = { ...row, expiresAt: nextExpiresAt() }
      await store.save(next)
      patched.push(next)
    }
    list.value = patched
    return list.value
  }

  async function getById(id: string) {
    if (!list.value.length) await loadMemorials()
    return list.value.find((item) => item.id === id) || null
  }

  function assertCanCreate(isEdit: boolean) {
    if (isEdit) return
    if (!quotaApi.canAdd(list.value.length)) {
      const err = new Error('QUOTA_EXCEEDED')
      err.name = 'QUOTA_EXCEEDED'
      throw err
    }
  }

  async function saveMemorial(input: MemorialDraft) {
    const isEdit = Boolean(input.id)
    if (!list.value.length) await loadMemorials()
    assertCanCreate(isEdit)
    const now = Date.now()
    const current = input.id ? list.value.find((item) => item.id === input.id) : null
    const item: Memorial = {
      id: input.id || createId(),
      name: input.name.trim(),
      calendar: input.calendar,
      year: input.year,
      month: input.month,
      day: input.day,
      isLeapMonth: input.calendar === 'lunar' ? Boolean(input.isLeapMonth) : false,
      yearlyRepeat: input.yearlyRepeat,
      note: input.note.trim(),
      expiresAt: current?.expiresAt || nextExpiresAt(null, now),
      createdAt: current?.createdAt || now,
      updatedAt: now
    }
    await store.save(item)
    await loadMemorials()
    return item
  }

  async function extendMemorial(id: string) {
    const current = list.value.find((item) => item.id === id) || await getById(id)
    if (!current) return { extended: false, expiresAt: 0 }
    const next: Memorial = {
      ...current,
      expiresAt: nextExpiresAt(current.expiresAt),
      updatedAt: Date.now()
    }
    await store.save(next)
    await loadMemorials()
    return { extended: true, expiresAt: next.expiresAt }
  }

  async function removeMemorial(id: string) {
    await store.remove(id)
    await loadMemorials()
  }

  async function clearAll() {
    await store.clear()
    list.value = []
    await quotaApi.loadQuota()
  }

  return {
    list: readonly(list),
    views,
    count: computed(() => list.value.length),
    loadMemorials,
    getById,
    saveMemorial,
    extendMemorial,
    removeMemorial,
    clearAll,
    ...quotaApi
  }
}
