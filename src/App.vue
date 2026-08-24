<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { appEnv } from '@/config/env'

onLaunch(() => {
  if (appEnv.cloudEnabled && appEnv.cloudEnvId) {
    // #ifdef MP-WEIXIN
    const cloud = (wx as unknown as { cloud?: { init: (opts: { env: string; traceUser?: boolean }) => void } }).cloud
    cloud?.init({ env: appEnv.cloudEnvId, traceUser: true })
    // #endif
  }
})
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import '@/styles/app.scss';
</style>
