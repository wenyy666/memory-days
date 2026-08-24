import { computed, readonly, ref } from 'vue'
import { QUOTA } from '@/config/env'
import { getStore } from '@/services/storage'
import { normalizeQuota, type Quota } from '@/types/memorial'

const quota = ref<Quota>({ extraSlots: 0 })
const loaded = ref(false)

export function useQuota() {
  const store = getStore()
  const maxExtra = QUOTA.unlockedLimit - QUOTA.freeLimit
  const extraSlots = computed(() => Math.min(quota.value.extraSlots, maxExtra))
  const limit = computed(() => QUOTA.freeLimit + extraSlots.value)
  const atMax = computed(() => limit.value >= QUOTA.unlockedLimit)
  const unlocked = computed(() => extraSlots.value > 0)

  async function loadQuota() {
    quota.value = normalizeQuota(await store.getQuota())
    loaded.value = true
    return quota.value
  }

  function canAdd(currentCount: number): boolean {
    return currentCount < limit.value
  }

  async function addExtraSlot() {
    const stored = normalizeQuota(await store.getQuota())
    if (stored.extraSlots >= maxExtra) {
      quota.value = { extraSlots: maxExtra }
      return { added: false, limit: QUOTA.unlockedLimit }
    }
    const next: Quota = {
      extraSlots: stored.extraSlots + QUOTA.slotPerAd
    }
    await store.setQuota(next)
    quota.value = next
    return { added: true, limit: QUOTA.freeLimit + next.extraSlots }
  }

  return {
    quota: readonly(quota),
    loaded: readonly(loaded),
    extraSlots,
    unlocked,
    atMax,
    limit,
    freeLimit: QUOTA.freeLimit,
    unlockedLimit: QUOTA.unlockedLimit,
    loadQuota,
    canAdd,
    addExtraSlot
  }
}
