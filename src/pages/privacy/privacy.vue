<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { shareMessage, shareTimeline, useShare } from '@/composables/useShare'

useShare()
onShareAppMessage(() => shareMessage())
onShareTimeline(() => shareTimeline())
</script>

<template>
  <view class="page">
    <view class="card content">
      <text class="title">隐私说明</text>
      <text class="p">本小程序「纪念日时间计算器」用于记录纪念日并计算日期差、进行公历与农历日期换算。</text>
      <text class="p">默认情况下，纪念日与额度信息仅保存在你的手机本地（微信小程序存储），不会上传到开发者服务器，也不收集手机号、微信昵称、头像或通讯录。</text>
      <text class="p">如后续在「我的」或更新说明中开启云同步，完全部数据才会按微信 openid 区分后写入微信云开发集合 user_memory、user_quota。当前版本默认关闭云同步。</text>
      <text class="p">广告由微信流量主提供。默认最多保存 3 条纪念日；完整观看一次激励视频可增加 1 条额度，最多 20 条。每条纪念日自保存起有效 30 天，可对该条单独观看视频，在其当前到期日上再延续 30 天。未完整观看不会生效。你也可以不使用该能力，继续在免费额度内使用。</text>
      <text class="p">你可随时在「我的 - 清除本机数据」删除全部纪念日和额度记录。删除后无法恢复。</text>
      <text class="p">工具页的农历换算仅为日期对应关系，不提供黄历、宜忌、吉凶或任何测算内容。</text>
    </view>
  </view>
</template>

<style scoped>
.content {
  padding: 36rpx 32rpx 48rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 24rpx;
}

.p {
  display: block;
  font-size: 28rpx;
  color: #4a4642;
  line-height: 1.8;
  margin-bottom: 20rpx;
}
</style>
