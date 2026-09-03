import { appEnv } from '@/config/env'

const DEFAULT_TITLE = '纪念日倒计时'

export function shareMessage(title = DEFAULT_TITLE) {
  return {
    title: `${title} · ${appEnv.appName}`,
    path: '/pages/index/index'
  }
}

export function shareTimeline(title = DEFAULT_TITLE) {
  return {
    title: `${title} · ${appEnv.appName}`
  }
}

/**
 * 打开右上角「转发 / 分享到朋友圈」。
 * 分享回调必须写在页面 .vue 里调用 onShareAppMessage / onShareTimeline，
 * 写在 composable 内会被 uni-app 编译器漏掉，微信会显示「当前页面不可转发」。
 */
export function useShare() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}
