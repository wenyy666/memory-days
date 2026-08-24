import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { appEnv } from '@/config/env'

export function useShare(title = '纪念日倒计时') {
  onShareAppMessage(() => ({
    title: `${title} · ${appEnv.appName}`,
    path: '/pages/index/index'
  }))

  onShareTimeline(() => ({
    title: `${title} · ${appEnv.appName}`
  }))
}
