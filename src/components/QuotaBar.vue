<script setup lang="ts">
defineProps<{
  used: number
  limit: number
  atMax: boolean
  showReward: boolean
}>()

const emit = defineEmits<{
  unlock: []
}>()
</script>

<template>
  <view class="quota-bar card">
    <view class="quota-bar__main">
      <text class="quota-bar__count">{{ used }} / {{ limit }}</text>
      <text class="quota-bar__label">{{ atMax ? '已达上限' : limit > 3 ? '已扩展额度' : '免费额度' }}</text>
    </view>
    <text
      v-if="atMax"
      class="quota-bar__expire"
    >最多 20 条</text>
    <text
      v-else-if="showReward"
      class="quota-bar__action"
      @click="emit('unlock')"
    >看视频 +1 条</text>
  </view>
</template>

<style scoped>
.quota-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 28rpx;
  margin-bottom: 20rpx;
}

.quota-bar__count {
  font-size: 32rpx;
  font-weight: 700;
  color: #2f6b5a;
  margin-right: 12rpx;
}

.quota-bar__label,
.quota-bar__expire {
  font-size: 24rpx;
  color: #8a8580;
}

.quota-bar__action {
  font-size: 24rpx;
  color: #2f6b5a;
  padding: 8rpx 18rpx;
  border: 1rpx solid #2f6b5a;
  border-radius: 24rpx;
}
</style>
