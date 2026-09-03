<script setup lang="ts">
import { onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import { useAds } from '@/composables/useAds'
import { useMemorials } from '@/composables/useMemorials'
import { shareMessage, shareTimeline, useShare } from '@/composables/useShare'
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
onShareAppMessage(() => shareMessage())
onShareTimeline(() => shareTimeline())

const quotaDesc = computed(() => {
  if (atMax.value) {
    return `已经记下 ${unlockedLimit} 个日子，本子写满了。`
  }
  if (!hasRewardAd.value) {
    return `这一页，最多能写下 ${limit.value} 个日子。`
  }
  return `免费可写 ${freeLimit} 个。看完一段视频，可以再多记一条，最多 ${unlockedLimit} 个。`
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
      title: '多记一个日子',
      content: `看完后，可记下的日子从 ${limit.value} 个变成 ${limit.value + 1} 个，最多 ${unlockedLimit} 个。`,
      confirmText: '去看一看',
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
    title: '清除记下的日子',
    content: '会删掉这台手机上全部纪念日和额度，无法恢复。',
    confirmColor: '#B54738',
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
      <text class="hero__kicker">我的时光簿</text>
      <text class="hero__name">{{ appEnv.appName }}</text>
      <text class="hero__quota">已记下 {{ count }} 个日子</text>
      <text class="hero__desc">{{ quotaDesc }}</text>
      <button
        v-if="hasRewardAd"
        class="hero__btn"
        :class="{ 'hero__btn--disabled': atMax }"
        @click="onUnlock"
      >
        {{ atMax ? '本子已经写满' : '多记一条' }}
      </button>
    </view>

    <view class="card menu">
      <view class="menu__item" @click="goPrivacy">
        <text>隐私说明</text>
        <text class="menu__arrow">›</text>
      </view>
      <view class="menu__item menu__item--danger" @click="onClear">
        <text>清除记下的日子</text>
        <text class="menu__arrow">›</text>
      </view>
    </view>

    <text class="footnote">这些日子默认只留在这台手机上。{{ hasRewardAd ? '看一段视频，可以多写下一条。' : '' }}</text>
    <BannerAd v-if="hasBannerAd" :unit-id="bannerId" />
  </view>
</template>

<style scoped>
.hero {
  padding: 48rpx 36rpx 40rpx;
  background: linear-gradient(165deg, #fff4ea 0%, #f7dccb 100%);
}

.hero__kicker {
  display: block;
  font-size: 22rpx;
  color: #b54738;
  letter-spacing: 6rpx;
}

.hero__name {
  display: block;
  margin-top: 16rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #3d2c26;
  letter-spacing: 2rpx;
}

.hero__quota {
  display: block;
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #b54738;
}

.hero__desc {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9a7366;
  line-height: 1.7;
}

.hero__btn {
  margin-top: 32rpx;
  background: #b54738;
  color: #fff8f1;
  border-radius: 40rpx;
  font-size: 28rpx;
  letter-spacing: 2rpx;
}

.hero__btn::after {
  border: none;
}

.hero__btn--disabled {
  background: #d7b8aa;
}

.menu {
  margin-top: 24rpx;
  padding: 0 28rpx;
}

.menu__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 104rpx;
  border-bottom: 1rpx solid rgba(141, 90, 62, 0.12);
  font-size: 30rpx;
  color: #3d2c26;
}

.menu__item:last-child {
  border-bottom: none;
}

.menu__item--danger {
  color: #b54738;
}

.menu__arrow {
  color: #c4a394;
  font-size: 36rpx;
}

.footnote {
  display: block;
  margin: 28rpx 8rpx 0;
  font-size: 22rpx;
  color: #c4a394;
  line-height: 1.7;
}
</style>
