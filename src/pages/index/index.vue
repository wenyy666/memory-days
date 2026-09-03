<script setup lang="ts">
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import EmptyState from '@/components/EmptyState.vue'
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
      title: '增加 1 条额度',
      content: '免费最多保存 3 条。完整观看一次视频可增加 1 条，最多 20 条。已有记录不会删除。',
      confirmText: '去观看',
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
      title: '延续这条纪念日',
      content: current
        ? `看完视频后，仅「${current.name}」的有效期再延续 30 天，其他记录不变。`
        : '看完视频后，仅这条纪念日的有效期再延续 30 天。',
      confirmText: '去观看',
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
    title: '删除纪念日',
    content: '删除后无法恢复，确定删除吗？',
    confirmColor: '#C45C4A',
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
    <QuotaBar
      :used="count"
      :limit="limit"
      :at-max="atMax"
      :show-reward="hasRewardAd"
      @unlock="onUnlock"
    />

    <EmptyState
      v-if="isEmpty"
      title="还没有纪念日"
      desc="记录生日、相识或重要日子，打开就能看到还有几天。"
      action-text="添加第一条"
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
      <text class="fab__plus">+</text>
    </view>

    <BannerAd v-if="hasBannerAd" :unit-id="bannerId" />
  </view>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 40rpx;
  bottom: calc(230rpx + env(safe-area-inset-bottom));
  width: 104rpx;
  height: 104rpx;
  border-radius: 52rpx;
  background: #2f6b5a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 24rpx rgba(47, 107, 90, 0.28);
  z-index: 9;
}

.fab__plus {
  color: #fff;
  font-size: 56rpx;
  line-height: 1;
  margin-top: -6rpx;
}
</style>
