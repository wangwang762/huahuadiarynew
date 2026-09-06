/* 花花日记本 · 扩充植物目录
 * 每个品类继续使用已经搭配好的“植物 + 花盆”成套头像，不拆换花盆。
 */
(function () {
  const palettes = [
    { accent: "#6F8E69", deep: "#46654B", bubble: "#E8F0E4", soft: "#DCE8D7", pot: "#B98B69" },
    { accent: "#789184", deep: "#506D62", bubble: "#E8EFEA", soft: "#DDE8E2", pot: "#C49A72" },
    { accent: "#8B8466", deep: "#625D43", bubble: "#F0EDDF", soft: "#E7E2D1", pot: "#AD8263" },
    { accent: "#A77973", deep: "#78544F", bubble: "#F3E7E2", soft: "#EADAD4", pot: "#C08C76" },
  ];

  // id, display name, asset folder, asset slug, aliases, shape, care, traits, pot design note
  const rows = [
    ["qinyerong", "琴叶榕", "v1", "qin-ye-rong", ["琴叶橡皮树"], "monstera", "明亮散光、通风养护，土表干下去约3厘米再浇透", ["优雅", "挺拔", "慢热", "爱光", "敏感", "安静"], "高挑沙色陶盆，托住大叶轮廓"],
    ["xiangpishu", "橡皮树", "v1", "xiang-pi-shu", ["印度榕", "橡胶树"], "pothos", "喜明亮散光，盆土干到一半再浇，冬季注意保暖", ["沉稳", "可靠", "有光泽", "慢热", "独立", "挺拔"], "暖灰圆肚陶盆，压住厚叶量感"],
    ["tiantangniao", "天堂鸟", "v1", "tian-tang-niao", ["鹤望兰", "大鹤望兰"], "monstera", "需要充足柔和光照和通风，见干见湿，避免长期积水", ["舒展", "大方", "向阳", "热情", "挺拔", "有活力"], "低饱和黄陶盆，呼应热带叶形"],
    ["sanweikui", "散尾葵", "v1", "san-wei-kui", ["黄椰子", "凤尾竹"], "spiderplant", "喜明亮散光和较高空气湿度，盆土微润但不积水", ["轻盈", "爱吹风", "温柔", "清爽", "热带", "话多"], "宽口浅陶盆，平衡羽状冠幅"],
    ["longxueshu", "龙血树", "v1", "long-xue-shu", ["香龙血树", "巴西铁"], "snakeplant", "耐旱怕涝，明亮散光下生长更紧凑，土干一半再浇", ["利落", "坚强", "独立", "少话", "耐心", "可靠"], "直筒褐陶盆，延续挺拔线条"],
    ["xiuzhenyezi", "袖珍椰子", "v1", "xiu-zhen-ye-zi", ["矮生椰子", "袖珍棕"], "spiderplant", "耐阴但喜欢明亮散光，保持空气湿润，忌盆底积水", ["小巧", "随和", "清新", "爱吹风", "慢热", "好相处"], "小巧米白盆，保留轻盈感"],
    ["zhuyu", "竹芋", "v1", "zhu-yu", ["祈祷花", "竹芋类"], "pothos", "喜温暖、散光和湿润空气，水质偏软更友好，忌暴晒", ["细腻", "爱漂亮", "敏感", "温柔", "怕晒", "有节奏"], "柔和粉陶盆，衬托叶纹"],
    ["caiyeyu", "彩叶芋", "v1", "cai-ye-yu", ["花叶芋", "五彩芋"], "pothos", "生长期保持温暖和湿润，给足散光，休眠期减少浇水", ["梦幻", "爱漂亮", "怕冷", "敏感", "热情", "轻盈"], "奶油色花盆，让彩叶成为主角"],
    ["changchunteng", "常春藤", "v1", "chang-chun-teng", ["洋常春藤"], "pothos", "喜欢凉爽通风和明亮散光，土表干后浇透，避免闷热", ["活泼", "爱攀爬", "清爽", "随和", "有韧性", "爱吹风"], "吊挂感圆盆，顺着藤蔓走势"],
    ["doubanlv", "豆瓣绿", "v1", "dou-ban-lv", ["椒草", "碧玉", "青叶碧玉"], "succulent", "耐阴怕涝，明亮散光最好，土表明显干后再浇", ["圆润", "乖巧", "安静", "好养", "治愈", "慢热"], "矮圆釉盆，呼应圆叶"],
    ["kongqifengli", "空气凤梨", "v1", "kong-qi-feng-li", ["铁兰", "空气草"], "spiderplant", "保持通风，每周浸水或喷透后倒置沥干，避免叶心积水", ["自由", "轻盈", "独立", "爱吹风", "特别", "耐心"], "极简小托座，突出无土生长"],
    ["tongqiancao", "铜钱草", "v1", "tong-qian-cao", ["香菇草", "钱币草"], "pothos", "喜水喜光，缺水容易倒伏，生长期可保持盆土湿润", ["圆满", "活泼", "爱喝水", "乐观", "好养", "热闹"], "浅口青釉盆，托起密集圆叶"],

    ["yajiaomu", "鸭脚木", "v2", "ya-jiao-mu", ["鹅掌柴", "鸭掌木"], "pothos", "耐阴好养，明亮散光更茂密，土干一半后浇透", ["随和", "可靠", "好养", "稳重", "有活力", "耐心"], "稳重砂陶盆，配合伞状叶"],
    ["xingfushu", "幸福树", "v2", "xing-fu-shu", ["菜豆树"], "pothos", "喜欢明亮散光和通风，盆土微润，冬季控制浇水", ["温暖", "乐观", "爱鼓劲", "亲人", "稳重", "茂盛"], "暖黄色高盆，表达居家幸福感"],
    ["pinganshu", "平安树", "v2", "ping-an-shu", ["兰屿肉桂", "红头屿肉桂"], "pothos", "喜温暖湿润和明亮散光，避免冷风与长期积水", ["安心", "可靠", "温和", "沉稳", "守护", "有耐心"], "沉静绿灰盆，强化守护感"],
    ["baximu", "巴西木", "v2", "ba-xi-mu", ["香龙血树", "巴西铁树"], "snakeplant", "耐阴耐旱，土干大半再浇，避免叶心长期积水", ["挺拔", "独立", "好养", "沉稳", "少话", "坚强"], "高直筒陶盆，延长树干比例"],
    ["guangdongwannianqing", "广东万年青", "v2", "guang-dong-wan-nian-qing", ["粗肋草", "亮丝草"], "pothos", "耐阴怕冷，喜温暖散光，土表干后浇透并保持通风", ["随和", "耐心", "安静", "好相处", "怕冷", "清雅"], "浅灰圆盆，衬托斑叶"],
    ["dishuiguanyin", "滴水观音", "v2", "di-shui-guan-yin", ["海芋", "滴水莲"], "monstera", "喜温暖高湿和明亮散光，盆土微润；汁液有刺激性需避开宠物儿童", ["大方", "爱喝水", "热带", "敏感", "挺拔", "有气场"], "深口陶盆，稳定大叶重心"],
    ["qiulan", "球兰", "v2", "qiu-lan", ["蜡兰", "樱兰"], "pothos", "喜明亮散光，根系喜欢略拥挤，植料大半干后再浇", ["浪漫", "慢热", "爱开花", "有香气", "耐心", "温柔"], "小巧吊盆，留出垂蔓空间"],
    ["xiezhaolan", "蟹爪兰", "v2", "xie-zhao-lan", ["圣诞仙人掌", "蟹爪莲"], "cactus", "明亮散光、见干见湿，孕蕾期避免频繁搬动和忽干忽湿", ["热闹", "爱开花", "敏感", "有节奏", "喜庆", "耐旱"], "低矮暖陶盆，承接层叠枝片"],
    ["tianzhukui", "天竺葵", "v2", "tian-zhu-kui", ["洋绣球", "石腊红"], "pothos", "喜充足日照和通风，土表干后浇透，夏季高温注意控水", ["明亮", "爱开花", "热情", "爱晒太阳", "直率", "有香气"], "红棕陶盆，呼应花色"],
    ["dujuanhua", "杜鹃花", "v2", "du-juan-hua", ["映山红", "山石榴"], "pothos", "喜酸性土和柔和光线，保持湿润但不积水，避开碱性硬水", ["细腻", "浪漫", "敏感", "爱漂亮", "慢热", "有脾气"], "雅致浅釉盆，衬托花团"],
    ["chahua", "茶花", "v2", "cha-hua", ["山茶花", "山茶"], "pothos", "喜凉爽通风、酸性土和明亮散光，花期保持水分稳定", ["端庄", "优雅", "有耐心", "爱漂亮", "慢热", "讲究"], "古朴深釉盆，配端庄花型"],
    ["sanjiaomei", "三角梅", "v2", "san-jiao-mei", ["叶子花", "九重葛"], "pothos", "需要充足日照和通风，适度控水有助开花，忌长期湿涝", ["热烈", "向阳", "坚强", "爱开花", "有活力", "直率"], "地中海暖陶盆，呼应热烈苞片"],

    ["boshidunjue", "波士顿蕨", "v3", "bo-shi-dun-jue", ["肾蕨", "波士顿肾蕨"], "spiderplant", "喜散光、高湿和通风，盆土保持微润，避免烈日与干风", ["轻盈", "爱喝水", "清爽", "敏感", "爱吹风", "温柔"], "宽口浅盆，承接蓬松羽叶"],
    ["diaozhumei", "吊竹梅", "v3", "diao-zhu-mei", ["紫叶鸭跖草", "吊竹兰"], "pothos", "明亮散光可保持叶色，土表干后浇透，勤修剪更饱满", ["活泼", "爱垂挂", "爱漂亮", "好养", "热闹", "有韧性"], "浅色吊盆，突出紫色垂蔓"],
    ["feizhoujin", "非洲堇", "v3", "fei-zhou-jin", ["非洲紫罗兰"], "pothos", "喜温暖散光，沿盆边浇水避免叶心积水，盆土微润即可", ["小巧", "温柔", "爱开花", "怕水滴", "细腻", "乖巧"], "小号粉釉盆，配合精致花朵"],
    ["guihua", "桂花", "v3", "gui-hua", ["木樨", "岩桂"], "pothos", "喜充足光照和通风，土表干后浇透，花期水分保持稳定", ["有香气", "沉稳", "清雅", "耐心", "向阳", "温暖"], "古朴砂陶盆，贴合东方香木"],
    ["heguoyu", "合果芋", "v3", "he-guo-yu", ["箭叶芋", "白蝴蝶"], "pothos", "耐阴喜湿润空气，明亮散光更紧凑，土干约三分之一再浇", ["轻快", "好养", "爱攀爬", "随和", "清新", "有活力"], "柔和米色盆，呼应箭形叶"],
    ["jingmiancao", "镜面草", "v3", "jing-mian-cao", ["翠屏草", "一串钱"], "pothos", "喜明亮散光和凉爽通风，土表干后浇透，定期转盆", ["圆润", "清爽", "有秩序", "安静", "治愈", "爱光"], "矮圆陶盆，强化圆叶节奏"],
    ["milan", "米兰", "v3", "mi-lan", ["米仔兰", "碎米兰"], "pothos", "喜充足光照、温暖和通风，生长期保持规律水肥", ["有香气", "勤快", "向阳", "细腻", "爱开花", "温暖"], "暖黄釉盆，呼应细碎花香"],
    ["ningmeng", "柠檬", "v3", "ning-meng", ["柠檬树", "盆栽柠檬"], "pothos", "需要充足日照、通风和稳定水肥，盆土勿长期过干或积水", ["清新", "明亮", "爱结果", "向阳", "有活力", "认真"], "地中海蓝灰盆，衬托黄果"],
    ["shihulan", "石斛兰", "v3", "shi-hu-lan", ["石斛", "铁皮石斛"], "orchid", "喜明亮散光和通风，植料干得较快再浇透，避免闷湿", ["清雅", "坚韧", "爱开花", "慢热", "有耐心", "讲究"], "透气兰花盆，适配附生根系"],
    ["wangwencao", "网纹草", "v3", "wang-wen-cao", ["费道花", "银网草"], "pothos", "喜温暖高湿和柔和散光，缺水易倒伏，补水也要避免积水", ["精致", "敏感", "爱喝水", "小巧", "爱漂亮", "亲人"], "迷你浅色盆，衬托细密叶纹"],
    ["zhudinghong", "朱顶红", "v3", "zhu-ding-hong", ["孤挺花", "对红"], "pothos", "生长期给足光照，盆土见干见湿；休眠期控制水分", ["挺拔", "热烈", "爱开花", "有气场", "向阳", "有节奏"], "稳重高盆，承托高花葶"],
    ["ziyecujiangcao", "紫叶酢浆草", "v3", "zi-ye-cu-jiang-cao", ["紫叶幸运草", "紫蝴蝶"], "pothos", "喜明亮散光，土表干后浇透，夜间闭叶属于正常现象", ["灵动", "梦幻", "有节奏", "爱光", "小巧", "敏感"], "浅粉圆盆，呼应紫色蝶叶"],

    ["feijimanlvrong", "飞机蔓绿绒", "v4", "fei-ji-man-lv-rong", ["飞机蔓绒", "飞机绿绒", "飞机蔓绿茸", "Philodendron Warszewiczii"], "monstera", "喜温暖、明亮散光和通风，介质疏松，土干约三分之一再浇", ["热带", "舒展", "特别", "爱光", "有气场", "慢热"], "暖灰高盆，承接羽裂大叶"],
    ["longlinchunyu", "龙鳞春羽", "v4", "long-lin-chun-yu", ["龙鳞蔓绿绒", "龙鳞春芋"], "monstera", "喜温暖散光和透气介质，保持环境湿度，避免暴晒和积水", ["热带", "有纹理", "沉稳", "敏感", "特别", "慢热"], "低调砂陶盆，让鳞纹叶柄突出"],
    ["longlinhaiyu", "龙鳞海芋", "v4", "long-lin-hai-yu", ["龙鳞观音莲", "Alocasia Dragon Scale"], "monstera", "喜温暖高湿、明亮散光和疏松介质，表层干后再浇", ["精致", "有纹理", "高冷", "敏感", "热带", "安静"], "深灰圆盆，强化金属鳞片感"],
    ["kongquezhuyu", "孔雀竹芋", "v4", "kong-que-zhu-yu", ["蓝花蕉", "孔雀肖竹芋"], "pothos", "喜温暖高湿和柔和散光，避免硬水、暴晒与冷风", ["爱漂亮", "有节奏", "细腻", "敏感", "温柔", "怕晒"], "柔粉陶盆，呼应孔雀状叶纹"],
  ];

  window.PLANT_CATALOG_EXPANSION = rows.map((row, index) => {
    const [id, species, batch, slug, aliases, shape, care, traits, potStyle] = row;
    const palette = palettes[index % palettes.length];
    return {
      id, species, aliases, batch, slug, shape, care, traits, potStyle,
      photoId: `p-lib-${id}`,
      asset: `assets/plants/expansion-preview-${batch}/${slug}.png`,
      ...palette,
    };
  });

  const existing = new Set((window.SPECIES || []).map(item => item.id));
  window.SPECIES.push(...window.PLANT_CATALOG_EXPANSION.filter(item => !existing.has(item.id)));

  const normalize = value => String(value || "").toLowerCase()
    .replace(/[\s·•・/／、,，()（）\-—_]+/g, "")
    .replace(/(?:植物|盆栽|绿植)$/g, "");

  window.matchPlantSpecies = function matchPlantSpecies(value) {
    const key = normalize(value);
    if (!key || key === "待识别") return null;
    let partial = null;
    for (const item of window.SPECIES || []) {
      const names = [item.species, ...(item.aliases || [])].map(normalize).filter(Boolean);
      if (names.includes(key)) return item;
      if (!partial && names.some(name => name.length > 1 && (key.includes(name) || name.includes(key)))) partial = item;
    }
    return partial;
  };

  window.PLANT_CATALOG_EXPANSION.forEach(item => {
    window.PLANT_IMG[item.id] = item.asset;
  });
})();
