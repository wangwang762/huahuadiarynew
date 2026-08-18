# CloudBase MVP 真实数据设计

## 目标

把花花日记本从本地模拟账户和全局演示数据改为真实 CloudBase 账户与用户数据，让用户可以通过邮箱验证码登录，在不同设备恢复自己的植物与日记。真实账户默认进入空花园，只展示自己添加的植物；26 盆演示植物只在显式 `?demo=1` 预览模式中使用。

## 架构

MVP 采用轻量混合架构。浏览器使用 CloudBase Web v3 SDK 完成邮箱 OTP 登录，并在登录态下直接读写普通业务数据；数据库安全规则使用 CloudBase UID 约束每条记录的所有者。AI 识别、模型密钥、批量任务和其他敏感操作后续再进入云函数，本期不增加自建服务器。

CloudBase 环境为 `huahuadiary-d4gajnlumc8432f6c`，地域为上海。环境 ID 是公开配置，代码中不得出现腾讯云 SecretId、SecretKey 或邮箱 SMTP 密码。

## 数据模型

`profiles` 每位用户一条记录，文档 ID 使用 UID，包含 `ownerId`、`email`、`onboarded`、`createdAt`、`updatedAt`。

`plants` 每盆植物一条记录，包含 `ownerId`、植物业务 ID、昵称、品类、预制头像 `photoId`、性格与养护文案、状态、出生日期以及创建和更新时间。视觉颜色和默认花盆可以随记录保存，确保头像库升级后旧植物仍保持原样。

`diary_entries` 每篇日记一条记录，包含 `ownerId`、`plantId`、日记业务 ID、日期、天气、心情、类型、照片标识、正文片段、植物说话内容、星级和创建时间。读取植物后按 `plantId` 组装为现有前端需要的嵌套 `plant.diary` 数组。

植物照片本期继续使用预制静态资源，暂不创建 `plant_photos` 集合；用户上传照片与云存储在拍照功能真实化时单独接入。

## 服务边界

`cloudbase-config.js` 只保存环境 ID、地域和 demo 开关，并初始化 SDK。`account-service.js` 保持现有 UI 所依赖的 `requestEmailCode`、`verifyEmailCode`、`getCurrentAccount`、`markOnboarded` 和 `signOut` 接口，但底层改用 `signInWithOtp`、`verifyOtp` 与真实 session。`data-service.js` 提供 bootstrap、创建植物、更新植物和新增日记操作，负责 CloudBase 文档与现有 UI 对象之间的转换。

App 启动时先显示轻量花园载入页，再恢复 CloudBase session 与业务数据。无 session 进入邮箱页；已登录但没有完成 onboarding 的用户进入空花园引导；已完成 onboarding 的用户进入自己的日记首页。CloudBase 请求失败时显示可重试错误，不回退到演示数据。

## 写入流程

完成首次植物 onboarding 时，先创建 plant，再创建第一篇 diary entry，最后把 profile 标为 onboarded；任一步失败都保留在当前页面并显示可重试错误，不能在远端写入失败时假装成功。后续新增日记与编辑植物采用先等待远端写入成功、再更新页面状态的保守策略，避免 MVP 出现跨设备数据不一致。

## 权限

三个集合都要求登录。`profiles` 只允许 `auth.uid` 等于文档 ID 与 `ownerId` 的用户读写；`plants` 和 `diary_entries` 只允许 `auth.uid == doc.ownerId` 的用户读写，并要求创建数据中的 `ownerId` 等于当前 UID。前端不拥有管理员密钥。

## 验证与降级

自动测试覆盖环境配置、真实 OTP 方法标记、开发验证码移除、三集合名称、ownerId 写入与 demo 模式隔离。浏览器测试覆盖无 session 邮箱页、错误网络提示和 `?demo=1` 仍可预览。邮箱验证码和真实数据库闭环只有在控制台开启登录方式、创建集合并配置安全规则后才能完成最终验证。
