<script setup lang="ts">
defineProps<{
  title: string
  desc: string
  actionText: string
}>()

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <view class="empty-state card">
    <text class="empty-state__title">{{ title }}</text>
    <text class="empty-state__desc">{{ desc }}</text>
    <button class="empty-state__btn" hover-class="empty-state__btn--hover" @click="emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>

<style scoped>
.empty-state {
  margin-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64rpx 40rpx;
}

.empty-state__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2328;
}

.empty-state__desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #8a8580;
  line-height: 1.6;
}

.empty-state__btn {
  margin-top: 40rpx;
  width: 320rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #2f6b5a;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  border: none;
}

.empty-state__btn--hover {
  opacity: 0.88;
}

.empty-state__btn::after {
  border: none;
}
</style>
