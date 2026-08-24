export type CalendarType = 'solar' | 'lunar'

export interface Memorial {
  id: string
  name: string
  calendar: CalendarType
  year: number
  month: number
  day: number
  isLeapMonth?: boolean
  yearlyRepeat: boolean
  note: string
  expiresAt: number
  createdAt: number
  updatedAt: number
}

export type MemorialDraft = Omit<Memorial, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'> & {
  id?: string
}

export interface Quota {
  extraSlots: number
}

export interface MemorialView extends Memorial {
  daysUntil: number
  isToday: boolean
  isExpired: boolean
  validRemainDays: number
  dateLabel: string
  countdownLabel: string
  validLabel: string
}

export function normalizeQuota(raw: unknown): Quota {
  if (!raw || typeof raw !== 'object') return { extraSlots: 0 }
  const data = raw as Record<string, unknown>
  if (typeof data.extraSlots === 'number' && Number.isFinite(data.extraSlots)) {
    return { extraSlots: Math.max(0, Math.floor(data.extraSlots)) }
  }
  if (typeof data.unlockedUntil === 'number' && data.unlockedUntil > Date.now()) {
    return { extraSlots: 17 }
  }
  return { extraSlots: 0 }
}
