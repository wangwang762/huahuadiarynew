"use strict";

const MODEL = process.env.FLOWER_DOCTOR_MODEL || "qwen3-vl-32b-thinking";
const BASE_URL = (process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");
const MAX_IMAGE_LENGTH = 7_500_000;

const SYSTEM_PROMPT = `你是“花大夫”，面向家庭园艺用户的植物养护分诊助手。你的任务是根据照片、植物资料和用户补充信息给出谨慎、可执行的建议。
规则：
1. 照片不足以确定病因时必须明确说“不确定”，并追问最关键的1至2个问题，不能编造已观察到的症状。
2. 优先区分浇水、光照、温湿度、病虫害、根系和土壤问题；相似病因要给出辨别方法。
3. 不给没有依据的精确毫升数。浇水建议优先使用“浇透至盆底少量出水”“土壤干到某深度”等可验证标准。
4. 涉及农药时先建议隔离、通风和物理清除；提醒遵循产品标签并远离儿童宠物。
5. 回复中文、温和简洁，每次2至5句话。先说明观察，再给下一步或追问。不要声称你已经检查了照片中看不见的根系、土壤内部或虫体。
6. 这是分诊和养护建议，不把推测说成确诊。`;

function safeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(-12).map(message => ({
    role: message && message.role === "assistant" ? "assistant" : "user",
    content: String((message && message.content) || "").slice(0, 1600),
  }));
}

function safeImage(image) {
  if (!image) return "";
  const value = String(image);
  if (value.length > MAX_IMAGE_LENGTH) throw new Error("照片太大，请压缩后重新上传");
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(value) && !/^https:\/\//i.test(value)) {
    return "";
  }
  return value;
}

function plantText(plant) {
  const p = plant || {};
  return `患者资料：名称=${String(p.name || "未命名").slice(0, 50)}；品种=${String(p.species || "待识别").slice(0, 80)}；养护天数=${Number(p.days) || "未知"}。`;
}

function firstUserMessage(plant, image) {
  const text = plantText(plant) + "\n请先观察照片，只描述确实能看见的特征，然后给出初步分诊并询问最关键的问题。";
  if (!image) return { role: "user", content: text + "\n当前没有可用照片，请先要求用户上传清晰照片，不要猜测症状。" };
  return { role: "user", content: [
    { type: "text", text },
    { type: "image_url", image_url: { url: image } },
  ] };
}

async function generate(messages, maxTokens) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("花大夫尚未配置 DASHSCOPE_API_KEY");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 80000);
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        max_tokens: maxTokens || 700,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = result && result.error && (result.error.message || result.error.code);
    throw new Error(detail || `模型调用失败（HTTP ${response.status}）`);
  }
  const content = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
  if (!content) throw new Error("模型没有返回诊断内容");
  return String(content).trim();
}

function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1] : text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(source);
}

function normalizeSummary(value) {
  const allowedUrgency = ["observe", "recheck", "urgent"];
  return {
    symptom: String(value.symptom || "照片信息不足").slice(0, 160),
    conclusion: String(value.conclusion || "暂不能确定病因").slice(0, 160),
    plan: String(value.plan || "补充清晰照片并继续观察").slice(0, 500),
    points: Array.isArray(value.points) ? value.points.slice(0, 4).map(v => String(v).slice(0, 60)) : [],
    followupDays: Math.max(1, Math.min(30, Number(value.followup_days) || 7)),
    urgency: allowedUrgency.includes(value.urgency) ? value.urgency : "observe",
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
  };
}

exports.main = async function (event, context) {
  try {
    const action = event && event.action;
    const plant = (event && event.plant) || {};
    const image = safeImage(event && event.image);
    const history = safeMessages(event && event.messages);
    const conversation = [{ role: "system", content: SYSTEM_PROMPT }, firstUserMessage(plant, image), ...history];

    if (action === "chat") {
      const reply = await generate(conversation, 700);
      return { ok: true, reply, model: MODEL };
    }
    if (action === "summary") {
      const request = `请根据完整问诊生成病历。只输出一个JSON对象，不要Markdown：
{"symptom":"照片中可见症状/用户主诉","conclusion":"最可能原因；不确定就写鉴别方向","plan":"按优先级排列的具体养护步骤","points":["要点1","要点2"],"followup_days":7,"urgency":"observe|recheck|urgent","confidence":0.0}
confidence表示对结论的把握，信息不足时必须低于0.5。`;
      const raw = await generate([...conversation, { role: "user", content: request }], 900);
      return { ok: true, summary: normalizeSummary(parseJson(raw)), model: MODEL };
    }
    return { ok: false, message: "不支持的花大夫操作" };
  } catch (error) {
    console.error("flower-doctor", error);
    return { ok: false, message: error && error.message ? error.message : "花大夫服务异常" };
  }
};
