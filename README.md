# 纪念日时间计算器

仅适配微信小程序的纪念日倒计时与日期换算工具。技术栈：UniApp + Vue3 + TypeScript + uview-plus。

v1 数据默认保存在本机（`uni.setStorage`），不产生云开发费用。激励视频用于扩展可保存条数，页面底部预留 Banner 广告位。广告 ID 与云环境 ID 均通过环境变量配置，不写死在源码中。

## 功能

- 纪念日列表：倒计时、今日高亮、左滑编辑/删除、空状态
- 新增/编辑：事件名称、公历或农历、每年重复、备注
- 免费最多 3 条；完整观看一次激励视频增加 1 条，最多 20 条
- 每条纪念日有效 30 天，对该条看一次激励视频再延续 30 天
- 工具：两个日期相差天数；公历农历互转（只输出日期，无黄历/吉凶）
- 我的：额度、隐私说明、清除本机数据
- 微信原生转发 / 朋友圈分享

## 环境要求

- Node.js 18+（推荐 20）
- 微信开发者工具
- 已注册的微信小程序 AppID（体验和正式发布时需要）

## 本地运行

```bash
cp .env.example .env
npm install
npm run dev
```

用微信开发者工具导入目录：

```text
dist/dev/mp-weixin
```

如果弹出「下载基础库版本 3.17.0 失败」，点关闭，不要反复重试。到 **详情 → 本地设置 → 调试基础库**，改成列表里已有的版本（推荐 `3.16.2`），再点编译。项目已把默认基础库钉在 `3.16.2`。

在 [`src/manifest.json`](src/manifest.json) 的 `mp-weixin.appid` 填入你的小程序 AppID。开发阶段可先用测试号。

正式构建：

```bash
npm run build
```

导入 `dist/build/mp-weixin` 后上传。

也可使用 HBuilderX 打开本项目，运行到微信开发者工具。若 HBuilderX 的 Node 版本过低，请在运行配置中指定本机 Node 18+ 路径。

## 环境变量

复制 [`.env.example`](.env.example) 为 `.env`：

| 变量 | 说明 |
| --- | --- |
| `VITE_APP_NAME` | 小程序展示名称 |
| `VITE_CLOUD_ENABLED` | 是否启用云开发，v1 保持 `false` |
| `VITE_CLOUD_ENV_ID` | 微信云开发环境 ID，未启用时留空 |
| `VITE_AD_REWARD_ID` | 激励视频广告位 ID，留空则开发环境可模拟解锁 |
| `VITE_AD_BANNER_ID` | 底部 Banner 广告位 ID，留空显示灰色占位 |

修改 `.env` 后需要重新执行 `npm run dev` / `npm run build`，变量在编译期写入。

## 广告（流量主）

1. 小程序先审核通过并上线
2. 在微信公众平台申请流量主，创建激励视频、Banner 广告位
3. 把广告位 ID 填进 `.env`，重新构建上传

未配置广告 ID 时：

- `npm run build` 正式包不展示 Banner、不出现「看视频」和「延续时长」，也不走广告逻辑，免费额度照常使用
- `npm run dev` 开发环境仍可用「开发模拟」测试加条数和续期

不要在源码里写虚假广告 ID，也不要诱导分享或强制看广告才能用基础功能。

## 数据存储

默认本地 key：

- `memorials`：纪念日列表
- `quota`：解锁到期时间

存储实现做了适配层：[`src/services/storage`](src/services/storage)。业务代码只依赖 `getStore()`。

## 后期开启云开发（可选）

收益起来后再开，避免前期云资源费用：

1. 开通微信云开发，创建环境，记下环境 ID
2. 在云开发控制台创建集合 `user_memory`、`user_quota`，按 openid 做权限
3. 上传并部署仓库内 [`cloudfunctions/login`](cloudfunctions/login)
4. `.env` 设置 `VITE_CLOUD_ENABLED=true` 和 `VITE_CLOUD_ENV_ID=你的环境ID`
5. 重新构建上传

客户端集合读写骨架见 [`src/services/storage/cloud.ts`](src/services/storage/cloud.ts)。云开发会按 `_openid` 区分用户。

## 审核材料

提交审核时的功能说明、类目建议、截图清单和避坑说明见 [`docs/WECHAT_REVIEW.md`](docs/WECHAT_REVIEW.md)。

## 目录

```text
src/pages          首页 / 工具 / 我的 / 编辑 / 隐私
src/components     列表、表单、空状态、额度条、广告占位
src/composables    纪念日、额度、广告、分享
src/services       本地存储 + 云开发骨架
src/utils          农历互转、日期差、倒计时（前端硬编码）
cloudfunctions     后期上云用的 login 云函数
```

农历算法覆盖 1900-01-31 至 2100-12-31，全部在本地计算，不调用任何 AI 或第三方黄历接口。
