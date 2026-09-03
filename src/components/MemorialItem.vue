<script setup lang="ts">
import { computed } from 'vue'
import type { MemorialView } from '@/types/memorial'

const props = defineProps<{
  item: MemorialView
  showExtend: boolean
  featured?: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  remove: [id: string]
  extend: [id: string]
}>()

const swipeOptions = computed(() => [
  ...(props.showExtend ? [{ text: '延续', style: { backgroundColor: '#c48a52' } }] : []),
  { text: '编辑', style: { backgroundColor: '#a86b4a' } },
  { text: '删除', style: { backgroundColor: '#b54738' } }
])

const badgeText = computed(() => {
  if (props.item.isExpired) return '已到期'
  if (props.item.isToday) return '就是今天'
  return props.featured ? '最近的日子' : ''
})

const countText = computed(() => {
  if (props.item.isToday) return '今'
  return String(Math.abs(props.item.daysUntil))
})

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
          'memorial-item--featured': featured,
          'memorial-item--today': item.isToday && !item.isExpired,
          'memorial-item--expired': item.isExpired
        }"
        @click="emit('edit', item.id)"
      >
        <view v-if="badgeText" class="memorial-item__badge">
          <text class="memorial-item__badge-text">{{ badgeText }}</text>
        </view>

        <view class="memorial-item__row">
          <view class="memorial-item__body">
            <text class="memorial-item__name">{{ item.name }}</text>
            <text class="memorial-item__date">{{ item.dateLabel }}</text>
            <text v-if="item.note" class="memorial-item__note">{{ item.note }}</text>
            <text
              v-if="showExtend"
              class="memorial-item__valid"
              :class="{ 'memorial-item__valid--expired': item.isExpired }"
              @click.stop="emit('extend', item.id)"
            >{{ item.validLabel }} · 再续一段</text>
          </view>

          <view
            class="memorial-item__count"
            :class="{ 'memorial-item__count--today': item.isToday && !item.isExpired }"
          >
            <text class="memorial-item__days">{{ countText }}</text>
            <text class="memorial-item__unit">{{ item.isToday ? '就是今天' : item.daysUntil > 0 ? '天后' : '天前' }}</text>
          </view>
        </view>
      </view>
    </u-swipe-action-item>
  </u-swipe-action>
</template>

<style scoped>
.memorial-item {
  position: relative;
  background: #fff8f1;
  border-radius: 28rpx;
  padding: 28rpx 28rpx 26rpx;
  margin-bottom: 18rpx;
  border: 1rpx solid rgba(180, 120, 86, 0.16);
  overflow: hidden;
}

.memorial-item--featured {
  padding: 32rpx 32rpx 30rpx;
  background: linear-gradient(165deg, #fff4ea 0%, #fbe3d2 100%);
  box-shadow: 0 18rpx 36rpx rgba(140, 62, 40, 0.08);
}

.memorial-item--today {
  background: linear-gradient(165deg, #fde8dc 0%, #f6d0c0 100%);
  border-color: rgba(181, 71, 56, 0.28);
}

.memorial-item--expired {
  opacity: 0.72;
}

.memorial-item__badge {
  margin-bottom: 12rpx;
}

.memorial-item__badge-text {
  font-size: 22rpx;
  color: #b54738;
  letter-spacing: 4rpx;
}

.memorial-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.memorial-item__body {
  flex: 1;
  min-width: 0;
  padding-right: 20rpx;
}

.memorial-item__name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #3d2c26;
  letter-spacing: 1rpx;
}

.memorial-item--featured .memorial-item__name {
  font-size: 40rpx;
}

.memorial-item__date,
.memorial-item__note {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #9a7366;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memorial-item__valid {
  display: inline-block;
  margin-top: 14rpx;
  font-size: 22rpx;
  color: #c48a52;
}

.memorial-item__valid--expired {
  color: #b54738;
}

.memorial-item__count {
  min-width: 140rpx;
  text-align: right;
}

.memorial-item__days {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #b54738;
  line-height: 1;
  font-family: 'Times New Roman', 'Songti SC', serif;
}

.memorial-item--featured .memorial-item__days {
  font-size: 72rpx;
}

.memorial-item__count--today .memorial-item__days {
  font-size: 52rpx;
  letter-spacing: 4rpx;
}

.memorial-item__unit {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #9a7366;
  letter-spacing: 2rpx;
}
</style>
