# 花大夫真实 API 部署

前端调用 CloudBase 云函数 `flower-doctor`，云函数通过阿里云百炼的 OpenAI 兼容接口调用 Qwen 视觉模型。API Key 只保存在云函数环境变量中，不会下发到浏览器。

## 控制台操作

1. 在阿里云百炼开通 `qwen3-vl-32b-thinking` 免费额度，并开启“免费额度用完即停”。
2. 创建仅允许访问该模型的 API Key。
3. 在环境 `huahuadiary-d4gajnlumc8432f6c` 新建 Node.js 18（或更高）云函数，名称必须是 `flower-doctor`。
4. 将 `cloudfunctions/flower-doctor` 目录作为函数代码部署，入口为 `index.main`。
5. 配置环境变量 `DASHSCOPE_API_KEY`、`DASHSCOPE_BASE_URL` 和 `FLOWER_DOCTOR_MODEL=qwen3-vl-32b-thinking`。
5. 超时时间建议设为 90 秒，内存 256 MB 起。只允许已登录用户从 Web SDK 调用该函数。

## 验收

登录真实账号，进入“花大夫”并上传一张清晰的整株照片，再补一张叶片/盆土近照。回答一次最近浇水时间后，应得到针对照片的追问或分诊。点击“结束问诊”后，病历会写入该植物的 `diary_entries`，返回诊所后病历墙应显示这条记录。

如果页面提示模型不可用，请检查百炼免费额度、API Key 模型权限和三个环境变量；如果提示找不到云函数，说明第 3～4 步尚未完成。
