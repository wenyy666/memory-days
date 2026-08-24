<script setup lang="ts">
defineProps<{
  unitId: string
}>()
</script>

<template>
  <view v-if="unitId" class="banner-ad">
    <ad
      class="banner-ad__native"
      :unit-id="unitId"
      ad-type="banner"
    />
  </view>
</template>

<style scoped>
.banner-ad {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  z-index: 10;
  padding: 0 24rpx;
}

.banner-ad__native {
  width: 100%;
}
</style>
