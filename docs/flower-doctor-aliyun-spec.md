# 花大夫阿里云迁移规格

## 目标

将花大夫的模型代理从腾讯 CloudBase 云函数迁移到阿里云函数计算 FC 3.0，继续使用阿里云百炼视觉模型；保留现有 CloudBase 邮箱登录、PostgreSQL 和静态网站，不改动其他业务数据链路。

## 请求契约

浏览器向配置的 HTTPS 函数 URL 发送 `POST application/json`，正文保持 `{ action, plant, image, messages }`。`action` 仅允许 `chat` 和 `summary`。函数返回 `{ ok: true, reply }` 或 `{ ok: true, summary }`；失败返回 `{ ok: false, message }` 与合适的 HTTP 状态码。

## 运行约束

- 阿里云函数运行时使用 Node.js 20，处理程序为 `index.handler`，超时 90 秒，内存 256 MB，最小实例数 0。
- 百炼密钥仅保存在函数环境变量 `DASHSCOPE_API_KEY` 中，不进入 GitHub 或浏览器。
- 函数环境变量还包括 `DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1` 与 `FLOWER_DOCTOR_MODEL=qwen3-vl-flash`；MVP 优先使用低成本、低延迟的视觉模型。
- HTTP 触发器允许 `POST` 和 `OPTIONS`；正式上线时 CORS 只允许花花日记本的正式 HTTPS 域名和本地开发地址。
- 图片仍限制为 JPEG、PNG 或 WebP，Data URL 最大长度 7,500,000 字符；消息最多保留 12 条。
- MVP 的匿名 HTTP URL 存在被滥用风险，必须同时开启百炼“免费额度用完即停”，上线后再接 CloudBase JWT 或网关限流。

## 验收

本地测试覆盖 HTTP 事件解析、OPTIONS、无密钥错误、chat 和 summary 返回；前端在未配置 URL 时显示明确错误。取得阿里云函数 URL 后，以真实植物照片完成一次“上传照片、追问、结束问诊、病历写入 PostgreSQL”的端到端验收。
