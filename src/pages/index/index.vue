<script setup lang="ts">
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import EmptyState from '@/components/EmptyState.vue'
import HomeHero from '@/components/HomeHero.vue'
import MemorialList from '@/components/MemorialList.vue'
import QuotaBar from '@/components/QuotaBar.vue'
import { useAds } from '@/composables/useAds'
import { useMemorials } from '@/composables/useMemorials'
import { shareMessage, shareTimeline, useShare } from '@/composables/useShare'

const {
  views,
  count,
  limit,
  atMax,
  loadMemorials,
  removeMemorial,
  extendMemorial,
  canAdd
} = useMemorials()
const { bannerId, hasRewardAd, hasBannerAd, watchRewardAndUnlock, watchRewardAndExtend } = useAds()
useShare()
onShareAppMessage(() => shareMessage())
onShareTimeline(() => shareTimeline())

const isEmpty = computed(() => count.value === 0)

function goEdit(id?: string) {
  const query = id ? `?id=${id}` : ''
  uni.navigateTo({ url: `/pages/edit/edit${query}` })
}

async function onAdd() {
  if (!canAdd(count.value)) {
    if (!hasRewardAd.value) {
      uni.showToast({ title: `当前最多保存 ${limit.value} 条`, icon: 'none' })
      return
    }
    const confirmed = await confirmUnlock()
    if (!confirmed) return
    const ok = await watchRewardAndUnlock()
    if (!ok) return
    await loadMemorials()
    if (!canAdd(count.value)) return
  }
  goEdit()
}

function confirmUnlock(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.showModal({
      title: '多记一个日子',
      content: '免费可以记下 3 个。看完一段视频，就能再多写一条，最多 20 个。已经记下的不会消失。',
      confirmText: '去看一看',
      success: (res) => resolve(Boolean(res.confirm)),
      fail: () => resolve(false)
    })
  })
}

async function onUnlock() {
  if (!hasRewardAd.value) return
  if (atMax.value) {
    uni.showToast({ title: '已达上限 20 条', icon: 'none' })
    return
  }
  const confirmed = await confirmUnlock()
  if (!confirmed) return
  await watchRewardAndUnlock()
  await loadMemorials()
}

async function onExtend(id: string) {
  if (!hasRewardAd.value) return
  const current = views.value.find((item) => item.id === id)
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '为这条日子再续一段',
      content: current
        ? `看完视频后，只把「${current.name}」再延长 30 天，其他日子不动。`
        : '看完视频后，只把这一条再延长 30 天。',
      confirmText: '去看一看',
      success: (res) => resolve(Boolean(res.confirm)),
      fail: () => resolve(false)
    })
  })
  if (!confirmed) return
  const ok = await watchRewardAndExtend(async () => {
    const result = await extendMemorial(id)
    if (!result.extended) {
      uni.showToast({ title: '记录不存在', icon: 'none' })
      return false
    }
    uni.showToast({ title: '已为这条延续 30 天', icon: 'success' })
    return true
  })
  if (ok) await loadMemorials()
}

function onRemove(id: string) {
  uni.showModal({
    title: '删除这个日子',
    content: '删掉后无法恢复，确定吗？',
    confirmColor: '#B54738',
    success: async (res) => {
      if (!res.confirm) return
      await removeMemorial(id)
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  })
}

onShow(() => {
  void loadMemorials()
})
</script>

<template>
  <view class="page">
    <HomeHero :next-item="views[0] || null" />

    <QuotaBar
      :used="count"
      :limit="limit"
      :at-max="atMax"
      :show-reward="hasRewardAd"
      @unlock="onUnlock"
    />

    <EmptyState
      v-if="isEmpty"
      title="这一页还空着"
      desc="生日、相识，或只是对你很重要的一天。写下来，以后打开就能看见还要多久。"
      action-text="写下第一个日子"
      @action="onAdd"
    />

    <MemorialList
      v-else
      :items="views"
      :show-extend="hasRewardAd"
      @edit="goEdit"
      @remove="onRemove"
      @extend="onExtend"
    />

    <view v-if="!isEmpty" class="fab" @click="onAdd">
      <text class="fab__plus">记</text>
    </view>

    <BannerAd v-if="hasBannerAd" :unit-id="bannerId" />
  </view>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 40rpx;
  bottom: calc(230rpx + env(safe-area-inset-bottom));
  width: 108rpx;
  height: 108rpx;
  border-radius: 54rpx;
  background: radial-gradient(circle at 32% 28%, #d46858, #b54738 64%, #8c3a32);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 28rpx rgba(140, 50, 40, 0.28);
  z-index: 9;
}

.fab__plus {
  color: #fff4ea;
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  line-height: 1;
}
</style>
