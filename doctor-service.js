/* 花大夫客户端：只调用阿里云 FC HTTP 接口，模型密钥绝不进入浏览器。 */
(function () {
  function cleanMessages(messages) {
    return (messages || []).slice(-12).map(message => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || "").slice(0, 1600),
    }));
  }

  function plantContext(plant) {
    return {
      id: plant && plant.id,
      name: plant && plant.name,
      species: plant && plant.species,
      days: plant && plant.days,
      careGuide: plant && plant.guide,
      isNew: !!(plant && plant.isNew),
    };
  }

  function endpointUrl() {
    const config = window.HHDoctorConfig || {};
    const value = String(config.endpoint || "").trim();
    if (!value) throw new Error("花大夫的阿里云服务地址还没有配置");
    let url;
    try { url = new URL(value, window.location.href); } catch (_) {
      throw new Error("花大夫服务地址格式不正确");
    }
    const local = url.hostname === "127.0.0.1" || url.hostname === "localhost";
    if (url.protocol !== "https:" && !local) throw new Error("花大夫服务必须使用 HTTPS");
    return url.toString();
  }

  async function invoke(action, payload) {
    if (window.HHCloud.demo) throw new Error("演示模式不调用真实花大夫");
    const endpoint = endpointUrl();
    const config = window.HHDoctorConfig || {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(config.timeoutMs) || 85_000);
    let response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
        signal: controller.signal,
        credentials: "omit",
      });
    } catch (error) {
      if (error && error.name === "AbortError") throw new Error("花大夫看得有点久，请重新试一次");
      throw new Error("花大夫服务暂时连接不上，请稍后重试");
    } finally {
      clearTimeout(timer);
    }
    const result = await response.json().catch(() => ({}));
    if (!result || result.ok !== true) {
      throw new Error((result && result.message) || "花大夫暂时没有接通，请稍后重试");
    }
    return result;
  }

  async function reply({ plant, image, messages }) {
    const result = await invoke("chat", {
      plant: plantContext(plant),
      image: image || "",
      messages: cleanMessages(messages),
    });
    return String(result.reply || "").trim();
  }

  async function summarize({ plant, image, messages }) {
    const result = await invoke("summary", {
      plant: plantContext(plant),
      image: image || "",
      messages: cleanMessages(messages),
    });
    return result.summary;
  }

  window.HHDoctor = { reply, summarize };
})();
