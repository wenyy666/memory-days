function readFlag(value: string | undefined): boolean {
  return String(value).toLowerCase() === 'true'
}

function readText(value: string | undefined): string {
  return (value || '').trim()
}

export const appEnv = {
  appName: readText(import.meta.env.VITE_APP_NAME) || '纪念日时间计算器',
  cloudEnabled: readFlag(import.meta.env.VITE_CLOUD_ENABLED),
  cloudEnvId: readText(import.meta.env.VITE_CLOUD_ENV_ID),
  adRewardId: readText(import.meta.env.VITE_AD_REWARD_ID),
  adBannerId: readText(import.meta.env.VITE_AD_BANNER_ID),
  isDevBuild: import.meta.env.DEV
}

/** 正式包没有广告 ID 时不展示、不走广告。开发环境无 ID 仍可用模拟。 */
export const rewardAdsEnabled = Boolean(appEnv.adRewardId) || appEnv.isDevBuild
export const bannerAdsEnabled = Boolean(appEnv.adBannerId)

export const QUOTA = {
  freeLimit: 3,
  unlockedLimit: 20,
  slotPerAd: 1,
  extendDays: 30
} as const

export const DAY_MS = 24 * 60 * 60 * 1000

export function nextExpiresAt(current?: number | null, now = Date.now()): number {
  const base = typeof current === 'number' && current > now ? current : now
  return base + QUOTA.extendDays * DAY_MS
}
