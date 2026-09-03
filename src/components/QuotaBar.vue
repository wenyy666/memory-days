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
  <view class="quota-bar">
    <text class="quota-bar__copy">
      {{ atMax ? `已记下 ${used} 个日子 · 本子已经写满` : `已记下 ${used} 个日子 · 还能再写 ${Math.max(limit - used, 0)} 个` }}
    </text>
    <text
      v-if="atMax"
      class="quota-bar__hint"
    >最多 20 条</text>
    <text
      v-else-if="showReward"
      class="quota-bar__action"
      @click="emit('unlock')"
    >多记一条</text>
  </view>
</template>

<style scoped>
.quota-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rpx 8rpx 20rpx;
}

.quota-bar__copy,
.quota-bar__hint {
  font-size: 22rpx;
  color: #9a7366;
}

.quota-bar__action {
  font-size: 22rpx;
  color: #b54738;
  padding: 6rpx 0;
  letter-spacing: 1rpx;
}
</style>
