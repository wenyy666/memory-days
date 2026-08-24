<script setup lang="ts">
import { computed } from 'vue'
import type { MemorialView } from '@/types/memorial'

const props = defineProps<{
  item: MemorialView
  showExtend: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
  extend: [id: string]
}>()

const swipeOptions = computed(() => [
  ...(props.showExtend ? [{ text: '延续', style: { backgroundColor: '#c48a3a' } }] : []),
  { text: '编辑', style: { backgroundColor: '#3d7a68' } },
  { text: '删除', style: { backgroundColor: '#c45c4a' } }
])

function onSwipeClick(event: { index: number }) {
  const offset = props.showExtend ? 1 : 0
  if (props.showExtend && event.index === 0) {
    emit('extend', props.item.id)
    return
  }
  if (event.index === offset) {
    emit('edit', props.item.id)
    return
  }
  emit('remove', props.item.id)
}
</script>

<template>
  <u-swipe-action>
    <u-swipe-action-item :options="swipeOptions" @click="onSwipeClick">
      <view
        class="memorial-item"
        :class="{
          'memorial-item--today': item.isToday && !item.isExpired,
          'memorial-item--expired': item.isExpired
        }"
        @click="emit('edit', item.id)"
      >
        <view class="memorial-item__body">
          <text class="memorial-item__name">{{ item.name }}</text>
          <text class="memorial-item__date">{{ item.dateLabel }}</text>
          <text v-if="item.note" class="memorial-item__note">{{ item.note }}</text>
          <text
            v-if="showExtend"
            class="memorial-item__valid"
            :class="{ 'memorial-item__valid--expired': item.isExpired }"
            @click.stop="emit('extend', item.id)"
          >{{ item.validLabel }} · 延续时长</text>
        </view>
        <view class="memorial-item__count" :class="{ 'memorial-item__count--today': item.isToday && !item.isExpired }">
          <text class="memorial-item__days">{{ item.isToday ? '今天' : Math.abs(item.daysUntil) }}</text>
          <text class="memorial-item__unit">{{ item.countdownLabel }}</text>
        </view>
      </view>
    </u-swipe-action-item>
  </u-swipe-action>
</template>

<style scoped>
.memorial-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
  border-left: 8rpx solid transparent;
}

.memorial-item--today {
  border-left-color: #c45c4a;
  background: #fff8f6;
}

.memorial-item--expired {
  opacity: 0.72;
}

.memorial-item__body {
  flex: 1;
  min-width: 0;
  padding-right: 20rpx;
}

.memorial-item__name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2328;
}

.memorial-item__date,
.memorial-item__note {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #8a8580;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memorial-item__valid {
  display: inline-block;
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #2f6b5a;
}

.memorial-item__valid--expired {
  color: #c45c4a;
}

.memorial-item__count {
  min-width: 160rpx;
  text-align: right;
}

.memorial-item__days {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #2f6b5a;
  line-height: 1.1;
}

.memorial-item__count--today .memorial-item__days {
  color: #c45c4a;
}

.memorial-item__unit {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8a8580;
}
</style>
