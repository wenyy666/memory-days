import { computed, shallowRef } from 'vue'
import { appEnv, bannerAdsEnabled, rewardAdsEnabled } from '@/config/env'
import { useQuota } from '@/composables/useQuota'

type RewardedAd = {
  show: () => Promise<unknown>
  load: () => Promise<unknown>
  onClose: (cb: (res: { isEnded?: boolean }) => void) => void
  onError: (cb: (err: { errCode?: number; errMsg?: string }) => void) => void
}

type RewardGrant = () => Promise<boolean>

let videoAd: RewardedAd | null = null
let adBound = false
let pendingResolve: ((ok: boolean) => void) | null = null
let pendingGrant: RewardGrant | null = null
let pendingIncomplete = '需完整观看后生效'

function createRewardedAd(adUnitId: string): RewardedAd | null {
  const uniFactory = (uni as unknown as { createRewardedVideoAd?: (opts: { adUnitId: string }) => RewardedAd }).createRewardedVideoAd
  if (uniFactory) return uniFactory({ adUnitId })
  // #ifdef MP-WEIXIN
  const wxFactory = (wx as unknown as { createRewardedVideoAd?: (opts: { adUnitId: string }) => RewardedAd }).createRewardedVideoAd
  if (wxFactory) return wxFactory({ adUnitId })
  // #endif
  return null
}

function adErrorText(err?: { errCode?: number; errMsg?: string }): string {
  const code = err?.errCode
  if (code === 1002) return '广告位无效，请核对 AppID 与广告位'
  if (code === 1004) return '暂无广告填充，请换真机或稍后再试'
  if (code === 1005) return '广告位审核中'
  if (code === 1006) return '广告位审核未通过'
  if (code === 1008) return '广告位已关闭'
  if (code) return `广告不可用(${code})`
  return '广告暂不可用'
}

export function useAds() {
  const { addExtraSlot, atMax, limit, unlockedLimit } = useQuota()
  const unlocking = shallowRef(false)
  const hasRewardAd = computed(() => rewardAdsEnabled)
  const hasBannerAd = computed(() => bannerAdsEnabled)
  const bannerId = computed(() => (bannerAdsEnabled ? appEnv.adBannerId : ''))
  const isDev = computed(() => appEnv.isDevBuild)

  async function grantSlot() {
    const result = await addExtraSlot()
    if (!result.added) {
      uni.showToast({ title: `已达上限 ${unlockedLimit} 条`, icon: 'none' })
      return false
    }
    uni.showToast({ title: `已增加 1 条，当前最多 ${result.limit} 条`, icon: 'success' })
    return true
  }

  function confirmMock(content: string, confirmText: string, grant: RewardGrant): Promise<boolean> {
    return new Promise((resolve) => {
      uni.showModal({
        title: '开发模拟',
        content,
        confirmText,
        success: async (res) => {
          if (res.confirm) {
            resolve(await grant())
            return
          }
          resolve(false)
        },
        fail: () => resolve(false)
      })
    })
  }

  function bindAdEvents(ad: RewardedAd) {
    if (adBound) return
    adBound = true
    ad.onError((err) => {
      uni.showToast({ title: adErrorText(err), icon: 'none' })
      pendingResolve?.(false)
      pendingResolve = null
      pendingGrant = null
    })
    ad.onClose(async (res) => {
      if (res && res.isEnded && pendingGrant) {
        pendingResolve?.(await pendingGrant())
      } else {
        uni.showToast({ title: pendingIncomplete, icon: 'none' })
        pendingResolve?.(false)
      }
      pendingResolve = null
      pendingGrant = null
    })
  }

  async function watchRewardedVideo(options: {
    onGranted: RewardGrant
    mockContent: string
    mockConfirm: string
    incompleteToast: string
  }): Promise<boolean> {
    if (!rewardAdsEnabled) return false
    if (unlocking.value) return false
    unlocking.value = true
    pendingIncomplete = options.incompleteToast
    try {
      if (!appEnv.adRewardId) {
        if (isDev.value) return confirmMock(options.mockContent, options.mockConfirm, options.onGranted)
        return false
      }

      if (!videoAd) {
        videoAd = createRewardedAd(appEnv.adRewardId)
      }
      if (!videoAd) {
        uni.showToast({ title: '当前环境不支持激励视频', icon: 'none' })
        return false
      }
      bindAdEvents(videoAd)

      return await new Promise((resolve) => {
        pendingResolve = resolve
        pendingGrant = options.onGranted
        const showAd = async () => {
          try {
            await videoAd?.show()
          } catch {
            try {
              await videoAd?.load()
              await videoAd?.show()
            } catch (error) {
              uni.showToast({ title: adErrorText(error as { errCode?: number; errMsg?: string }), icon: 'none' })
              pendingResolve?.(false)
              pendingResolve = null
              pendingGrant = null
            }
          }
        }
        void showAd()
      })
    } finally {
      unlocking.value = false
    }
  }

  async function watchRewardAndUnlock(): Promise<boolean> {
    if (atMax.value) {
      uni.showToast({ title: `已达上限 ${unlockedLimit} 条`, icon: 'none' })
      return false
    }
    return watchRewardedVideo({
      onGranted: grantSlot,
      mockContent: `尚未配置激励视频广告位。开发环境可模拟看完视频，当前 ${limit.value} 条，看完后增加 1 条。`,
      mockConfirm: '模拟 +1',
      incompleteToast: '需完整观看后增加 1 条'
    })
  }

  async function watchRewardAndExtend(onGranted: RewardGrant): Promise<boolean> {
    return watchRewardedVideo({
      onGranted,
      mockContent: '尚未配置激励视频广告位。开发环境可模拟看完视频，为这条纪念日延续 30 天。',
      mockConfirm: '模拟续期',
      incompleteToast: '需完整观看后延续时长'
    })
  }

  return {
    unlocking,
    hasRewardAd,
    hasBannerAd,
    bannerId,
    watchRewardAndUnlock,
    watchRewardAndExtend
  }
}
