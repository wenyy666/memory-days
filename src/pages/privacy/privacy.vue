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
      <text class="kicker">写给你</text>
      <text class="title">这些日子，只留在你身边</text>
      <text class="p">本小程序用来记下对你重要的日子，看看还要多久，也可以换算公历和农历。</text>
      <text class="p">默认情况下，纪念日与额度只保存在这台手机里，不会上传到开发者服务器，也不收集手机号、微信昵称、头像或通讯录。</text>
      <text class="p">如果以后在「我的」里开启云同步，数据才会按微信 openid 分开存放。当前版本默认关闭云同步。</text>
      <text class="p">广告由微信流量主提供。默认最多记下 3 个日子；看完一次视频可以多记一条，最多 20 条。每条自保存起有效 30 天，也可以只为这一条再续 30 天。不看也完全可以使用。</text>
      <text class="p">你可以随时在「我的 - 清除记下的日子」删除全部记录。删除后无法恢复。</text>
      <text class="p">农历换算只对应日期，不看宜忌、吉凶或任何测算。</text>
    </view>
  </view>
</template>

<style scoped>
.content {
  padding: 40rpx 36rpx 52rpx;
  background: linear-gradient(180deg, #fff8f1 0%, #fbe9db 100%);
}

.kicker {
  display: block;
  font-size: 22rpx;
  color: #b54738;
  letter-spacing: 6rpx;
  margin-bottom: 16rpx;
}

.title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #3d2c26;
  margin-bottom: 28rpx;
  letter-spacing: 1rpx;
  line-height: 1.4;
}

.p {
  display: block;
  font-size: 28rpx;
  color: #6b4f45;
  line-height: 1.9;
  margin-bottom: 22rpx;
}
</style>
