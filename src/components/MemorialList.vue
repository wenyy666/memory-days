<script setup lang="ts">
import { computed } from 'vue'
import MemorialItem from '@/components/MemorialItem.vue'
import type { MemorialView } from '@/types/memorial'

const props = defineProps<{
  items: MemorialView[]
  showExtend: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
  extend: [id: string]
}>()

const featured = computed(() => props.items[0] || null)
const rest = computed(() => props.items.slice(1))
</script>

<template>
  <view class="memorial-list">
    <MemorialItem
      v-if="featured"
      :key="featured.id"
      :item="featured"
      :show-extend="showExtend"
      featured
      @edit="emit('edit', $event)"
      @remove="emit('remove', $event)"
      @extend="emit('extend', $event)"
    />

    <text v-if="rest.length" class="memorial-list__more">其余日子</text>

    <MemorialItem
      v-for="item in rest"
      :key="item.id"
      :item="item"
      :show-extend="showExtend"
      @edit="emit('edit', $event)"
      @remove="emit('remove', $event)"
      @extend="emit('extend', $event)"
    />
  </view>
</template>

<style scoped>
.memorial-list__more {
  display: block;
  margin: 12rpx 8rpx 16rpx;
  font-size: 22rpx;
  color: #c48a52;
  letter-spacing: 4rpx;
}
</style>
