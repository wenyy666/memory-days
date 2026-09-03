<script setup lang="ts">
import { computed } from 'vue'
import type { MemorialView } from '@/types/memorial'
import { today } from '@/utils/date'
import { formatLunar, solarToLunar } from '@/utils/lunar'

const props = defineProps<{
  nextItem?: MemorialView | null
}>()

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const now = today()
const dateLine = `${now.getMonth() + 1}月${now.getDate()}日 周${WEEKDAYS[now.getDay()]}`
const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate())
const lunarLine = `农历${formatLunar(lunar, false)}`

const greeting = computed(() => {
  const item = props.nextItem
  if (item?.isToday && !item.isExpired) return `今天，是「${item.name}」。`
  if (item && !item.isExpired && item.daysUntil > 0) {
    return `「${item.name}」还有 ${item.daysUntil} 天。`
  }
  const hour = new Date().getHours()
  if (hour < 11) return '早安。把想记住的日子，轻轻写下。'
  if (hour < 18) return '日子会走，想念可以留下。'
  return '夜晚适合把想念写下来。'
})
</script>

<template>
  <view class="home-hero">
    <view class="home-hero__mark" />
    <text class="home-hero__date">{{ dateLine }}</text>
    <text class="home-hero__lunar">{{ lunarLine }}</text>
    <text class="home-hero__greet">{{ greeting }}</text>
  </view>
</template>

<style scoped>
.home-hero {
  position: relative;
  padding: 28rpx 8rpx 36rpx;
}

.home-hero__mark {
  width: 48rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #b54738;
  margin-bottom: 20rpx;
}

.home-hero__date {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #3d2c26;
  letter-spacing: 2rpx;
  line-height: 1.2;
}

.home-hero__lunar {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #c48a52;
  letter-spacing: 4rpx;
}

.home-hero__greet {
  display: block;
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #9a7366;
  line-height: 1.7;
}
</style>
