<script setup lang="ts">
import MemorialItem from '@/components/MemorialItem.vue'
import type { MemorialView } from '@/types/memorial'

defineProps<{
  items: MemorialView[]
  showExtend: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
  extend: [id: string]
}>()
</script>

<template>
  <view class="memorial-list">
    <MemorialItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :show-extend="showExtend"
      @edit="emit('edit', $event)"
      @remove="emit('remove', $event)"
      @extend="emit('extend', $event)"
    />
  </view>
</template>
