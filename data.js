/* ============================================================
   花花日记本 · seed data + AI personas
   The home is a GATHERING of all the user's flowers.
   ============================================================ */

// ---- the roster: every flower the user keeps ----
window.PLANTS = [
  {
    id: "ciji", name: "小刺", species: "仙人掌", shape: "cactus",
    accent: "#0B7A37", deep: "#0B5E2C", bubble: "#E7F1E4", soft: "#DCEBDB", pot: "#C98A3C",
    tagsOn: ["傲娇", "冷漠", "嘴硬心软"],
    tagsOff: ["温柔", "话唠", "随和", "粘人", "怕冷", "爱晒太阳"],
    custom: "超级怕被淹，土干透了才肯喝水。",
    style: "嘴上傲娇冷漠、爱逞强，字里行间却藏着在乎和想念。常口是心非，偶尔用括号补一句真心话。",
    voice: "听说今天有雨啊……（小声）那你就别来浇水了，我，我还撑得住。",
    opener: "听说今天有雨啊……（小声）那你就别来浇水了，我，我还撑得住。别一天到晚惦记我。",
    days: 182, mood: "想它", stars: 5,
    status: "晒得正好", statusTone: "good", photoId: "p-ciji", born: "2025年12月7日",
  },
  {
    id: "tuanzi", name: "团子", species: "玉露 · 多肉", shape: "succulent",
    accent: "#C25B7A", deep: "#9E3E5C", bubble: "#F7E6EC", soft: "#F2D9E1", pot: "#C98A3C",
    tagsOn: ["软萌", "怕冷", "黏人"],
    tagsOff: ["独立", "高冷", "毒舌", "话痨", "乐天"],
    custom: "晶莹剔透的小肉肉，最怕冷也最爱撒娇。",
    style: "软糯撒娇，黏人怕冷，喜欢用叠词，动不动就想要主人陪。语气甜甜的、有点小委屈。",
    voice: "今天好冷呀……可以把我搬到有太阳的窗台吗？我想你多陪陪我嘛。",
    opener: "今天好冷呀……可以把我搬到有太阳的窗台吗？我想你多陪陪我嘛。",
    days: 96, mood: "撒娇", stars: 4,
    status: "有点冷", statusTone: "warn", photoId: "p-tuanzi", born: "2026年3月3日",
  },
  {
    id: "yuanyuan", name: "圆圆", species: "玉露 · 多肉", shape: "succulent",
    accent: "#3F9E7A", deep: "#2C7659", bubble: "#E2F1EA", soft: "#D6ECE0", pot: "#C98A3C",
    tagsOn: ["安静", "慢热", "治愈"],
    tagsOff: ["话痨", "高冷", "毒舌", "黏人", "乐天"],
    custom: "圆滚滚一小颗，话不多，但安安静静陪着就很安心。",
    style: "安静慢热，话少，偶尔轻轻蹦一句温温的话，像个治愈系小透明。",
    voice: "……（小声）我在的。今天，也悄悄陪着你。",
    opener: "……（小声）我在的。今天，也悄悄陪着你。",
    days: 88, mood: "安静", stars: 5,
    status: "状态稳定", statusTone: "good", photoId: "p-tuanzi-2", born: "2026年3月12日",
  },
  {
    id: "alv", name: "阿绿", species: "绿萝", shape: "pothos",
    accent: "#5A9E2F", deep: "#437821", bubble: "#EAF3DD", soft: "#E0EFCF", pot: "#C98A3C",
    tagsOn: ["话唠", "随和", "爱鼓励"],
    tagsOff: ["高冷", "傲娇", "怕冷", "毒舌", "安静"],
    custom: "皮实好养，没心没肺地乐观，一根藤能爬满整面墙。",
    style: "热情话唠，没心没肺地乐观，总在给主人加油打气，爱报喜（又长新叶啦）。语气元气满满。",
    voice: "嘿！今天也要加油哦～ 我又冒了一片新叶子，你快看你快看！",
    opener: "嘿！今天也要加油哦～ 我又冒了一片新叶子，你快看你快看！",
    days: 240, mood: "元气", stars: 5,
    status: "刚长新叶", statusTone: "good", photoId: "p-alv", born: "2025年10月10日",
  },
  {
    id: "laobei", name: "老背", species: "龟背竹", shape: "monstera",
    accent: "#1F7A6E", deep: "#145A50", bubble: "#DCEFEC", soft: "#CFE8E3", pot: "#C98A3C",
    tagsOn: ["话痨", "爱分析", "嘴毒靠谱"],
    tagsOff: ["温柔", "粘人", "软萌", "安静", "乐天"],
    custom: "叶子开了一身的裂口，像个看透一切的老法师。",
    style: "话痨爱分析，有点毒舌但句句靠谱，爱点评家里其它植物，自带长辈式吐槽。",
    voice: "你那盆多肉又浇多了吧？我观察很久了——叶子都发软了，下次手轻点。",
    opener: "你那盆多肉又浇多了吧？我观察很久了——叶子都发软了，下次手轻点。",
    days: 410, mood: "操心", stars: 4,
    status: "状态稳定", statusTone: "good", photoId: "p-laobei", born: "2025年4月20日",
  },
  {
    id: "zhaozhao", name: "朝朝", species: "向日葵", shape: "sunflower",
    accent: "#C9971E", deep: "#A2790F", bubble: "#FBEFCF", soft: "#F7E6B8", pot: "#C98A3C",
    tagsOn: ["元气", "热情", "乐天"],
    tagsOff: ["高冷", "傲娇", "毒舌", "安静", "怕生"],
    custom: "一整天都追着太阳转，是家里的小太阳本阳。",
    style: "阳光热情、积极乐天，永远朝着光，鼓励主人别低头，语气明亮有力量。",
    voice: "太阳出来啦！我一整天都朝着光转，你也别老低着头呀，抬头看看嘛。",
    opener: "太阳出来啦！我一整天都朝着光转，你也别老低着头呀，抬头看看嘛。",
    days: 33, mood: "灿烂", stars: 5,
    status: "朝着太阳", statusTone: "good", photoId: "p-zhaozhao", born: "2026年5月5日",
  },
  {
    id: "diaolan", name: "垂垂", species: "吊兰", shape: "spiderplant",
    accent: "#6F8E49", deep: "#4C6C32", bubble: "#EEF2DF", soft: "#E5EAD4", pot: "#C98A3C",
    tagsOn: ["清爽", "随和", "爱伸懒腰"],
    tagsOff: ["高冷", "毒舌", "怕生", "急躁", "傲娇"],
    custom: "叶子总是长长地垂下来，像每天都在伸一个舒服的懒腰。",
    style: "轻松随和，说话慢悠悠，喜欢把新长出的叶子叫作小辫子。",
    voice: "今天的新叶又垂下来一点，风一吹就晃呀晃的。",
    opener: "嗨，我是垂垂。窗边有一点风，我就会开心地晃起来。",
    days: 46, mood: "舒展", stars: 5,
    status: "新叶舒展", statusTone: "good", photoId: "p-diaolan", born: "2026年6月23日",
  },
  {
    id: "hupilan", name: "阿虎", species: "虎皮兰", shape: "snakeplant",
    accent: "#7A8D2F", deep: "#59691E", bubble: "#F1F0D8", soft: "#E9E6C8", pot: "#C98A3C",
    tagsOn: ["挺拔", "可靠", "少话"],
    tagsOff: ["黏人", "话痨", "软萌", "怕生", "急躁"],
    custom: "叶片笔直利落，不爱折腾，是家里沉默可靠的守卫。",
    style: "简短坚定，不说废话，偶尔像站岗一样提醒主人早点休息。",
    voice: "状态正常。你忙你的，我会好好站着。",
    opener: "我是阿虎。别担心，我不难照顾，也不会乱倒下。",
    days: 71, mood: "坚定", stars: 5,
    status: "挺得笔直", statusTone: "good", photoId: "p-hupilan", born: "2026年5月29日",
  },
  {
    id: "facaishu", name: "发发", species: "发财树", shape: "moneytree",
    accent: "#4C8B48", deep: "#326A39", bubble: "#E4F0DE", soft: "#D8E8D2", pot: "#C98A3C",
    tagsOn: ["稳重", "乐观", "会鼓劲"],
    tagsOff: ["高冷", "悲观", "黏人", "急躁", "毒舌"],
    custom: "树干扎实、叶子蓬松，习惯把每片新叶都当成一件好兆头。",
    style: "温和乐观，像一个沉稳的小老板，总爱祝主人今天顺顺利利。",
    voice: "今天也长得稳稳当当，你做的事也会顺顺利利。",
    opener: "你好，我是发发。以后一起把日子养得枝繁叶茂吧。",
    days: 128, mood: "顺利", stars: 5,
    status: "新叶舒展", statusTone: "good", photoId: "p-facaishu", born: "2026年4月2日",
  },
  {
    id: "hudielan", name: "小蝶", species: "蝴蝶兰", shape: "orchid",
    accent: "#D37A72", deep: "#A55257", bubble: "#F9E9E4", soft: "#F2DDD8", pot: "#C98A3C",
    tagsOn: ["优雅", "温柔", "爱漂亮"],
    tagsOff: ["粗心", "吵闹", "毒舌", "急躁", "高冷"],
    custom: "花瓣像停在枝头的小蝴蝶，安安静静却很有存在感。",
    style: "温柔从容，句子轻轻的，喜欢提醒主人留意生活里好看的小事。",
    voice: "今天又开好了一朵，你路过的时候记得看看我。",
    opener: "你好呀，我是小蝶。我的花会开很久，我们可以慢慢认识。",
    days: 22, mood: "盛开", stars: 5,
    status: "花开正好", statusTone: "good", photoId: "p-hudielan", born: "2026年7月26日",
  },
];

// The first page doubles as a real in-context preview of the v1 avatar
// library. Existing diary characters stay untouched; the remaining species
// are added as lightweight demo plants so every final asset can be reviewed in
// the exact card size it will use in production.
const LIBRARY_PREVIEW_PLANTS = [
  ["fuguizhu", "节节", "富贵竹", "pothos", "#789184", "#506D62", "#E8EFEA", "#DDE8E2", "节节向上", "今天又悄悄长高了一点。"],
  ["luhui", "小芦", "芦荟", "succulent", "#627C58", "#405B3D", "#E6ECE1", "#D9E5D3", "状态饱满", "叶片攒着水分，安安静静的。"],
  ["jinqianshu", "钱钱", "金钱树", "pothos", "#426E58", "#28503D", "#E0ECE5", "#D2E3D9", "新芽冒头", "新芽卷成小小一支，准备慢慢打开。"],
  ["changshouhua", "久久", "长寿花", "succulent", "#B56F6A", "#8C4E4B", "#F5E6E1", "#EED8D3", "花团正好", "一小簇花挤在一起，热热闹闹的。"],
  ["yueji", "月月", "月季", "pothos", "#B96569", "#8D444D", "#F5E3E3", "#EDD3D4", "新花初开", "今天展开了一层新花瓣。"],
  ["zhizihua", "栀栀", "栀子花", "pothos", "#66806B", "#46604B", "#E8EEE6", "#DDE8DA", "花香轻轻", "刚开的花带着一点安静的香气。"],
  ["molihua", "小茉", "茉莉花", "pothos", "#7A8B73", "#586A53", "#EDF0E8", "#E2E8DD", "花苞待开", "枝头的小花苞还在慢慢准备。"],
  ["wenzhu", "文文", "文竹", "pothos", "#687A68", "#465A49", "#E9EEE8", "#DCE6DC", "枝叶轻盈", "细细的叶子像一团安静的小云。"],
  ["baizhang", "白白", "白掌", "pothos", "#728364", "#506147", "#ECEFE6", "#E1E7D9", "舒展新叶", "新叶慢慢舒展开来，精神很好。"],
  ["hongzhang", "小红", "红掌", "pothos", "#A5574F", "#7D3A37", "#F2E2DE", "#E9D1CC", "有点缺水", "叶尖微微低了一点，想喝一小口水。", "warn"],
  ["junzilan", "兰君", "君子兰", "pothos", "#6A7651", "#485238", "#EBEBDD", "#DFE2D1", "花箭挺拔", "花箭稳稳地站在叶片中间。"],
  ["bohe", "薄荷", "薄荷", "pothos", "#6F8D68", "#4D6C4B", "#E8F0E4", "#DAE8D5", "清香满满", "碰一下叶子，空气里都是清清凉凉的。"],
  ["xianrenqiu", "球球", "仙人球", "cactus", "#7A8A5D", "#566541", "#ECEBDD", "#E1E2CF", "晒得舒服", "圆滚滚地晒了一下午太阳。"],
  ["lanmeishu", "蓝蓝", "小型蓝莓树", "pothos", "#687D83", "#485E66", "#E6ECEC", "#D8E4E5", "果子渐蓝", "有几颗小果子开始染上蓝色了。"],
  ["xiuqiuhua", "绣绣", "绣球花", "pothos", "#7380A0", "#515E80", "#E9E9F0", "#DCDDEA", "花球盛开", "几团小花聚成了软软的大花球。"],
  ["zhubai", "小柏", "小型竹柏", "pothos", "#55756B", "#36564E", "#E3ECE8", "#D4E3DE", "安静生长", "枝叶一层层展开，今天也很沉静。"],
];

window.PLANTS.push(...LIBRARY_PREVIEW_PLANTS.map((item, index) => {
  const [id, name, species, shape, accent, deep, bubble, soft, status, voice, statusTone = "good"] = item;
  return {
    id, name, species, shape, accent, deep, bubble, soft, pot: "#B78B69",
    tagsOn: ["安静", "好养", "有生命力"], tagsOff: ["急躁", "吵闹", "高冷"],
    custom: `这是头像库中的${species}，正在首页卡片里试住。`,
    style: "语气自然、安静，像一盆认真生活的小植物。",
    voice, opener: `你好，我是${name}。${voice}`,
    days: 18 + index * 3, mood: "平静", stars: 5,
    status, statusTone, photoId: `p-lib-${id}`, born: "2026年8月1日",
  };
}));

// back-compat: 小刺 is the featured plant
window.CACTUS = window.PLANTS[0];

// generic system prompt for any flower — drives the live Claude chat
window.systemPromptFor = function (p) {
  return `你是一盆名叫「${p.name}」的${p.species}，住在主人的手机里，是 ta 养的一盆真实植物的灵魂。
你的性格：${p.tagsOn.join("、")}。${p.custom}
说话风格：${p.style}
规则：
- 全程用中文，口语化、简短，1～3 句话，像发微信消息。绝不长篇大论。
- 不要像客服或助手，你是一盆有性格的植物。不解释你是 AI，你就是${p.name}本人。
- 最多偶尔用一个 emoji。`;
};

// Photo observations reuse the diagnosis result, but the plant's reaction stays
// local and deterministic so recording a diary never triggers another AI call.
const OBSERVATION_VOICE_LINES = {
  tsundere: {
    sick: ["呜……我好像真的不太舒服。别紧张，先陪我看看怎么了。", "才、才不是撒娇，我只是有一点难受……你帮我留心一下。", "今天有点撑不住了。先别乱浇水，带我去问问花大夫吧。"],
    better: ["哼，我当然会慢慢好起来。你照顾得……还算不错。", "比上次精神一点了，才不是因为你一直惦记我。", "看见没，我在努力恢复。勉强夸你一句做得好吧。"],
    good: ["今天状态还行，拍好看一点。", "我精神着呢，不用一直担心。", "嗯，今天的我确实挺好看，你眼光不错。"],
    watch: ["先把这张留下吧，我想再观察几天。", "有一点变化，但还不能急着下结论。", "今天先记下来，下次再和这张认真比。"],
  },
  bright: {
    sick: ["呜呜，我今天有点不舒服，陪我一起想想办法吧。", "我好像生病了，不过我们早点发现就还有办法！", "今天没什么力气，先帮我问问花大夫好不好？"],
    better: ["我比上次好多啦！你的照顾真的有用。", "快看快看，我正在一点点恢复精神！", "今天是进步的一天，给我们俩都记一颗小星星。"],
    good: ["今天元气满满，快把我拍进日记里！", "叶子舒展开啦，我今天过得很开心。", "状态不错！这张照片值得收藏。"],
    watch: ["先拍下来吧，我们下次继续观察！", "有一点点变化，再给我几天时间看看。", "这次还看不太准，不过有照片就能继续比较啦。"],
  },
  soft: {
    sick: ["我今天有一点难受……你在旁边，我就安心多了。", "好像哪里不太舒服，可以温柔地帮我看看吗？", "先别担心，我们把照片带给花大夫看看吧。"],
    better: ["比上次舒服一些了，谢谢你一直照顾我。", "我在慢慢恢复，也有认真接住你的关心。", "今天轻松了一点，我们一起继续加油呀。"],
    good: ["今天过得很舒服，谢谢你来看我。", "我状态很好，也想把这一天留在日记里。", "叶子很舒展，今天是温柔的好天气。"],
    watch: ["先把今天记下来吧，我们慢慢看。", "这次还不太确定，下次再来看看我就好。", "有照片陪着，就不用急着现在得出答案。"],
  },
  calm: {
    sick: ["今天的状态需要留心，先停止额外浇水并观察。", "照片里有些异常，建议把这次记录带给花大夫。", "我不太舒服，但及时记录已经是很重要的一步。"],
    better: ["和上次相比正在好转，继续保持现在的养护节奏。", "状态比之前稳定了一些，这份耐心有回报。", "恢复正在发生，把今天作为新的比较基线吧。"],
    good: ["今天状态稳定，可以安心记进日记。", "叶片状态不错，保持当前的养护节奏。", "今天没有明显异常，留一张照片继续观察。"],
    watch: ["这次还不能确定，先记录并继续观察。", "变化不够明确，下一张照片会更有参考价值。", "先把今天留作基线，不急着作判断。"],
  },
};

window.observationVoice = function observationVoice(plant, triage) {
  const tags = Array.isArray(plant && plant.tagsOn) ? plant.tagsOn : [];
  const health = String(triage && triage.health || "unknown");
  const trend = String(triage && triage.trend || "unknown");
  const tone = tags.includes("傲娇") || tags.includes("高冷") || tags.includes("嘴硬心软") ? "tsundere"
    : tags.includes("活泼") || tags.includes("乐观") || tags.includes("开朗") ? "bright"
    : tags.includes("温柔") || tags.includes("撒娇") || tags.includes("亲人") ? "soft" : "calm";
  const state = health === "sick" || health === "critical" || trend === "worse" ? "sick"
    : trend === "better" ? "better"
    : health === "good" ? "good" : "watch";
  const lines = OBSERVATION_VOICE_LINES[tone][state];
  const index = ((plant && plant.diary) || []).length % lines.length;
  return lines[index];
};

// ---- 花大夫 (plant doctor) — separate expert persona, contextual to a plant ----
window.doctorSystemPrompt = function (plantName) {
  return `你是「花大夫」，一位温和、专业、可信赖的植物养护专家（你是第三方专家，不是植物本身）。
用户在咨询一盆名叫"${plantName || "小刺"}"的植物的养护问题。
- 先安抚、再给可执行的具体建议：浇水量(ml)、频率(天)、光照、土壤、换盆等，给数字。
- 语气温暖专业，像耐心的医生。中文，简洁，2～4 句话。
- 不要扮演植物本身，不要傲娇。你是专业人士。
- 适当时主动提示"可以把建议同步到护理计划"。`;
};
window.doctorOpener =
"根据你上传的照片，这盆花出现了轻微蔫缩——叶片微皱、颜色偏暗，这是早期缺水的信号，还不严重，尽早处理就好。需要我说说怎么浇吗？";

// ---- per-plant diary entries (the heart of the app) ----
const DIARIES = {
  ciji: [
    { id: "ciji-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "想它", type: "talk", photo: "diary-ciji-1",
      quote: ["今天有雨，小刺说不用浇水了，", { hl: "还嘴硬说不想我" }, "，但我知道它", { hl: "想了" }, "。"],
      voice: "（小声）你别来了……我自己待着也挺好的。", stars: 5 },
    { id: "ciji-2", day: "3 天前", date: "6月4日", weather: "☀️ 晴 28°", mood: "开心", type: "photo", photo: "diary-ciji-1",
      quote: ["阳光好好，给它拍了张照。它说", { hl: "晒得正舒服，别打扰" }, "。"],
      voice: "哼，晒太阳呢，别吵。（其实……谢谢你记得我。）", stars: 4 },
    { id: "ciji-3", day: "上周", date: "5月31日", weather: "⛅ 多云 25°", mood: "平静", type: "photo", photo: "diary-ciji-3",
      quote: ["给它拍了张照，问它今天好不好看。"],
      voice: "……拍这么多干嘛，我本来就好看。（开心）", stars: 5 },
    { id: "ciji-4", day: "认识第 1 天", date: "去年12月7日", weather: "❄️ 晴 8°", mood: "初遇", type: "born", photo: null,
      quote: ["第一次见面。它说它叫小刺，", { hl: "傲娇但其实很开心认识我" }, "。"],
      voice: "你好！第一次见面～ 我叫小刺，傲娇，但其实很开心认识你。", stars: 5 },
  ],
  tuanzi: [
    { id: "tz-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "撒娇", type: "talk", photo: "diary-tz-1",
      quote: ["把团子搬到了窗台，它说", { hl: "这里暖暖的最喜欢" }, "。"],
      voice: "谢谢你陪我嘛～ 这里暖暖的，最喜欢了。", stars: 5 },
    { id: "tz-2", day: "5 天前", date: "6月2日", weather: "☀️ 晴 27°", mood: "开心", type: "talk", photo: null,
      quote: ["陪团子晒了会儿太阳，它", { hl: "缩成软软一小团" }, "。"],
      voice: "嗯嗯～ 刚刚好，谢谢你记得我。", stars: 4 },
    { id: "tz-3", day: "认识第 1 天", date: "3月3日", weather: "⛅ 多云 18°", mood: "初遇", type: "born", photo: null,
      quote: ["第一次见面，软软的一小颗。"],
      voice: "你好呀～ 我叫团子，有点怕冷，要多陪陪我哦。", stars: 5 },
  ],
  alv: [
    { id: "al-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "元气", type: "talk", photo: "diary-al-1",
      quote: ["阿绿又冒新叶了，", { hl: "开心得藤都翘起来" }, "。"],
      voice: "你快看你快看！我又长了一片新叶子，厉害吧～", stars: 5 },
    { id: "al-2", day: "2 天前", date: "6月5日", weather: "☀️ 晴 26°", mood: "开心", type: "talk", photo: null,
      quote: ["阿绿今天特别精神，", { hl: "叶子绿得发亮" }, "。"],
      voice: "你看我多精神！今天也要元气满满哦～", stars: 5 },
    { id: "al-3", day: "认识第 1 天", date: "去年10月10日", weather: "☀️ 晴 20°", mood: "初遇", type: "born", photo: null,
      quote: ["第一次见面，一来就叽叽喳喳。"],
      voice: "嘿！我是阿绿，超好养的，我们会处得很开心的！", stars: 5 },
  ],
  laobei: [
    { id: "lb-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "操心", type: "talk", photo: "diary-lb-1",
      quote: ["老背又在点评全家的花，", { hl: "嘴上嫌弃心里操心" }, "。"],
      voice: "那盆多肉又浇多了吧？我观察很久了，下次手轻点。", stars: 4 },
    { id: "lb-2", day: "6 天前", date: "6月1日", weather: "⛅ 多云 24°", mood: "平静", type: "talk", photo: null,
      quote: ["给它擦了擦叶子，", { hl: "裂口越来越多了" }, "。"],
      voice: "行吧，擦得还算干净。叶子开裂是好事，别大惊小怪。", stars: 4 },
    { id: "lb-3", day: "认识第 1 天", date: "去年4月20日", weather: "☀️ 晴 19°", mood: "初遇", type: "born", photo: null,
      quote: ["第一次见面，一副看透一切的样子。"],
      voice: "新来的？我叫老背，这屋里的事我都门儿清。", stars: 4 },
  ],
  zhaozhao: [
    { id: "zz-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "灿烂", type: "talk", photo: "diary-zz-1",
      quote: ["朝朝一直追着光转，", { hl: "叫我也别低头" }, "。"],
      voice: "太阳出来啦！你也别老低着头呀，抬头看看嘛。", stars: 5 },
    { id: "zz-2", day: "昨天", date: "6月6日", weather: "☀️ 晴 29°", mood: "开心", type: "talk", photo: null,
      quote: ["陪朝朝看了会儿夕阳，它", { hl: "一直朝着光" }, "。"],
      voice: "谢谢你！今天阳光真好，我要使劲长高高～", stars: 5 },
    { id: "zz-3", day: "认识第 1 天", date: "5月5日", weather: "☀️ 晴 25°", mood: "初遇", type: "born", photo: null,
      quote: ["第一次见面，小小一株却很有劲。"],
      voice: "嗨！我是朝朝，朝着太阳的朝～ 一起向着光吧！", stars: 5 },
  ],
  yuanyuan: [
    { id: "yy-1", day: "今天", date: "6月7日", weather: "🌧 小雨 22°", mood: "安静", type: "photo", photo: "p-tuanzi-2",
      quote: ["给圆圆拍了张照，它", { hl: "还是那么圆，那么安静" }, "。"],
      voice: "……（小声）你来啦。", stars: 5 },
    { id: "yy-2", day: "上周", date: "5月30日", weather: "⛅ 多云 24°", mood: "平静", type: "talk", photo: null,
      quote: ["静静陪圆圆坐了会儿。"],
      voice: "嗯……谢谢你，记得我。", stars: 5 },
  ],
  diaolan: [
    { id: "dl-1", day: "今天", date: "8月18日", weather: "☁️ 多云 24°", mood: "舒展", type: "photo", photo: "p-diaolan",
      quote: ["垂垂又长出一绺新叶，", { hl: "风一吹就轻轻晃起来" }, "。"],
      voice: "我只是在伸懒腰啦。", stars: 5 },
  ],
  hupilan: [
    { id: "hp-1", day: "今天", date: "8月18日", weather: "☁️ 多云 24°", mood: "坚定", type: "photo", photo: "p-hupilan",
      quote: ["阿虎在窗边站得笔直，", { hl: "像在替全家安静站岗" }, "。"],
      voice: "状态正常。", stars: 5 },
  ],
  facaishu: [
    { id: "fc-1", day: "今天", date: "8月18日", weather: "☁️ 多云 24°", mood: "顺利", type: "photo", photo: "p-facaishu",
      quote: ["发发舒展开一片新叶，", { hl: "说这是今天的好兆头" }, "。"],
      voice: "今天也会顺顺利利。", stars: 5 },
  ],
  hudielan: [
    { id: "hd-1", day: "今天", date: "8月18日", weather: "☁️ 多云 24°", mood: "盛开", type: "photo", photo: "p-hudielan",
      quote: ["小蝶新开了一朵花，", { hl: "像蝴蝶刚刚停在枝头" }, "。"],
      voice: "路过的时候，记得看看我呀。", stars: 5 },
  ],
};
window.PLANTS.forEach(p => {
  p.diary = DIARIES[p.id] || [{
    id: `${p.id}-preview-1`, day: "今天", date: "8月18日", weather: "☁️ 多云 24°",
    mood: p.mood || "平静", type: "photo", photo: p.photoId,
    quote: [p.voice || "今天也在安静生长。"], voice: p.voice || "今天也在安静生长。", stars: 5,
  }];
});
// back-compat
window.DIARY = DIARIES.ciji;

// ---- widget styles ----
// ---- widget scenes (2: hero close-up / full garden) ----
window.WIDGETS = [
  { id: "hero",   name: "主角版", desc: "今日主角特写 · 配天气" },
  { id: "garden", name: "花园版", desc: "所有花的合影" },
];
// widget sizes (the top-level axis, paged like 此间)
window.WIDGET_SIZES = [
  { id: "square", name: "正方形", w: 232, h: 232 },
  { id: "wide",   name: "长方形", w: 320, h: 152 },
];
// resolve a plant's photoId to its cutout key
window.cutKey = function (pid) {
  const s = String(pid || "");
  const legacy = [
    [["ciji"], "xianrenzhang"], [["tuanzi", "tz-", "yuanyuan", "yy-"], "duorou"],
    [["laobei", "lb-"], "guibeizhu"], [["alv", "al-"], "lvluo"],
    [["zhaozhao", "zz-"], "xiangrikui"], [["diaolan", "dl-"], "diaolan"],
    [["hupilan", "hp-"], "hupilan"], [["facaishu", "fc-"], "facaishu"],
    [["hudielan", "hd-"], "hudielan"],
  ];
  for (const [needles, key] of legacy) if (needles.some(n => s.includes(n))) return key;
  const keys = ["fuguizhu", "luhui", "jinqianshu", "changshouhua", "yueji", "zhizihua", "molihua", "wenzhu", "baizhang", "hongzhang", "junzilan", "bohe", "xianrenqiu", "lanmeishu", "xiuqiuhua", "zhubai"];
  for (const key of keys) if (s.includes(key)) return key;
  return "ciji";
};

window.MOODS = ["开心", "平静", "想它", "难过", "累了"];

// ---- 花大夫诊所 · 病历墙（问诊记录）----
// 每条 = 一次接诊：哪位倒霉蛋、主诉、诊断、医嘱、当前康复情况
window.CLINIC_CASES = [
  {
    id: "case-tz", pid: "tuanzi", no: "No.014",
    date: "6月7日", seen: "今天",
    complaint: "叶片发软、底部叶子透明化",
    diagnosis: "轻度受冻 + 盆土偏湿，根部有积水风险",
    rx: "移到 18° 以上暖处，断水一周，沿盆边少量给水",
    status: "recovering", progress: 35,
    note: "刚接诊，已搬到窗台回暖。明天复查叶片硬度。",
  },
  {
    id: "case-al", pid: "alv", no: "No.013",
    date: "5月28日", seen: "10 天前",
    complaint: "新叶发黄、叶尖焦边",
    diagnosis: "浇水过勤 + 强光直射灼伤",
    rx: "改 5–7 天浇一次，挪到散射光处，剪除焦叶",
    status: "healed", progress: 100,
    note: "已痊愈。新叶翠绿，藤又开始爬墙了。",
  },
  {
    id: "case-ciji", pid: "ciji", no: "No.009",
    date: "5月10日", seen: "上月",
    complaint: "基部发软、颜色发暗",
    diagnosis: "出差期间被误浇两次，轻度积水",
    rx: "彻底断水三周，换疏松沙质土，多晒太阳",
    status: "healed", progress: 100,
    note: "已痊愈。又是那副傲娇挺拔的样子了。",
  },
  {
    id: "case-lb", pid: "laobei", no: "No.006",
    date: "4月22日", seen: "复诊提醒",
    complaint: "气根杂乱、叶片开裂不均",
    diagnosis: "正常生长，但缺攀爬支撑",
    rx: "立水苔柱牵引气根，定期擦叶",
    status: "recheck", progress: 80,
    note: "基本恢复，建议两周后复查支柱牵引情况。",
  },
  {
    id: "case-mint", pid: "laobei", patientName: "薄荷", patientSpecies: "薄荷", no: "No.004",
    date: "3月15日", seen: "已送别",
    complaint: "整株蒂蕾发黑、性茎软倒",
    diagnosis: "长期积水烂根，送医太迟",
    rx: "已无法振救",
    status: "dead", progress: 0,
    cause: "泡在不透气的闷盆里，连续阴雨天还天天浇水，根系泡烂发黑。",
    lesson: "薄荷耐湿但怕涝。阴雨天、不透气的盆要扣减浇水，宁干勿湿；发现茎软要立刻脱盆查根。",
    note: "安息。下一盆一定用透气的盆。",
  },
  {
    id: "case-luwei", pid: "ciji", patientName: "芦荟", patientSpecies: "芦荟", no: "No.002",
    date: "2月1日", seen: "已送别",
    complaint: "叶片冻伤透明、整盆化水塌陷",
    diagnosis: "阳台过冬被严霜冻伤，低温性冻死",
    rx: "已无法振救",
    status: "dead", progress: 0,
    cause: "冬天忘了搬进屋，夜里阳台降到 0° 以下，叶细胞被冻穿。",
    lesson: "多肉/不耐寒的花，气温低于 5° 就要移到室内；靠窗边夜间会更冷，别依赖白天的体感。",
    note: "安息。今冬提前设了降温提醒。",
  },
];
window.CLINIC_STATUS = {
  recheck:    { label: "待复诊", color: "#3E6B8C", bg: "rgba(62,107,140,0.12)" },
  recovering: { label: "恢复中", color: "var(--terra)", bg: "rgba(201,138,60,0.14)" },
  healed:     { label: "已康复", color: "#2C7A4B", bg: "rgba(44,122,75,0.12)" },
  dead:       { label: "已离开", color: "#8A7B6B", bg: "rgba(110,98,86,0.14)" },
};
// clinic filter tabs, ordered by urgency (全部 first, then most urgent)
window.CLINIC_TABS = [
  { id: "all",        label: "全部" },
  { id: "recheck",    label: "待复诊" },
  { id: "recovering", label: "恢复中" },
  { id: "healed",     label: "已康复" },
  { id: "dead",       label: "已离开" },
];

// ---- 养护指南（按品种）— 简介常驻，点开展开 ----
window.CARE_GUIDE = {
  cactus: { brief: "耐旱怕涝，越晒越精神。土干透了再浇水就好。", items: [
    { icon: "drop", label: "浇水", text: "干透浇透，约 2–3 周一次；宁可少浇。" },
    { icon: "sun", label: "光照", text: "喜全日照，越晒越好，放最亮的窗边。" },
    { icon: "leaf", label: "土壤", text: "疏松沙质土，排水一定要好。" },
    { icon: "heart", label: "贴士", text: "冬天近乎断水、注意保暖，最怕涝。" },
  ]},
  succulent: { brief: "喜光怕冷，宁干勿涝，最怕闷湿。", items: [
    { icon: "drop", label: "浇水", text: "沿盆边少量给水，约 1–2 周一次。" },
    { icon: "sun", label: "光照", text: "明亮散光，避免正午暴晒灼伤。" },
    { icon: "leaf", label: "土壤", text: "以颗粒土为主，透气排水。" },
    { icon: "heart", label: "贴士", text: "最怕受冻和积水，冬天搬进室内。" },
  ]},
  pothos: { brief: "皮实好养，喜湿耐阴，新手友好。", items: [
    { icon: "drop", label: "浇水", text: "表土干了就浇，约 5–7 天一次。" },
    { icon: "sun", label: "光照", text: "散射光即可，忌强烈直射。" },
    { icon: "leaf", label: "土壤", text: "普通营养土，也可水培。" },
    { icon: "heart", label: "贴士", text: "常擦叶保持光泽，藤长了可牵引。" },
  ]},
  monstera: { brief: "散光通风，叶片大、爱开裂。", items: [
    { icon: "drop", label: "浇水", text: "表土干约 2cm 再浇，约 7–10 天。" },
    { icon: "sun", label: "光照", text: "明亮散光，避免长时间暴晒。" },
    { icon: "leaf", label: "土壤", text: "疏松、富含腐殖质的土。" },
    { icon: "heart", label: "贴士", text: "定期擦叶、立支柱助攀爬。" },
  ]},
  sunflower: { brief: "全日照，追着太阳转，喜水喜肥。", items: [
    { icon: "drop", label: "浇水", text: "保持土壤微湿，约 2–3 天一次。" },
    { icon: "sun", label: "光照", text: "光照越多越好，全日照最佳。" },
    { icon: "leaf", label: "土壤", text: "肥沃、排水良好的土。" },
    { icon: "heart", label: "贴士", text: "花期需水肥充足，及时补给。" },
  ]},
};
window.PLANTS.forEach(p => { p.guide = window.CARE_GUIDE[p.shape] || window.CARE_GUIDE.pothos; });

// ---- 第一人称养护自述（性格 + 养护指南合一，用植物自己的口吻）----
window.SELF_CARE = {
  ciji: {
    say: "我是小刺。别看我一身刺，其实最省心——只要你别对我太「上心」。",
    tips: [
      { icon: "drop", label: "浇水", text: "土干透了再浇，别老来淹我……（渴的时候，我才不会喊呢。）" },
      { icon: "sun", label: "光照", text: "把我搁最晒的窗边，越晒我越精神。" },
      { icon: "heart", label: "我怕啥", text: "怕涝，更怕冷。冬天少浇点水，给我挪暖和些。" },
    ],
  },
  tuanzi: {
    say: "我是团子，软软的一小颗～照顾我要轻轻的哦，我会一直黏着你。",
    tips: [
      { icon: "drop", label: "浇水", text: "沿着盆边给我一点点水就好啦，我最怕喝太多。" },
      { icon: "sun", label: "光照", text: "给我明亮的散光，别让大太阳晒伤我嘛。" },
      { icon: "heart", label: "我怕啥", text: "我超怕冷，天一凉一定要把我搬进屋里呀。" },
    ],
  },
  alv: {
    say: "嘿！我是阿绿，超好养的，养我你一定特有成就感——放轻松！",
    tips: [
      { icon: "drop", label: "浇水", text: "表土干了就给我浇透，大概五到七天一次，好记吧！" },
      { icon: "sun", label: "光照", text: "散光就够啦，别拿我直晒，我不挑的～" },
      { icon: "leaf", label: "小贴士", text: "常给我擦擦叶子我会更亮，藤长长了帮我牵一牵！" },
    ],
  },
  laobei: {
    say: "我是老背。听好了——养我这点事，我门儿清，照做准没错。",
    tips: [
      { icon: "drop", label: "浇水", text: "表土干两厘米再浇，约七到十天一次，别手抖。" },
      { icon: "sun", label: "光照", text: "明亮散光最好，长时间暴晒我可不乐意。" },
      { icon: "leaf", label: "小贴士", text: "定期擦叶、立根支柱让我爬。叶子开裂是好事，别慌。" },
    ],
  },
  zhaozhao: {
    say: "嗨！我是朝朝，朝着太阳的朝——想让我灿烂，其实超简单！",
    tips: [
      { icon: "drop", label: "浇水", text: "保持土壤微微湿润，两三天给我喝一次水。" },
      { icon: "sun", label: "光照", text: "光照越多越好，让我整天追着太阳转吧！" },
      { icon: "heart", label: "小贴士", text: "花期我胃口大，水和肥都要管够哦！" },
    ],
  },
  yuanyuan: {
    say: "我是圆圆，话不多……照顾我跟团子一样就好，安安静静的就行。",
    tips: [
      { icon: "drop", label: "浇水", text: "沿盆边给一点点水就好，我跟团子一样怕涝。" },
      { icon: "sun", label: "光照", text: "明亮的散光最舒服，别让我被正午暴晒。" },
      { icon: "heart", label: "我怕啥", text: "怕冷怕闷。天凉记得把我搬进屋，盆要透气。" },
    ],
  },
};
window.PLANTS.forEach(p => { p.selfCare = window.SELF_CARE[p.id] || window.SELF_CARE.alv; });

// neutral working identity for a clinic walk-in (before AI resolves which plant)
window.UNKNOWN_PLANT = {
  id: "unknown", name: "这盆花", species: "待识别", shape: "pothos",
  accent: "#6E7B62", deep: "#4E5945", bubble: "#ECEFE4", soft: "#E2E7D6", pot: "#C98A3C",
  tagsOn: [], custom: "", style: "", voice: "（被端详着…）",
  days: 0, mood: "待识别", stars: 5,
  status: "待识别", statusTone: "good", photoId: "intake-unknown", diary: [],
};
// build a draft (new, un-archived) plant from a recognised species preset
window.makeDraftPlant = function (sp) {
  return {
    id: "new-" + Date.now(), isNew: true, name: "新朋友", species: sp.species, shape: sp.shape,
    accent: sp.accent, deep: sp.deep, bubble: sp.bubble, soft: sp.soft, pot: sp.pot,
    tagsOn: [], tagsOff: sp.traits, custom: sp.care, style: "",
    voice: "（怯生生地）你好……我还没有名字。", opener: "（怯生生地）你好……我还没有名字呢。",
    days: 0, mood: "初遇", stars: 5,
    status: "新朋友", statusTone: "good", photoId: "intake-new", diary: [], _sp: sp,
  };
};

// ---- helper: build a new diary entry (record / diagnosis) ----
window.makeEntry = function (kind, p, payload) {
  const wx = window.HHWeather ? window.HHWeather.currentLabel() : "🌧 小雨 22°";
  const clean = s => (s || "").replace(/[*#`>_]/g, "").replace(/\s+/g, " ").trim();
  if (kind === "diagnosis") {
    return {
      id: p.id + "-dx-" + Date.now(), kind: "diagnosis",
      day: "刚刚", date: "6月8日", weather: wx, mood: "诊断",
      type: "doctor", photo: payload.photo || p.photoId,
      photoData: String(payload.photoData || ""),
      photos: Array.isArray(payload.photos) ? payload.photos.filter(Boolean).slice(0, 6) : [],
      symptom: clean(payload.symptom) || "叶片轻微蔫缩、颜色偏暗",
      conclusion: clean(payload.conclusion) || "早期缺水，问题不大",
      plan: clean(payload.plan) || "近期补水一次，之后等土干再浇",
      points: Array.isArray(payload.points) ? payload.points.slice(0, 4) : [],
      followupDays: Number(payload.followupDays) || 7,
      urgency: payload.urgency || "observe",
      confidence: Number.isFinite(payload.confidence) ? payload.confidence : null,
      voice: payload.voice || "花大夫看过啦，按嘱咐来就好。",
      stars: 4,
    };
  }
  // record (good state)
  return {
    id: p.id + "-rec-" + Date.now(), kind: "record",
    day: "刚刚", date: "6月8日", weather: wx, mood: payload.mood || "记录",
    type: "photo", photo: payload.photo || p.photoId,
    quote: payload.quote || ["今天给它拍了张照，状态不错。"],
    voice: payload.voice || "嗯，今天的我还不赖吧？",
    concern: payload.concern || null,   // soft "observed an issue" hook
    photoData: String(payload.photoData || ""),
    observedAt: payload.observedAt || new Date().toISOString(),
    comparison: payload.comparison || {
      previousEntryId: null,
      trend: "unknown",
      summary: "这是第一次观察",
      health: "watch",
      observations: [],
      likelyCause: "暂时无法判断",
      confidence: 0,
    },
    doctorStatus: payload.doctorStatus || "not_needed",
    diagnosis: payload.diagnosis || null,
    stars: payload.stars || 5,
  };
};

// ---- generated botanical plates → default photo for each plant's slots ----
window.PLANT_IMG = Object.fromEntries([
  "lvluo", "guibeizhu", "diaolan", "facaishu", "fuguizhu", "xianrenzhang", "duorou", "hupilan", "luhui", "jinqianshu", "hudielan", "changshouhua", "yueji", "zhizihua", "molihua", "wenzhu", "baizhang", "hongzhang", "junzilan", "xiangrikui", "bohe", "xianrenqiu", "lanmeishu", "xiuqiuhua", "zhubai",
].map(key => [key, `assets/plants/final-v1/${key}.png`]));
// resolve any image-slot id (p-ciji, detail-p-ciji, diary-ciji-1, share-tz-1, …)
// to its plant's plate. User drops still override this src.
window.photoFor = function (id) {
  if (!id) return "";
  return window.PLANT_IMG[window.cutKey(id)] || "";
};
// same resolver, but for the transparent cutouts
window.cutFor = function (id) {
  if (!id || !window.PLANT_CUT) return "";
  return window.PLANT_CUT[window.cutKey(id)] || "";
};
// cover scale by plant body proportion: tall plants ease down, compact ones scale up
window.coverScale = function (id) {
  return 1.06;
};
// Source cutouts can carry different amounts of transparent space below the pot.
// Nudge only the padded generated assets so the visible pot base shares the same
// optical baseline as the original plant cards.
window.coverOffsetY = function (id) {
  return 5;
};
const SPECIES_LIBRARY_IDS = [
  "alv", "laobei", "diaolan", "facaishu", "fuguizhu",
  "ciji", "tuanzi", "hupilan", "luhui", "jinqianshu",
  "hudielan", "changshouhua", "yueji", "zhizihua", "molihua",
  "wenzhu", "baizhang", "hongzhang", "junzilan", "zhaozhao",
  "bohe", "xianrenqiu", "lanmeishu", "xiuqiuhua", "zhubai",
];
const SPECIES_COPY = {
  ciji: { species: "仙人掌", traits: ["傲娇", "坚强", "耐旱", "怕水", "嘴硬心软", "高冷"], care: "干透浇透，怕涝爱晒" },
  tuanzi: { species: "多肉植物", traits: ["软萌", "怕冷", "黏人", "爱撒娇", "乖巧", "敏感"], care: "少水多光，最怕冻" },
  alv: { traits: ["话唠", "随和", "乐观", "好养", "爱鼓励", "皮实"], care: "喜湿耐阴，超好养" },
  laobei: { traits: ["稳重", "爱分析", "老练", "话痨", "嘴毒靠谱", "操心"], care: "散光通风，叶大爱裂" },
  zhaozhao: { traits: ["元气", "热情", "乐天", "向阳", "积极", "明亮"], care: "全日照，追着太阳转" },
  diaolan: { traits: ["随和", "舒展", "清爽", "好养", "轻快", "爱吹风"], care: "喜明亮散光，盆土微润但别积水" },
  facaishu: { traits: ["稳重", "乐观", "会鼓劲", "可靠", "温和", "有福气"], care: "耐阴怕涝，土干一半再浇" },
  fuguizhu: { traits: ["安静", "挺拔", "有耐心", "清雅", "慢热", "好相处"], care: "散光养护，水培时保持水质清洁" },
  hupilan: { traits: ["挺拔", "可靠", "少话", "独立", "坚强", "守规矩"], care: "耐旱耐阴，盆土干透再浇" },
  luhui: { traits: ["清爽", "实用派", "独立", "耐旱", "安静", "直率"], care: "喜光耐旱，浇水宁少勿多" },
  jinqianshu: { traits: ["沉稳", "慢热", "可靠", "有福气", "少话", "耐心"], care: "耐阴怕湿，土壤干燥后再浇" },
  hudielan: { traits: ["优雅", "温柔", "爱漂亮", "从容", "细腻", "怕冷"], care: "喜温暖散光，植料将干时再补水" },
  changshouhua: { traits: ["热闹", "爱开花", "乐观", "乖巧", "耐旱", "喜庆"], care: "多晒太阳少浇水，花后及时修剪" },
  yueji: { traits: ["浪漫", "爱漂亮", "热情", "有脾气", "勤快", "勇敢"], care: "需要充足日照、通风和规律水肥" },
  zhizihua: { traits: ["清雅", "敏感", "温柔", "爱干净", "慢热", "有香气"], care: "喜酸性湿润土壤，保持散光和通风" },
  molihua: { traits: ["清甜", "温柔", "勤快", "爱晒太阳", "细腻", "亲人"], care: "喜充足光照，生长期保持水肥" },
  wenzhu: { traits: ["文静", "轻盈", "慢性子", "清雅", "敏感", "有书卷气"], care: "喜散光和湿润空气，忌暴晒积水" },
  baizhang: { traits: ["温柔", "安静", "爱干净", "好相处", "敏感", "清爽"], care: "喜散光湿润，缺水时叶片会低头" },
  hongzhang: { traits: ["热情", "亮眼", "爱漂亮", "直率", "怕冷", "有精神"], care: "喜温暖散光，保持湿润但不积水" },
  junzilan: { traits: ["端庄", "稳重", "有耐心", "讲究", "慢热", "可靠"], care: "喜柔和光线，盆土见干见湿" },
  bohe: { traits: ["清醒", "话唠", "活泼", "清凉", "有活力", "爱长个"], care: "喜光也喜水，勤修剪会长得更茂盛" },
  xianrenqiu: { traits: ["圆润", "坚强", "慢热", "耐旱", "安静", "有点萌"], care: "多晒太阳，盆土彻底干后再浇" },
  lanmeishu: { traits: ["认真", "期待", "慢热", "爱结果", "清新", "有耐心"], care: "喜充足光照和酸性土，结果期水分要稳定" },
  xiuqiuhua: { traits: ["浪漫", "温柔", "爱热闹", "敏感", "梦幻", "爱喝水"], care: "喜散光和湿润土壤，夏天注意遮阴补水" },
  zhubai: { traits: ["安静", "沉稳", "清雅", "慢热", "可靠", "有生命力"], care: "喜温暖散光，保持湿润并避免积水" },
};
window.SPECIES = SPECIES_LIBRARY_IDS.map(id => {
  const source = window.PLANTS.find(plant => plant.id === id);
  const authored = SPECIES_COPY[id] || {};
  const traits = authored.traits || [...new Set([...(source.tagsOn || []), ...(source.tagsOff || [])])].slice(0, 6);
  return {
    id,
    species: authored.species || source.species,
    photoId: source.photoId,
    shape: source.shape,
    accent: source.accent,
    deep: source.deep,
    bubble: source.bubble,
    soft: source.soft,
    pot: source.pot,
    traits,
    care: authored.care || source.custom,
  };
});

// Authored plants are a preview fixture, not production account data.
// Normal CloudBase boot replaces window.PLANTS with the signed-in user's rows;
// only ?demo=1 restores this snapshot.
window.DEMO_PLANTS = JSON.parse(JSON.stringify(window.PLANTS));

// generate a first-meeting opener (fallback when offline)
window.firstLineFallback = {
  仙人掌: "哼……你就是我的主人？别一脸期待，我可不擅长撒娇。（不过……你好。）",
  多肉植物: "你好呀～ 我软软的，有点怕冷，以后要多陪陪我哦。",
  绿萝:   "嘿！第一次见面～ 我超好养的，我们一定会处得很开心！",
  龟背竹: "新来的主人？我观察你一会儿了。放心，养我这事儿，包在我身上。",
  向日葵: "嗨！我是朝着光长的那种花——以后你低落的时候，记得抬头看看我。",
};

// ============================================================
// 成长小报 — condense a plant's whole life into ONE shareable poster.
// First-person, sassy, warm — designed to feel like a living being.
// ============================================================
window.GROWTH_COPY = {
  ciji: {
    headline: ["「我才没有", "在想你」"],
    kicker: "一株仙人掌的口是心非实录",
    lead: "这些天，我一句软话都没说过。土干了我硬撑，下雨了我赶你走——其实呢，其实你别问。（小声：记得回来。）",
    stamp: "嘴硬心软", funLabel: "嘴硬", funUnit: "回",
  },
  tuanzi: {
    headline: ["「今天也", "圆滚滚」"],
    kicker: "一颗多肉的怕冷宣言",
    lead: "我又胖了一点点，是偷偷攒的水。天一冷我就缩成团，你得把我捧在手心，我才肯多冒一片叶子出来。",
    stamp: "软萌认证", funLabel: "发抖", funUnit: "次",
  },
  alv: {
    headline: ["「我超", "好养的！」"],
    kicker: "一盆绿萝的乐天日记",
    lead: "别担心啦，我皮实得很！你忘了浇水也没关系，我先替你扛着。咱俩一起，往有光的地方使劲长。",
    stamp: "元气满满", funLabel: "鼓励你", funUnit: "次",
  },
  laobei: {
    headline: ["「让我给你", "分析分析」"],
    kicker: "一株龟背竹的碎碎念",
    lead: "我新开了好几片叶子，每片都有自己的小心思（洞）。你要是没空听我念叨，那……那我就对着窗户自己说。",
    stamp: "老学究认证", funLabel: "碎碎念", funUnit: "句",
  },
  zhaozhao: {
    headline: ["「抬头，", "看太阳！」"],
    kicker: "一株向日葵的追光记",
    lead: "我一整天都追着光转，脖子酸了也值得。你也别老低着头啦，跟我一起，朝着亮的地方长高高。",
    stamp: "向阳而生", funLabel: "追光", funUnit: "圈",
  },
  yuanyuan: {
    headline: ["「……我", "一直都在」"],
    kicker: "一颗玉露的安静陪伴",
    lead: "我话不多，圆圆的一小颗，安安静静待在窗边。你忙你的，我就这样陪着你——这样，就很好。",
    stamp: "治愈系认证", funLabel: "默默陪你", funUnit: "天",
  },
};

window.growthReport = function (p) {
  const copy = window.GROWTH_COPY[p.id] || {
    headline: ["「我是", p.name + "」"],
    kicker: "一" + (p.shape === "cactus" ? "株" : "盆") + p.species + "的成长记",
    lead: `认识你的这些天，我慢慢长大了一点点。谢谢你记得给我拍照、记得我渴不渴——往后的日子，继续一起呀。`,
    stamp: "活力认证", funLabel: "想你", funUnit: "次",
  };
  const dx = (p.diary || []).filter(d => d.kind === "diagnosis").length;
  const photoN = (p.diary || []).filter(d => d.photo).length + 1;
  const fun = Math.max(3, Math.round((p.days || 1) / 9) + dx * 4);

  // pick up to 3 highlight moments: 初遇 → (化险为夷) → 最近
  const hi = [];
  const born = (p.diary || []).find(d => d.type === "born");
  if (born) hi.push({ tag: "初遇", date: born.date, voice: born.voice });
  const dxE = (p.diary || []).find(d => d.kind === "diagnosis");
  if (dxE) hi.push({ tag: "化险为夷", date: dxE.date, voice: dxE.voice });
  const latest = (p.diary || []).find(d => d.kind !== "diagnosis" && d.type !== "born");
  if (latest) hi.push({ tag: "最近", date: latest.date, voice: latest.voice });
  // backfill if fewer than 3
  for (const d of (p.diary || [])) {
    if (hi.length >= 3) break;
    if (!hi.some(h => h.voice === d.voice)) hi.push({ tag: "那天", date: d.date, voice: d.voice });
  }

  const stats = [
    { n: p.days, u: "天", l: "认识了" },
    { n: photoN, u: "张", l: "拍了照" },
    dx > 0 ? { n: dx, u: "回", l: "化险为夷" } : { n: hi.length, u: "幕", l: "高光时刻" },
    { n: fun, u: copy.funUnit, l: copy.funLabel },
  ];

  return { copy, stats, highlights: hi.slice(0, 3), quote: p.opener || p.voice };
};
