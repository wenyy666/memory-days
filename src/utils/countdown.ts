import { DAY_MS, nextExpiresAt } from '@/config/env'
import type { Memorial } from '@/types/memorial'
import { dateFromYmd, diffDays, formatSolar, isGregorianLeapYear, today } from '@/utils/date'
import { formatLunar, leapMonth, lunarToSolar, solarToLunar } from '@/utils/lunar'

function clampSolarDay(year: number, month: number, day: number) {
  if (month === 2 && day === 29 && !isGregorianLeapYear(year)) {
    return { year, month, day: 28 }
  }
  const last = new Date(year, month, 0).getDate()
  return { year, month, day: Math.min(day, last) }
}

function memorialSolarDate(memorial: Memorial) {
  if (memorial.calendar === 'lunar') {
    return lunarToSolar(memorial.year, memorial.month, memorial.day, Boolean(memorial.isLeapMonth))
  }
  return { year: memorial.year, month: memorial.month, day: memorial.day }
}

function nextSolarOccurrence(memorial: Memorial, from: Date): Date {
  if (!memorial.yearlyRepeat) {
    const solar = memorialSolarDate(memorial)
    return dateFromYmd(solar.year, solar.month, solar.day)
  }
  const fromYear = from.getFullYear()
  const thisYear = clampSolarDay(fromYear, memorial.month, memorial.day)
  let candidate = dateFromYmd(thisYear.year, thisYear.month, thisYear.day)
  if (diffDays(from, candidate) < 0) {
    const next = clampSolarDay(fromYear + 1, memorial.month, memorial.day)
    candidate = dateFromYmd(next.year, next.month, next.day)
  }
  return candidate
}

function nextLunarOccurrence(memorial: Memorial, from: Date): Date {
  if (!memorial.yearlyRepeat) {
    const solar = memorialSolarDate(memorial)
    return dateFromYmd(solar.year, solar.month, solar.day)
  }

  const fromLunar = solarToLunar(from.getFullYear(), from.getMonth() + 1, from.getDate())
  const years = [fromLunar.year, fromLunar.year + 1, fromLunar.year + 2]

  for (const year of years) {
    const useLeap = Boolean(memorial.isLeapMonth) && leapMonth(year) === memorial.month
    const solar = lunarToSolar(year, memorial.month, memorial.day, useLeap)
    const candidate = dateFromYmd(solar.year, solar.month, solar.day)
    if (diffDays(from, candidate) >= 0) return candidate
  }

  const fallback = lunarToSolar(fromLunar.year + 2, memorial.month, memorial.day, false)
  return dateFromYmd(fallback.year, fallback.month, fallback.day)
}

export function resolveOccurrence(memorial: Memorial, from = today()): Date {
  return memorial.calendar === 'lunar'
    ? nextLunarOccurrence(memorial, from)
    : nextSolarOccurrence(memorial, from)
}

export function formatMemorialDate(memorial: Memorial): string {
  const lunarText = formatLunar({
    year: memorial.year,
    month: memorial.month,
    day: memorial.day,
    isLeap: Boolean(memorial.isLeapMonth)
  }, false)

  if (memorial.calendar === 'lunar') {
    return memorial.yearlyRepeat
      ? `每年农历${lunarText}`
      : `农历${memorial.year}年${lunarText}`
  }
  if (memorial.yearlyRepeat) {
    return `每年${memorial.month}月${memorial.day}日`
  }
  return formatSolar(memorial.year, memorial.month, memorial.day)
}

export function countdownLabel(daysUntil: number): string {
  if (daysUntil === 0) return '就是今天'
  if (daysUntil > 0) return `还有 ${daysUntil} 天`
  return `已过 ${Math.abs(daysUntil)} 天`
}

export function buildMemorialView(memorial: Memorial, from = today()) {
  const occurrence = resolveOccurrence(memorial, from)
  const fixedSolar = memorialSolarDate(memorial)
  const daysUntil = memorial.yearlyRepeat
    ? diffDays(from, occurrence)
    : diffDays(from, dateFromYmd(fixedSolar.year, fixedSolar.month, fixedSolar.day))

  const expiresAt = memorial.expiresAt || nextExpiresAt()
  const remainMs = expiresAt - Date.now()
  const isExpired = remainMs <= 0
  const validRemainDays = isExpired ? 0 : Math.max(1, Math.ceil(remainMs / DAY_MS))

  return {
    ...memorial,
    expiresAt,
    daysUntil,
    isToday: daysUntil === 0,
    isExpired,
    validRemainDays,
    dateLabel: formatMemorialDate(memorial),
    countdownLabel: countdownLabel(daysUntil),
    validLabel: isExpired ? '已到期' : `有效剩余 ${validRemainDays} 天`
  }
}
