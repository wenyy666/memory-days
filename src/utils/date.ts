export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function today(): Date {
  return startOfDay(new Date())
}

export function dateFromYmd(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

export function diffDays(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.round(ms / 86400000)
}

export function isValidSolarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = dateFromYmd(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function formatSolar(year: number, month: number, day: number): string {
  return `${year}年${month}月${day}日`
}

export function parseSolarText(value: string): { year: number; month: number; day: number } | null {
  const matched = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value)
  if (!matched) return null
  const year = Number(matched[1])
  const month = Number(matched[2])
  const day = Number(matched[3])
  if (!isValidSolarDate(year, month, day)) return null
  return { year, month, day }
}

export function toSolarText(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function solarDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}
