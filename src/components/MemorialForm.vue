<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { CalendarType, Memorial, MemorialDraft } from '@/types/memorial'
import { formatSolar, today } from '@/utils/date'
import {
  formatLunar,
  getLunarDayCount,
  getLunarMonthOptions,
  lunarDayLabel,
  lunarToSolar,
  solarToLunar
} from '@/utils/lunar'

const props = defineProps<{
  memorial?: Memorial | null
}>()

const emit = defineEmits<{
  submit: [payload: MemorialDraft]
}>()

const now = today()
const form = reactive({
  name: '',
  calendar: 'solar' as CalendarType,
  year: now.getFullYear(),
  month: now.getMonth() + 1,
  day: now.getDate(),
  isLeapMonth: false,
  yearlyRepeat: true,
  note: ''
})

const showSolarPicker = ref(false)
const showLunarPicker = ref(false)
const solarValue = ref(now.getTime())
const lunarIndex = ref<number[]>([now.getFullYear() - 1900, now.getMonth(), now.getDate() - 1])

const years = Array.from({ length: 201 }, (_, i) => String(1900 + i))

const lunarMonthOptions = computed(() => getLunarMonthOptions(form.year))
const lunarDayCount = computed(() => getLunarDayCount(form.year, form.month, form.isLeapMonth))

const lunarColumns = computed(() => {
  const months = lunarMonthOptions.value.map((item) => item.label)
  const days = Array.from({ length: lunarDayCount.value }, (_, i) => lunarDayLabel(i + 1))
  return [years, months, days]
})

const dateText = computed(() => {
  if (form.calendar === 'lunar') {
    return formatLunar({
      year: form.year,
      month: form.month,
      day: form.day,
      isLeap: form.isLeapMonth
    })
  }
  return formatSolar(form.year, form.month, form.day)
})

watch(
  () => props.memorial,
  (memorial) => {
    if (!memorial) return
    form.name = memorial.name
    form.calendar = memorial.calendar
    form.year = memorial.year
    form.month = memorial.month
    form.day = memorial.day
    form.isLeapMonth = Boolean(memorial.isLeapMonth)
    form.yearlyRepeat = memorial.yearlyRepeat
    form.note = memorial.note
    solarValue.value = new Date(memorial.year, memorial.month - 1, memorial.day).getTime()
    syncLunarIndex()
  },
  { immediate: true }
)

function syncLunarIndex() {
  const monthIndex = lunarMonthOptions.value.findIndex(
    (item) => item.month === form.month && item.isLeap === form.isLeapMonth
  )
  lunarIndex.value = [
    form.year - 1900,
    Math.max(monthIndex, 0),
    Math.max(form.day - 1, 0)
  ]
}

function switchCalendar(type: CalendarType) {
  if (form.calendar === type) return
  try {
    if (type === 'lunar') {
      const lunar = solarToLunar(form.year, form.month, form.day)
      form.year = lunar.year
      form.month = lunar.month
      form.day = lunar.day
      form.isLeapMonth = lunar.isLeap
    } else {
      const solar = lunarToSolar(form.year, form.month, form.day, form.isLeapMonth)
      form.year = solar.year
      form.month = solar.month
      form.day = solar.day
      form.isLeapMonth = false
      solarValue.value = new Date(solar.year, solar.month - 1, solar.day).getTime()
    }
    form.calendar = type
    syncLunarIndex()
  } catch {
    form.calendar = type
    uni.showToast({ title: '该日期无法换算，请重新选择', icon: 'none' })
  }
}

function onSolarConfirm(payload: { value?: number } | number) {
  const value = typeof payload === 'number' ? payload : Number(payload.value)
  const date = new Date(value)
  form.year = date.getFullYear()
  form.month = date.getMonth() + 1
  form.day = date.getDate()
  solarValue.value = value
  showSolarPicker.value = false
}

function onLunarConfirm(payload: { indexs?: number[]; index?: number[] }) {
  const indexs = payload.indexs || payload.index || lunarIndex.value
  const year = 1900 + indexs[0]
  const monthOption = getLunarMonthOptions(year)[indexs[1]]
  if (!monthOption) return
  const maxDay = getLunarDayCount(year, monthOption.month, monthOption.isLeap)
  form.year = year
  form.month = monthOption.month
  form.isLeapMonth = monthOption.isLeap
  form.day = Math.min(indexs[2] + 1, maxDay)
  showLunarPicker.value = false
}

function onLunarChange(payload: { indexs?: number[]; columnIndex?: number }) {
  const indexs = payload.indexs
  if (!indexs) return
  const year = 1900 + indexs[0]
  const months = getLunarMonthOptions(year)
  const monthOption = months[Math.min(indexs[1], months.length - 1)]
  if (!monthOption) return
  const maxDay = getLunarDayCount(year, monthOption.month, monthOption.isLeap)
  lunarIndex.value = [
    indexs[0],
    Math.min(indexs[1], months.length - 1),
    Math.min(indexs[2], maxDay - 1)
  ]
}

function openDatePicker() {
  if (form.calendar === 'lunar') {
    syncLunarIndex()
    showLunarPicker.value = true
    return
  }
  showSolarPicker.value = true
}

function onRepeatChange(event: Event) {
  form.yearlyRepeat = Boolean((event as unknown as { detail: { value: boolean } }).detail.value)
}

function onSubmit() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请填写事件名称', icon: 'none' })
    return
  }
  emit('submit', {
    id: props.memorial?.id,
    name: form.name,
    calendar: form.calendar,
    year: form.year,
    month: form.month,
    day: form.day,
    isLeapMonth: form.isLeapMonth,
    yearlyRepeat: form.yearlyRepeat,
    note: form.note
  })
}
</script>

<template>
  <view class="memorial-form">
    <view class="card form-card">
      <view class="field">
        <text class="field__label">事件名称</text>
        <input
          v-model="form.name"
          class="field__input"
          maxlength="20"
          placeholder="例如：相识、生日、结婚"
        />
      </view>

      <view class="field">
        <text class="field__label">日期类型</text>
        <view class="field__tabs">
          <view
            class="field__tab"
            :class="{ 'field__tab--on': form.calendar === 'solar' }"
            @click="switchCalendar('solar')"
          >公历</view>
          <view
            class="field__tab"
            :class="{ 'field__tab--on': form.calendar === 'lunar' }"
            @click="switchCalendar('lunar')"
          >农历</view>
        </view>
      </view>

      <view class="field" @click="openDatePicker">
        <text class="field__label">日期</text>
        <view class="field__value">
          <text>{{ dateText }}</text>
          <text class="field__arrow">选择</text>
        </view>
      </view>

      <view class="field field--row">
        <text class="field__label">每年重复</text>
        <switch :checked="form.yearlyRepeat" color="#2F6B5A" @change="onRepeatChange" />
      </view>

      <view class="field">
        <text class="field__label">备注</text>
        <textarea
          v-model="form.note"
          class="field__textarea"
          maxlength="80"
          placeholder="选填，仅自己可见"
        />
      </view>
    </view>

    <button class="submit-btn" @click="onSubmit">保存</button>

    <u-datetime-picker
      :show="showSolarPicker"
      v-model="solarValue"
      mode="date"
      :min-date="new Date('1900-01-31').getTime()"
      :max-date="new Date('2100-12-31').getTime()"
      @confirm="onSolarConfirm"
      @cancel="showSolarPicker = false"
      @close="showSolarPicker = false"
    />
    <u-picker
      :show="showLunarPicker"
      :columns="lunarColumns"
      :default-index="lunarIndex"
      key-name=""
      @confirm="onLunarConfirm"
      @change="onLunarChange"
      @cancel="showLunarPicker = false"
      @close="showLunarPicker = false"
    />
  </view>
</template>

<style scoped>
.form-card {
  padding: 8rpx 28rpx 12rpx;
}

.field {
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f0eeea;
}

.field:last-child {
  border-bottom: none;
}

.field--row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field__label {
  display: block;
  font-size: 26rpx;
  color: #8a8580;
  margin-bottom: 12rpx;
}

.field--row .field__label {
  margin-bottom: 0;
}

.field__input,
.field__textarea,
.field__value {
  width: 100%;
  font-size: 30rpx;
  color: #1f2328;
}

.field__textarea {
  min-height: 120rpx;
}

.field__value {
  display: flex;
  justify-content: space-between;
}

.field__arrow {
  color: #2f6b5a;
  font-size: 26rpx;
}

.field__tabs {
  display: flex;
  background: #f4f2ee;
  border-radius: 12rpx;
  padding: 6rpx;
}

.field__tab {
  flex: 1;
  text-align: center;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #6b6660;
}

.field__tab--on {
  background: #fff;
  color: #2f6b5a;
  font-weight: 600;
}

.submit-btn {
  margin-top: 40rpx;
  background: #2f6b5a;
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
}

.submit-btn::after {
  border: none;
}
</style>
