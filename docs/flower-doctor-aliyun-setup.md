# 花大夫阿里云部署

花大夫使用阿里云函数计算 FC 3.0 作为浏览器与百炼视觉模型之间的安全代理。GitHub 保存函数源码和 `s.yaml`，百炼 API Key 只保存在阿里云函数环境变量中。

## 一、费用保护

在创建函数前先完成两项保护：在百炼控制台开启“免费额度用完即停”，在函数计算中保持“最小实例数”为 0。函数计算和百炼都不是永久免费服务，不要开通常驻实例，也不要把匿名函数 URL 公开传播。

## 二、从 GitHub 创建应用

1. 退出腾讯 CloudBase 的“新建云函数”页面，打开阿里云“函数计算 FC 3.0”。
2. 进入“应用中心”，选择从 Git 仓库创建或持续部署已有工程。
3. 仓库选择 `wangwang762/huahuadiarynew`，分支选择 `codex/mvp`。
4. 应用目录填写 `aliyun-functions/flower-doctor`，配置文件为该目录下的 `s.yaml`。
5. 首次部署后应得到函数 `huahua-flower-doctor`，地域为杭州，运行时 Node.js 20，处理程序 `index.handler`，内存 256 MB，超时 90 秒，最小实例数 0。
6. HTTP 触发器只允许 `POST` 和 `OPTIONS`，鉴权暂选“无需认证”；一期必须依靠来源限制和百炼额度保护，后续再补 JWT 或网关限流。

## 三、函数环境变量

在函数“配置 → 环境变量”中添加：

```text
DASHSCOPE_API_KEY=<在阿里云百炼控制台复制的 API Key>
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
FLOWER_DOCTOR_MODEL=qwen3-vl-flash
ALLOWED_ORIGINS=https://你的正式花花域名,http://127.0.0.1:4177,http://localhost:4177
```

不要把 `DASHSCOPE_API_KEY` 写入 GitHub、`s.yaml`、`doctor-config.js` 或聊天窗口。若暂时只有本地预览，可先只填写两个本地域名；取得正式域名后再补上。

## 四、连接前端

在函数“触发器”页面复制公网 HTTPS URL，然后只把这个公开 URL 写入根目录 `doctor-config.js`：

```js
window.HHDoctorConfig = {
  endpoint: "https://你的函数URL",
  timeoutMs: 85_000,
};
```

提交并推送 `codex/mvp` 后，静态站点部署才会使用新地址。API Key 始终留在阿里云。

## 五、验收

先在函数控制台查看一次调用日志，再用真实账号进入花花日记本：选择已有植物、上传整株照片、回答最近浇水时间、结束问诊。成功标准是模型回答引用照片中实际可见特征，并且结束问诊后 `diary_entries` 增加一条 `diagnosis` 记录。若网页提示“服务地址还没有配置”，说明第四步未完成；若提示缺少 `DASHSCOPE_API_KEY`，说明第三步没有保存或函数没有重新部署。
