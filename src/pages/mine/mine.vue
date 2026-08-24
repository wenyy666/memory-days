<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import { useAds } from '@/composables/useAds'
import { useMemorials } from '@/composables/useMemorials'
import { useShare } from '@/composables/useShare'
import { appEnv } from '@/config/env'

const {
  count,
  limit,
  atMax,
  freeLimit,
  unlockedLimit,
  loadMemorials,
  clearAll
} = useMemorials()
const { bannerId, hasRewardAd, hasBannerAd, watchRewardAndUnlock } = useAds()
useShare()

const quotaDesc = computed(() => {
  if (atMax.value) {
    return `已达上限 ${unlockedLimit} 条，无法再增加`
  }
  if (!hasRewardAd.value) {
    return `当前最多 ${limit.value} 条`
  }
  return `当前最多 ${limit.value} 条。免费 ${freeLimit} 条，看完一次视频增加 1 条，最多 ${unlockedLimit} 条`
})

function goPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/privacy' })
}

async function onUnlock() {
  if (!hasRewardAd.value) return
  if (atMax.value) {
    uni.showToast({ title: `已达上限 ${unlockedLimit} 条`, icon: 'none' })
    return
  }
  const confirmed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '增加 1 条额度',
      content: `完整观看后，可保存条数从 ${limit.value} 增加到 ${limit.value + 1}，最多 ${unlockedLimit} 条。`,
      confirmText: '去观看',
      success: (res) => resolve(Boolean(res.confirm)),
      fail: () => resolve(false)
    })
  })
  if (!confirmed) return
  await watchRewardAndUnlock()
  await loadMemorials()
}

function onClear() {
  uni.showModal({
    title: '清除全部数据',
    content: '将删除本机全部纪念日和额度记录，且无法恢复。',
    confirmColor: '#C45C4A',
    confirmText: '清除',
    success: async (res) => {
      if (!res.confirm) return
      await clearAll()
      uni.showToast({ title: '已清除', icon: 'success' })
    }
  })
}

onShow(() => {
  void loadMemorials()
})
</script>

<template>
  <view class="page">
    <view class="card hero">
      <text class="hero__name">{{ appEnv.appName }}</text>
      <text class="hero__quota">{{ count }} / {{ limit }}</text>
      <text class="hero__desc">{{ quotaDesc }}</text>
      <button
        v-if="hasRewardAd"
        class="hero__btn"
        :class="{ 'hero__btn--disabled': atMax }"
        @click="onUnlock"
      >
        {{ atMax ? '已达 20 条上限' : '观看视频增加 1 条' }}
      </button>
    </view>

    <view class="card menu">
      <view class="menu__item" @click="goPrivacy">
        <text>隐私说明</text>
        <text class="menu__arrow">›</text>
      </view>
      <view class="menu__item menu__item--danger" @click="onClear">
        <text>清除本机数据</text>
        <text class="menu__arrow">›</text>
      </view>
    </view>

    <text class="footnote">数据默认保存在本机。{{ hasRewardAd ? '广告用于扩展可保存条数，不强制观看。' : '' }}</text>
    <BannerAd v-if="hasBannerAd" :unit-id="bannerId" />
  </view>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 48rpx 32rpx 40rpx;
}

.hero__name {
  display: block;
  font-size: 28rpx;
  color: #8a8580;
}

.hero__quota {
  display: block;
  margin-top: 12rpx;
  font-size: 72rpx;
  font-weight: 700;
  color: #2f6b5a;
  line-height: 1;
}

.hero__desc {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #8a8580;
  line-height: 1.6;
}

.hero__btn {
  margin-top: 32rpx;
  background: #2f6b5a;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.hero__btn::after {
  border: none;
}

.hero__btn--disabled {
  background: #c8c4be;
}

.menu {
  margin-top: 20rpx;
  padding: 0 28rpx;
}

.menu__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 96rpx;
  border-bottom: 1rpx solid #f0eeea;
  font-size: 30rpx;
}

.menu__item:last-child {
  border-bottom: none;
}

.menu__item--danger {
  color: #c45c4a;
}

.menu__arrow {
  color: #c4c0ba;
  font-size: 36rpx;
}

.footnote {
  display: block;
  margin: 24rpx 8rpx 0;
  font-size: 22rpx;
  color: #9a958f;
  line-height: 1.6;
}
</style>
