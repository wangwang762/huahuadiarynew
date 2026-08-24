/* 花大夫客户端：只调用 CloudBase 云函数，模型密钥绝不进入浏览器。 */
(function () {
  const FUNCTION_NAME = "flower-doctor";

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

  async function invoke(action, payload) {
    if (window.HHCloud.demo) throw new Error("演示模式不调用真实花大夫");
    const { app } = window.HHCloud.get();
    if (!app || typeof app.callFunction !== "function") {
      throw new Error("花大夫服务没有加载出来，请稍后重试");
    }
    const response = await app.callFunction({
      name: FUNCTION_NAME,
      data: { action, ...payload },
      parse: true,
    });
    const result = response && response.result;
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

  window.HHDoctor = { FUNCTION_NAME, reply, summarize };
})();
