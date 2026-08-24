<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import { useAds } from '@/composables/useAds'
import { useShare } from '@/composables/useShare'
import { diffDays, formatSolar, today } from '@/utils/date'
import { formatLunar, lunarToSolar, solarToLunar } from '@/utils/lunar'

useShare('日期换算')
const { bannerId, hasBannerAd } = useAds()

const now = today()
const startValue = ref(now.getTime())
const endValue = ref(now.getTime())
const showStart = shallowRef(false)
const showEnd = shallowRef(false)

const convertMode = shallowRef<'solarToLunar' | 'lunarToSolar'>('solarToLunar')
const convertSolar = ref(now.getTime())
const showConvertSolar = shallowRef(false)
const lunarYear = shallowRef(now.getFullYear())
const lunarMonth = shallowRef(now.getMonth() + 1)
const lunarDay = shallowRef(now.getDate())
const lunarLeap = shallowRef(false)
const showLunarPicker = shallowRef(false)

const years = Array.from({ length: 201 }, (_, i) => String(1900 + i))
const lunarColumns = computed(() => {
  const months = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const days = Array.from({ length: 30 }, (_, i) => String(i + 1))
  return [years, months, days]
})

const startDate = computed(() => new Date(startValue.value))
const endDate = computed(() => new Date(endValue.value))
const dayGap = computed(() => diffDays(startDate.value, endDate.value))
const absGap = computed(() => Math.abs(dayGap.value))

const convertSolarDate = computed(() => new Date(convertSolar.value))
const convertResult = computed(() => {
  try {
    if (convertMode.value === 'solarToLunar') {
      const lunar = solarToLunar(
        convertSolarDate.value.getFullYear(),
        convertSolarDate.value.getMonth() + 1,
        convertSolarDate.value.getDate()
      )
      return `农历 ${formatLunar(lunar)}`
    }
    const solar = lunarToSolar(lunarYear.value, lunarMonth.value, lunarDay.value, lunarLeap.value)
    return `公历 ${formatSolar(solar.year, solar.month, solar.day)}`
  } catch (error) {
    return (error as Error).message
  }
})

function formatPickerDate(value: number) {
  const date = new Date(value)
  return formatSolar(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function onLeapChange(event: Event) {
  lunarLeap.value = Boolean((event as unknown as { detail: { value: boolean } }).detail.value)
}

function onLunarConfirm(payload: { indexs?: number[] }) {
  const indexs = payload.indexs || [lunarYear.value - 1900, lunarMonth.value - 1, lunarDay.value - 1]
  lunarYear.value = 1900 + indexs[0]
  lunarMonth.value = indexs[1] + 1
  lunarDay.value = indexs[2] + 1
  showLunarPicker.value = false
}
</script>

<template>
  <view class="page">
    <view class="card block">
      <text class="section-title">计算两个日期相差天数</text>
      <view class="row" @click="showStart = true">
        <text class="muted">起始日期</text>
        <text>{{ formatPickerDate(startValue) }}</text>
      </view>
      <view class="row" @click="showEnd = true">
        <text class="muted">结束日期</text>
        <text>{{ formatPickerDate(endValue) }}</text>
      </view>
      <view class="result">
        <text class="result__num">{{ absGap }}</text>
        <text class="result__desc">
          相差 {{ absGap }} 天
          <text v-if="dayGap !== 0">，{{ dayGap > 0 ? '结束日更晚' : '结束日更早' }}</text>
        </text>
      </view>
    </view>

    <view class="card block">
      <text class="section-title">公历农历日期换算</text>
      <text class="hint">只输出对应日期，不提供宜忌、吉凶或其他测算内容。</text>
      <view class="field__tabs">
        <view
          class="field__tab"
          :class="{ 'field__tab--on': convertMode === 'solarToLunar' }"
          @click="convertMode = 'solarToLunar'"
        >公历 → 农历</view>
        <view
          class="field__tab"
          :class="{ 'field__tab--on': convertMode === 'lunarToSolar' }"
          @click="convertMode = 'lunarToSolar'"
        >农历 → 公历</view>
      </view>

      <view v-if="convertMode === 'solarToLunar'" class="row" @click="showConvertSolar = true">
        <text class="muted">公历日期</text>
        <text>{{ formatPickerDate(convertSolar) }}</text>
      </view>
      <view v-else class="row" @click="showLunarPicker = true">
        <text class="muted">农历日期</text>
        <text>{{ lunarYear }}年{{ lunarLeap ? '闰' : '' }}{{ lunarMonth }}月{{ lunarDay }}日</text>
      </view>
      <view v-if="convertMode === 'lunarToSolar'" class="leap-row">
        <text class="muted">按闰月换算</text>
        <switch :checked="lunarLeap" color="#2F6B5A" @change="onLeapChange" />
      </view>
      <view class="result">
        <text class="result__desc">{{ convertResult }}</text>
      </view>
    </view>

    <BannerAd v-if="hasBannerAd" :unit-id="bannerId" />

    <u-datetime-picker
      :show="showStart"
      v-model="startValue"
      mode="date"
      @confirm="showStart = false"
      @cancel="showStart = false"
      @close="showStart = false"
    />
    <u-datetime-picker
      :show="showEnd"
      v-model="endValue"
      mode="date"
      @confirm="showEnd = false"
      @cancel="showEnd = false"
      @close="showEnd = false"
    />
    <u-datetime-picker
      :show="showConvertSolar"
      v-model="convertSolar"
      mode="date"
      @confirm="showConvertSolar = false"
      @cancel="showConvertSolar = false"
      @close="showConvertSolar = false"
    />
    <u-picker
      :show="showLunarPicker"
      :columns="lunarColumns"
      @confirm="onLunarConfirm"
      @cancel="showLunarPicker = false"
      @close="showLunarPicker = false"
    />
  </view>
</template>

<style scoped>
.block {
  margin-bottom: 20rpx;
}

.row,
.leap-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f0eeea;
}

.hint {
  display: block;
  font-size: 22rpx;
  color: #9a958f;
  margin-bottom: 16rpx;
  line-height: 1.5;
}

.result {
  padding-top: 24rpx;
}

.result__num {
  display: block;
  font-size: 64rpx;
  font-weight: 700;
  color: #2f6b5a;
  line-height: 1;
}

.result__desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #5c5854;
}

.field__tabs {
  display: flex;
  background: #f4f2ee;
  border-radius: 12rpx;
  padding: 6rpx;
  margin-bottom: 8rpx;
}

.field__tab {
  flex: 1;
  text-align: center;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #6b6660;
}

.field__tab--on {
  background: #fff;
  color: #2f6b5a;
  font-weight: 600;
}
</style>
