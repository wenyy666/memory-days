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
  <view class="empty-state">
    <view class="empty-state__seal">
      <text class="empty-state__seal-text">记</text>
    </view>
    <text class="empty-state__title">{{ title }}</text>
    <text class="empty-state__desc">{{ desc }}</text>
    <button class="empty-state__btn" hover-class="empty-state__btn--hover" @click="emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>

<style scoped>
.empty-state {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 72rpx 40rpx 64rpx;
  background: #fff8f1;
  border-radius: 32rpx;
  border: 1rpx solid rgba(180, 120, 86, 0.16);
  box-shadow: 0 16rpx 40rpx rgba(120, 62, 36, 0.06);
}

.empty-state__seal {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: radial-gradient(circle at 32% 28%, #d46858, #b54738 62%, #8c3a32);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 20rpx rgba(140, 50, 40, 0.22);
  margin-bottom: 28rpx;
}

.empty-state__seal-text {
  color: #fff4ea;
  font-size: 36rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}

.empty-state__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #3d2c26;
  letter-spacing: 2rpx;
}

.empty-state__desc {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #9a7366;
  line-height: 1.8;
  max-width: 480rpx;
}

.empty-state__btn {
  margin-top: 44rpx;
  width: 360rpx;
  height: 84rpx;
  line-height: 84rpx;
  background: #b54738;
  color: #fff8f1;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  border-radius: 42rpx;
  border: none;
}

.empty-state__btn--hover {
  opacity: 0.9;
}

.empty-state__btn::after {
  border: none;
}
</style>
