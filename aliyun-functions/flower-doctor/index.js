"use strict";

const https = require("https");

const MODEL = process.env.FLOWER_DOCTOR_MODEL || "qwen3-vl-flash";
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

function allowedOrigins() {
  return String(process.env.ALLOWED_ORIGINS || "http://127.0.0.1:4177,http://localhost:4177")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
}

function headerValue(headers, name) {
  const key = Object.keys(headers || {}).find(value => value.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : "";
}

function corsOrigin(event) {
  const origin = headerValue(event.headers, "origin");
  const allowed = allowedOrigins();
  if (allowed.includes("*")) return origin || "*";
  return allowed.includes(origin) ? origin : allowed[0] || "";
}

function response(event, statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": corsOrigin(event),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "3600",
      Vary: "Origin",
    },
    body: statusCode === 204 ? "" : JSON.stringify(payload),
  };
}

function eventObject(event) {
  if (Buffer.isBuffer(event)) return JSON.parse(event.toString("utf8") || "{}");
  if (typeof event === "string") return JSON.parse(event || "{}");
  return event || {};
}

function requestBody(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  return typeof raw === "string" ? JSON.parse(raw || "{}") : raw;
}

function safeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(-12).map(message => ({
    role: message && message.role === "assistant" ? "assistant" : "user",
    content: String((message && message.content) || "").slice(0, 1600),
  }));
}

function safeCandidates(input) {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 60).map(item => ({
    id: String((item && item.id) || "").slice(0, 80),
    name: String((item && item.name) || "").slice(0, 50),
    species: String((item && item.species) || "").slice(0, 80),
  })).filter(item => item.id && item.species);
}

function normalizeRecognition(value, candidates) {
  const validIds = new Set(candidates.map(item => item.id));
  return {
    species: String(value.species || "待识别").slice(0, 80),
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
    matchedIds: Array.isArray(value.matched_ids)
      ? [...new Set(value.matched_ids.map(String).filter(id => validIds.has(id)))].slice(0, 8)
      : [],
    note: String(value.note || "").slice(0, 160),
  };
}

function normalizeTriage(value) {
  const health = ["good", "watch", "sick"].includes(value.health) ? value.health : "watch";
  const trend = ["better", "same", "worse", "unknown"].includes(value.trend) ? value.trend : "unknown";
  const routeByHealth = { good: "record", watch: "soft_hint", sick: "diagnose" };
  const route = routeByHealth[health];
  return {
    health,
    observations: Array.isArray(value.observations)
      ? value.observations.slice(0, 4).map(item => String(item).slice(0, 90)).filter(Boolean)
      : [],
    likelyCause: String(value.likely_cause || "暂时无法判断原因").slice(0, 160),
    trend,
    trendSummary: String(value.trendSummary || value.trend_summary || (
      trend === "better" ? "比上次舒展了一些" :
      trend === "same" ? "和上次差不多" :
      trend === "worse" ? "有些变化比上次更明显" : "这次暂时无法比较"
    )).slice(0, 160),
    route,
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
  };
}

function safeImage(image) {
  if (!image) return "";
  const value = String(image);
  if (value.length > MAX_IMAGE_LENGTH) throw new Error("照片太大，请压缩后重新上传");
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(value) && !/^https:\/\//i.test(value)) return "";
  return value;
}

function plantText(plant) {
  const p = plant || {};
  return `患者资料：名称=${String(p.name || "未命名").slice(0, 50)}；品种=${String(p.species || "待识别").slice(0, 80)}；养护天数=${Number(p.days) || "未知"}。`;
}

function firstUserMessage(plant, image) {
  const text = plantText(plant) + "\n请先观察照片，只描述确实能看见的特征，然后给出初步分诊并询问最关键的问题。";
  if (!image) return { role: "user", content: text + "\n当前没有可用照片，请先要求用户上传清晰照片，不要猜测症状。" };
  return {
    role: "user",
    content: [
      { type: "text", text },
      { type: "image_url", image_url: { url: image } },
    ],
  };
}

async function generate(messages, maxTokens) {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("花大夫尚未配置 DASHSCOPE_API_KEY");

  const request = {
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
      enable_thinking: false,
    }),
  };
  const { ok, status, result } = typeof fetch === "function"
    ? await fetchJson(`${BASE_URL}/chat/completions`, request)
    : await httpsJson(`${BASE_URL}/chat/completions`, request);
  if (!ok) {
    const detail = result && result.error && (result.error.message || result.error.code);
    throw new Error(detail || `模型调用失败（HTTP ${status}）`);
  }
  const content = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
  if (!content) throw new Error("模型没有返回诊断内容");
  return String(content).trim();
}

async function fetchJson(url, request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 80_000);
  try {
    const response = await fetch(url, { ...request, signal: controller.signal });
    return { ok: response.ok, status: response.status, result: await response.json().catch(() => ({})) };
  } finally {
    clearTimeout(timer);
  }
}

function httpsJson(url, request) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: request.method,
      headers: { ...request.headers, "Content-Length": Buffer.byteLength(request.body) },
      timeout: 80_000,
    }, response => {
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let result = {};
        try { result = JSON.parse(text || "{}"); } catch (_) {}
        const status = Number(response.statusCode) || 500;
        resolve({ ok: status >= 200 && status < 300, status, result });
      });
    });
    req.on("timeout", () => req.destroy(new Error("模型请求超时")));
    req.on("error", reject);
    req.end(request.body);
  });
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
    points: Array.isArray(value.points) ? value.points.slice(0, 4).map(item => String(item).slice(0, 60)) : [],
    followupDays: Math.max(1, Math.min(30, Number(value.followup_days) || 7)),
    urgency: allowedUrgency.includes(value.urgency) ? value.urgency : "observe",
    confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
  };
}

async function execute(payload) {
  const action = payload.action;
  const plant = payload.plant || {};
  const image = safeImage(payload.image);
  const previousImage = safeImage(payload.previousImage || payload.previous_image);
  const previousObservedAt = String(payload.previousObservedAt || payload.previous_observed_at || "").slice(0, 80);
  const candidates = safeCandidates(payload.candidates);
  const history = safeMessages(payload.messages);
  const conversation = [{ role: "system", content: SYSTEM_PROMPT }, firstUserMessage(plant, image), ...history];

  if (action === "recognize") {
    if (!image) {
      return { ok: true, recognition: normalizeRecognition({}, candidates), model: MODEL };
    }
    const candidateText = candidates.length
      ? candidates.map(item => `${item.id} | ${item.name} | ${item.species}`).join("\n")
      : "（花园暂无植物）";
    const prompt = `植物识别路由。根据照片识别最可能的家庭植物品类，并与候选档案按品类匹配。候选：\n${candidateText}\n只输出JSON：{"species":"品类","confidence":0.0,"matched_ids":["候选ID"],"note":"可见依据"}。matched_ids只能来自候选；不确定时降低confidence并返回空数组。`;
    const raw = await generate([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }] },
    ], 360);
    return { ok: true, recognition: normalizeRecognition(parseJson(raw), candidates), model: MODEL };
  }
  if (action === "triage") {
    if (!image) {
      return { ok: true, triage: normalizeTriage({
        health: "watch", observations: ["没有收到清晰照片"], likely_cause: "照片信息不足",
        trend: "unknown", trend_summary: previousImage ? "这次暂时无法比较" : "这是第一次观察",
        route: "soft_hint", confidence: 0,
      }), model: MODEL };
    }
    const prompt = `健康分诊路由。${plantText(plant)}只根据照片里确实可见的叶片、茎干、土壤和整体状态判断，不要因为植物档案原状态良好就默认健康。黄斑、焦枯、萎蔫、卷边、黑斑或大面积变色必须进入watch或sick，不能返回good。健康状态和前后趋势是两个独立判断：即使比上次好转，当前仍可能需要watch或sick；只有两张照片中存在清晰、可见的对比证据时才能声称better。只输出JSON：{"health":"good|watch|sick","observations":["可见现象"],"likely_cause":"最可能原因；不确定要说明","trend":"better|same|worse|unknown","trend_summary":"与上次相比的可见变化","route":"record|soft_hint|diagnose","confidence":0.0}。明显异常使用sick+diagnose，轻微异常使用watch+soft_hint，只有没有明显异常才用good+record。`;
    const content = previousImage ? [
      { type: "text", text: `${prompt}\n图1是本次照片。图2是上一次照片，记录时间：${previousObservedAt || "未知"}。` },
      { type: "image_url", image_url: { url: image } },
      { type: "image_url", image_url: { url: previousImage } },
    ] : [
      { type: "text", text: `${prompt}\n这是第一次观察，没有可比较的上一张照片；trend必须返回unknown，trend_summary必须返回“这是第一次观察”。` },
      { type: "image_url", image_url: { url: image } },
    ];
    const raw = await generate([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content },
    ], 480);
    const triage = parseJson(raw);
    if (!previousImage) {
      triage.trend = "unknown";
      triage.trend_summary = "这是第一次观察";
    }
    return { ok: true, triage: normalizeTriage(triage), model: MODEL };
  }
  if (action === "chat") {
    return { ok: true, reply: await generate(conversation, 700), model: MODEL };
  }
  if (action === "summary") {
    const request = `请根据完整问诊生成病历。只输出一个JSON对象，不要Markdown：
{"symptom":"照片中可见症状/用户主诉","conclusion":"最可能原因；不确定就写鉴别方向","plan":"按优先级排列的具体养护步骤","points":["要点1","要点2"],"followup_days":7,"urgency":"observe|recheck|urgent","confidence":0.0}
confidence表示对结论的把握，信息不足时必须低于0.5。`;
    const raw = await generate([...conversation, { role: "user", content: request }], 900);
    return { ok: true, summary: normalizeSummary(parseJson(raw)), model: MODEL };
  }
  const error = new Error("不支持的花大夫操作");
  error.statusCode = 400;
  throw error;
}

async function handle(rawEvent) {
  let event = {};
  try {
    event = eventObject(rawEvent);
    const method = String(event.requestContext && event.requestContext.http && event.requestContext.http.method || "POST").toUpperCase();
    if (method === "OPTIONS") return response(event, 204, null);
    if (method !== "POST") return response(event, 405, { ok: false, message: "只支持 POST 请求" });
    const result = await execute(requestBody(event));
    return response(event, 200, result);
  } catch (error) {
    const statusCode = Number(error && error.statusCode) || 500;
    if (statusCode >= 500) console.error("flower-doctor", error);
    return response(event, statusCode, { ok: false, message: error && error.message ? error.message : "花大夫服务异常" });
  }
}

// FC event functions on the Node.js 16 runtime complete through the callback.
// Returning the Promise as a fallback keeps the same bundle compatible with newer runtimes.
exports.handler = function handler(rawEvent, context, callback) {
  const task = handle(rawEvent);
  if (typeof callback === "function") {
    task.then(result => callback(null, result), callback);
    return;
  }
  return task;
};

exports._test = { eventObject, requestBody, safeImage, safeMessages, safeCandidates, normalizeRecognition, normalizeTriage, normalizeSummary, handle };
