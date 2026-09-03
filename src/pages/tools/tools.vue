<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { computed, ref, shallowRef } from 'vue'
import BannerAd from '@/components/BannerAd.vue'
import { useAds } from '@/composables/useAds'
import { shareMessage, shareTimeline, useShare } from '@/composables/useShare'
import { diffDays, formatSolar, today } from '@/utils/date'
import { formatLunar, lunarToSolar, solarToLunar } from '@/utils/lunar'

useShare()
onShareAppMessage(() => shareMessage('日期换算'))
onShareTimeline(() => shareTimeline('日期换算'))
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
    <text class="page-lead">有些距离，用天数量一量就好。</text>

    <view class="card block">
      <text class="section-title">两个日子，隔了多久</text>
      <view class="row" @click="showStart = true">
        <text class="muted">从这一天</text>
        <text class="row__value">{{ formatPickerDate(startValue) }}</text>
      </view>
      <view class="row" @click="showEnd = true">
        <text class="muted">到那一天</text>
        <text class="row__value">{{ formatPickerDate(endValue) }}</text>
      </view>
      <view class="result">
        <text class="result__num">{{ absGap }}</text>
        <text class="result__unit">天</text>
        <text class="result__desc">
          相差 {{ absGap }} 天
          <text v-if="dayGap !== 0">，{{ dayGap > 0 ? '后一天更晚' : '后一天更早' }}</text>
        </text>
      </view>
    </view>

    <view class="card block">
      <text class="section-title">公历 · 农历</text>
      <text class="hint">只换算日期本身，不看宜忌吉凶。</text>
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
        <text class="row__value">{{ formatPickerDate(convertSolar) }}</text>
      </view>
      <view v-else class="row" @click="showLunarPicker = true">
        <text class="muted">农历日期</text>
        <text class="row__value">{{ lunarYear }}年{{ lunarLeap ? '闰' : '' }}{{ lunarMonth }}月{{ lunarDay }}日</text>
      </view>
      <view v-if="convertMode === 'lunarToSolar'" class="leap-row">
        <text class="muted">按闰月换算</text>
        <switch :checked="lunarLeap" color="#B54738" @change="onLeapChange" />
      </view>
      <view class="result result--plain">
        <text class="result__desc result__desc--strong">{{ convertResult }}</text>
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
.page-lead {
  display: block;
  padding: 12rpx 8rpx 24rpx;
  font-size: 28rpx;
  color: #9a7366;
  letter-spacing: 1rpx;
  line-height: 1.6;
}

.block {
  margin-bottom: 24rpx;
}

.row,
.leap-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid rgba(141, 90, 62, 0.12);
}

.row__value {
  color: #3d2c26;
}

.hint {
  display: block;
  font-size: 22rpx;
  color: #c4a394;
  margin: 8rpx 0 16rpx;
  line-height: 1.6;
}

.result {
  padding-top: 28rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
}

.result--plain {
  display: block;
}

.result__num {
  font-size: 72rpx;
  font-weight: 700;
  color: #b54738;
  line-height: 1;
  font-family: 'Times New Roman', 'Songti SC', serif;
}

.result__unit {
  margin-left: 10rpx;
  font-size: 28rpx;
  color: #9a7366;
  letter-spacing: 2rpx;
}

.result__desc {
  display: block;
  width: 100%;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #9a7366;
}

.result__desc--strong {
  color: #3d2c26;
  font-size: 32rpx;
  letter-spacing: 1rpx;
}

.field__tabs {
  display: flex;
  background: #f3e0d0;
  border-radius: 16rpx;
  padding: 6rpx;
  margin-bottom: 8rpx;
}

.field__tab {
  flex: 1;
  text-align: center;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #9a7366;
}

.field__tab--on {
  background: #fff8f1;
  color: #b54738;
  font-weight: 600;
}
</style>
