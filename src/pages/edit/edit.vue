<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref, shallowRef } from 'vue'
import MemorialForm from '@/components/MemorialForm.vue'
import { useAds } from '@/composables/useAds'
import { useMemorials } from '@/composables/useMemorials'
import type { Memorial, MemorialDraft } from '@/types/memorial'

const { getById, saveMemorial, canAdd, count, loadMemorials } = useMemorials()
const { hasRewardAd, watchRewardAndUnlock } = useAds()
const memorial = ref<Memorial | null>(null)
const ready = shallowRef(false)

onLoad(async (query) => {
  await loadMemorials()
  const id = query?.id as string | undefined
  if (id) {
    memorial.value = await getById(id)
    uni.setNavigationBarTitle({ title: '编辑纪念日' })
  } else {
    uni.setNavigationBarTitle({ title: '新增纪念日' })
  }
  ready.value = true
})

async function onSubmit(payload: MemorialDraft) {
  try {
    if (!payload.id && !canAdd(count.value)) {
      if (!hasRewardAd.value) {
        uni.showToast({ title: '已达可保存条数', icon: 'none' })
        return
      }
      const ok = await watchRewardAndUnlock()
      if (!ok || !canAdd(count.value)) return
    }
    await saveMemorial(payload)
    uni.showToast({ title: '已保存', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (error) {
    if ((error as Error).name === 'QUOTA_EXCEEDED') {
      if (!hasRewardAd.value) {
        uni.showToast({ title: '已达可保存条数', icon: 'none' })
        return
      }
      const ok = await watchRewardAndUnlock()
      if (ok) {
        try {
          await saveMemorial(payload)
          uni.showToast({ title: '已保存', icon: 'success' })
          setTimeout(() => uni.navigateBack(), 300)
        } catch {
          uni.showToast({ title: '仍超出可保存条数', icon: 'none' })
        }
      }
      return
    }
    uni.showToast({ title: (error as Error).message || '保存失败', icon: 'none' })
  }
}
</script>

<template>
  <view class="page">
    <MemorialForm v-if="ready" :memorial="memorial" @submit="onSubmit" />
  </view>
</template>
