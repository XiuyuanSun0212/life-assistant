/* ==========================================================================
   个人生活助理 · 静态内容（知识、计划、动作示范、路线）
   --------------------------------------------------------------------------
   这里放「不会因为打卡而变」的内容。
   你每天录入的训练、学习、体重、爬山记录在 store.js 里管，跟着浏览器本地存储走。
   ========================================================================== */

window.CONTENT = (function () {
  "use strict";

  /* --------------------------------------------------------- 人体示意图 */
  /* 统一的正面小人，viewBox 0 0 120 132，脚踩在 y=118，地面 y=124 */

  function arm(side) {
    var sx = side === "l" ? 47 : 73;   // 肩
    var ex = side === "l" ? 44 : 76;   // 肘
    var hx = side === "l" ? 43 : 77;   // 手
    var y1 = 43, y2 = 60, y3 = 76;
    return '<g class="arm arm-' + side + '">' +
      '<path class="fg-limb" d="M' + sx + ' ' + y1 + ' ' + ex + ' ' + y2 + '"/>' +
      '<g class="fore fore-' + side + '">' +
      '<path class="fg-limb" d="M' + ex + ' ' + y2 + ' ' + hx + ' ' + y3 + '"/>' +
      '<g class="db">' +
      '<path class="fg-bar" d="M' + (hx - 8) + " " + y3 + 'h16"/>' +
      '<rect class="fg-plate" x="' + (hx - 11.5) + '" y="' + (y3 - 5.5) + '" width="6" height="11" rx="2"/>' +
      '<rect class="fg-plate" x="' + (hx + 5.5) + '" y="' + (y3 - 5.5) + '" width="6" height="11" rx="2"/>' +
      "</g></g></g>";
  }

  var FIG = {
    ground: '<path class="fg-ground" d="M18 124h84"/>',
    legs: '<path class="fg-limb" d="M60 75 52 96 51 118"/>' +
          '<path class="fg-foot" d="M45 118h11"/>' +
          '<path class="fg-limb" d="M60 75 68 96 69 118"/>' +
          '<path class="fg-foot" d="M64 118h11"/>',
    head: '<circle class="fg-head" cx="60" cy="26" r="9"/>',
    neck: '<path class="fg-limb" d="M60 35V42"/>',
    torso: '<path class="fg-torso" d="M60 42V75"/>',
    belt: '<path class="fg-limb" d="M47 43H73"/>',
    arms: arm("l") + arm("r")
  };

  /* 深蹲两帧对照用的静态蹲姿 */
  var FIG_SQUAT =
    '<path class="fg-ground" d="M18 124h84"/>' +
    '<path class="fg-limb" d="M60 92 52 106 51 118"/>' +
    '<path class="fg-foot" d="M45 118h11"/>' +
    '<path class="fg-limb" d="M60 92 68 106 69 118"/>' +
    '<path class="fg-foot" d="M64 118h11"/>' +
    '<circle class="fg-head" cx="60" cy="42" r="9"/>' +
    '<path class="fg-limb" d="M60 51V58"/>' +
    '<path class="fg-torso" d="M60 58V92"/>' +
    '<path class="fg-limb" d="M48 60H72"/>' +
    '<path class="fg-limb" d="M48 60 44 68"/>' +
    '<g class="fore fore-l">' +
    '<path class="fg-limb" d="M44 68 50 78"/>' +
    '<g class="db"><path class="fg-bar" d="M42 78h16"/>' +
    '<rect class="fg-plate" x="38.5" y="72.5" width="6" height="11" rx="2"/>' +
    '<rect class="fg-plate" x="55.5" y="72.5" width="6" height="11" rx="2"/></g></g>';

  function svg(cls, inner) {
    return '<svg class="fig ' + cls + '" viewBox="0 0 120 132" role="img" aria-hidden="true">' +
      inner + "</svg>";
  }

  /* --------------------------------------------------------------- 健身 */

  var MOVES = [
    {
      name: "哑铃弯举",
      part: "肱二头肌",
      dose: "15 次 × 3 组",
      anim: svg("fig--curl", FIG.ground + FIG.legs + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms),
      cues: ["大臂贴住身体，不要靠甩腰发力", "慢放 2 秒，下放比上举更值钱", "手腕保持中立，别向内折"],
      wrong: "最常见错误是用身体晃动借力——把背贴墙做，就借不到力了。"
    },
    {
      name: "哑铃推举",
      part: "三角肌 / 上背",
      dose: "12 次 × 3 组",
      anim: svg("fig--press", FIG.ground + FIG.legs + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms),
      cues: ["从耳朵两侧推起，别从身体前方绕过去", "顶点不要完全锁死手肘，留一点余量", "核心收紧，别塌腰挺肚子"],
      wrong: "推的时候耸肩是常见问题，先沉肩再推。"
    },
    {
      name: "哑铃侧平举",
      part: "三角肌中束",
      dose: "15 次 × 3 组",
      anim: svg("fig--raise", FIG.ground + FIG.legs + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms),
      cues: ["抬到与肩同高就停，别高过肩", "肘略弯并保持固定，别把它当成屈伸", "想象是把手肘往两侧送，不是把哑铃拎起来"],
      wrong: "5kg 做侧平举已经不轻，宁可减次数也别甩。"
    },
    {
      name: "哑铃俯身划船",
      part: "背阔肌 / 中背",
      dose: "12 次 × 3 组",
      anim: svg("fig--row", FIG.ground + FIG.legs + '<g class="upper">' + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms + "</g>"),
      cues: ["屈髋俯身，背保持平直，别弓背", "把肘往身后拉，肩胛骨先收拢", "拉到腹部两侧即可，不用拉到胸口"],
      wrong: "腰不舒服就先把俯身角度减小，或改成单手撑椅子的姿势。"
    },
    {
      name: "哑铃罗马尼亚硬拉",
      part: "臀 / 腿后侧",
      dose: "12 次 × 3 组",
      anim: svg("fig--rdl", FIG.ground + FIG.legs + '<g class="upper">' + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms + "</g>"),
      cues: ["膝盖微屈并固定，靠髋往后坐", "哑铃贴着大腿往下滑，到小腿中上部就起", "起来时夹紧臀部，不要过度后仰"],
      wrong: "这个动作练的是髋铰链，不是弯腰——腰一旦弯了立刻减幅度。"
    },
    {
      name: "哑铃高脚杯深蹲",
      part: "腿 / 臀",
      dose: "15 次 × 3 组",
      anim: '<div class="frames">' +
        svg("fig--static", FIG.ground + FIG.legs + FIG.head + FIG.neck + FIG.torso + FIG.belt + FIG.arms) +
        svg("fig--static", FIG_SQUAT) +
        "</div>",
      cues: ["双手把哑铃抱在胸前，手肘朝下", "下蹲到大腿接近平行，膝盖对准脚尖", "全程脚掌踩实，脚跟别离地"],
      wrong: "上图是起始与最低点两帧对照（蹲姿我用静态帧表示，比画不准确的动画更直观）。"
    },
    {
      name: "慢跑 / 快走",
      part: "心肺",
      dose: "30–40 分钟",
      anim: null,
      cues: ["能连贯说话但不能唱歌的强度就对了", "前 5 分钟慢慢进入，最后 5 分钟慢下来", "一周 2–3 次，和力量训练隔天做"],
      wrong: "减脂靠的是总量和持续性，不是单次跑多狠。"
    }
  ];

  /* --------------------------------------------------------------- 学习 */

  var STUDY_CARDS = [
    { tag: "DPDK", title: "EAL 与环境抽象层", body: "rte_eal_init 建立运行环境：绑核、分配大页、扫描 PCI 设备。DPDK 应用独占轮询核，报文不经过内核协议栈。" },
    { tag: "DPDK", title: "lcore 与线程模型", body: "主 lcore 负责初始化，worker lcore 各自绑核独立跑。两种组织方式：run-to-completion（一核包干）和 pipeline（按阶段分工）。" },
    { tag: "DPDK", title: "Hugepage 大页内存", body: "2MB / 1GB 大页显著减少 TLB miss。挂载 /dev/hugepages，用 --huge-dir 指路；内存不足先查 numa 节点分布。" },
    { tag: "DPDK", title: "mempool 内存池", body: "预先分配固定大小的对象池。每个 lcore 有自己的 cache，减少跨核竞争；objs 数量要给足，不然收发会静默丢包。" },
    { tag: "DPDK", title: "mbuf 报文缓冲", body: "一个报文一个 mbuf，可多段链式。headroom / tailroom 是零拷贝加解密、封装解封装的关键空间。" },
    { tag: "DPDK", title: "ring 无锁队列", body: "MPMC 环形队列，生产消费都用 CAS 保证无锁。能批量入队出队就批量，单包操作是性能杀手。" },
    { tag: "DPDK", title: "PMD 轮询驱动", body: "全用户态轮询，没有中断上下文切换。核心 API 是 rte_eth_rx_burst / tx_burst，一次收一批（常见 32 个）。" },
    { tag: "DPDK", title: "RSS 与多队列", body: "网卡按五元组哈希把流量分到多个 RX 队列，每个 worker 独占一个队列，天然避免跨核锁。" },
    { tag: "DPDK", title: "rte_flow 流表卸载", body: "把匹配加动作的规则下到网卡硬件。ACL、转发、隧道解封装都能下沉，CPU 只处理没命中的部分。" },
    { tag: "DPDK", title: "Offload 硬件卸载", body: "校验和、TSO/LRO、VLAN 一条命令交给网卡，比 CPU 算便宜得多。注意驱动和网卡要同时支持。" },
    { tag: "DPDK", title: "NUMA 与伪共享", body: "跨 NUMA 访问内存代价成倍。结构体按 cache line（64B）对齐，热字段和数据分开，避免同一行被两个核写。" },
    { tag: "DPDK", title: "版本快照（2026-10）", body: "当前最新 26.07（2026 年 7 月发布），下一个是 26.11。LTS 固定走 11 月节奏，24.11 / 25.11；Ubuntu 26.04 LTS 已默认带 25.11。" },
    { tag: "OVS", title: "两条数据面", body: "内核 datapath（内核模块转发）和 userspace datapath（netdev 类型端口）。换 DPDK 就是把后者接上用户态网卡。" },
    { tag: "OVS", title: "OVS-DPDK 端口类型", body: "dpdk 类型 physical port 接网卡，dpdkvhostuser 接虚拟机。报文全程用户态，不进出内核。" },
    { tag: "OVS", title: "流表与 Megaflow", body: "精确匹配表命中不了就走 slow path，再把通配规则装进 datapath，后续同类流量走快路径。" },
    { tag: "OVS", title: "PMD 线程与绑核", body: "pmd-cpu-mask 决定哪几个核跑转发，n_rxq 要和队列数对齐。收发队列和核绑错，性能直接掉一半。" },
    { tag: "OVS", title: "常用排查命令", body: "ovs-appctl dpif-netdev/pmd-stats-show 看每核负载，pmd-rxq-show 看队列绑定，dpctl dump-flows 看流表。" }
  ];

  var STUDY_RHYTHM = [
    { t: "0–10 分钟", d: "读一张知识卡，只抓一句话结论，不要试图全懂" },
    { t: "10–20 分钟", d: "动手验证：翻一段源码、抓一个包、或改一个参数看结果" },
    { t: "20–30 分钟", d: "写下三行：结论 / 没懂的 / 明天看什么" }
  ];

  /* --------------------------------------------------------------- 爬山 */

  var HIKES = [
    {
      name: "八卦田 — 玉皇山 — 万松书院",
      region: "杭州 · 西湖东南",
      level: "已完成",
      tone: "ok",
      dist: "约 6 km",
      gain: "约 250 m",
      time: "2.5–3.5 小时",
      season: "全年",
      profile: [0, 0.1, 0.16, 0.42, 0.72, 1, 0.9, 0.62, 0.5, 0.34, 0.14, 0.06],
      nodes: ["八卦田", "江洋畈", "玉皇山脚", "玉皇山", "将台山", "万松书院"],
      note: "你已完成的路线。整体先缓后陡再缓降，适合作为体能基准线。"
    },
    {
      name: "老和山 — 北高峰",
      region: "杭州 · 西湖西侧",
      level: "入门",
      tone: "",
      dist: "约 8 km",
      gain: "约 400 m",
      time: "3–4 小时",
      season: "春 / 秋",
      profile: [0, 0.14, 0.38, 0.55, 0.5, 0.68, 0.86, 1, 0.72, 0.4, 0.2, 0.1],
      nodes: ["老和山", "财神庙", "美人峰", "北高峰", "灵隐"],
      note: "杭州最经典的入门拉练线，连续爬升比较练心肺。"
    },
    {
      name: "十里琅珰",
      region: "杭州 · 龙井一带",
      level: "入门",
      tone: "",
      dist: "约 9 km",
      gain: "约 320 m",
      time: "3–4 小时",
      season: "春 / 秋",
      profile: [0, 0.2, 0.34, 0.3, 0.52, 0.7, 0.66, 0.85, 0.6, 0.36, 0.18, 0.08],
      nodes: ["云栖竹径", "五云山", "十里琅珰", "梅家坞", "龙井村"],
      note: "起伏多但坡不陡，风景好、补给点多，适合第一次独自徒步。"
    },
    {
      name: "九溪十八涧 — 龙井",
      region: "杭州 · 西湖西南",
      level: "轻松",
      tone: "",
      dist: "约 8 km",
      gain: "约 250 m",
      time: "3 小时",
      season: "全年",
      profile: [0, 0.08, 0.22, 0.3, 0.44, 0.6, 0.72, 0.8, 0.62, 0.4, 0.22, 0.1],
      nodes: ["九溪", "溪中溪", "九溪十八涧", "杨梅岭", "龙井村"],
      note: "沿溪走、路面平缓，夏天最舒服，适合带人一起。"
    },
    {
      name: "徽杭古道",
      region: "浙皖交界 · 临安方向",
      level: "进阶",
      tone: "warn",
      dist: "约 16–20 km",
      gain: "约 600 m",
      time: "1–2 天",
      season: "春 / 秋",
      profile: [0, 0.18, 0.4, 0.62, 0.82, 1, 0.78, 0.56, 0.34, 0.2, 0.12, 0.05],
      nodes: ["浙川", "江南第一关", "蓝天凹", "遥遥岭脚", "鱼川"],
      note: "经典长线，需要提前规划接驳和住宿，建议先从本地路线练起。"
    },
    {
      name: "莫干山",
      region: "浙江 · 湖州",
      level: "进阶",
      tone: "warn",
      dist: "约 10 km",
      gain: "约 500 m",
      time: "半天",
      season: "春 / 秋",
      profile: [0, 0.12, 0.3, 0.48, 0.66, 0.84, 0.95, 0.7, 0.45, 0.26, 0.14, 0.06],
      nodes: ["荫山街", "剑池", "旭光台", "塔山", "武陵村"],
      note: "和爬山结合度最高的周末目的地，交通方便。"
    }
  ];

  var GEAR = [
    "越野跑鞋或抓地好的运动鞋（杭州这种路线不需要重型登山靴）",
    "速干上衣 + 一件薄外套（山顶风大）",
    "饮水 1–1.5 L（3 小时以内）",
    "能量补给：香蕉、能量棒、坚果",
    "充电宝（手机全程导航耗电快）",
    "雨衣或一次性雨披",
    "护膝（下台阶多时用，比如玉皇山下万松书院那一段）",
    "创可贴、常用药",
    "纸巾 + 垃圾袋（垃圾自己带走）",
    "离线地图 / 提前下载轨迹"
  ];

  /* --------------------------------------------------------------- 旅游 */

  var TRAVEL = {
    short: {
      name: "横店",
      region: "浙江 · 金华",
      when: "短期目标",
      note: "离杭州约 2 小时车程，2 天足够。以影视城为主，走的是逛＋拍照的节奏。",
      plan: [
        "Day 1：秦王宫 / 清明上河图，晚上看一场演出",
        "Day 2：明清宫苑 / 广州街香港街，下午返程",
        "预订要点：门票套票比单买划算，但别贪多，一天两个园区是上限",
        "住哪：横店镇内更方便，早上不用赶路"
      ],
      checklist: ["确认演出场次和闭园时间", "提前买套票", "订横店镇内住宿", "查杭州往返的班次或自驾路线", "准备防晒"]
    },
    long: {
      name: "日本",
      region: "长期目标",
      when: "长期目标",
      note: "先把签证和假期这两件硬事定下来，再谈去哪里。第一次去建议只玩一到两个城市。",
      plan: [
        "第一步：办护照 / 签证，看有效期够不够",
        "第二步：定假期窗口，避开日本黄金周和国内长假",
        "第三步：选城市方向——关西（京都大阪，文化＋美食，最稳妥）",
        "第四步：订机票住宿，行程按「一天一个重点」排"
      ],
      checklist: ["护照有效期检查", "签证材料准备", "确定假期时间窗", "选城市方向", "预算与机票比价", "办一张能用的支付方式"]
    }
  };

  /* --------------------------------------------------------------- 娱乐 */

  var FUN = [
    { name: "《莲花楼》", type: "电视剧", status: "在看", tone: "accent", note: "已记录在追，不打扰。" },
    { name: "《鬼武者》", type: "游戏", status: "在玩", tone: "accent", note: "已记录在玩，不打扰。" }
  ];

  return {
    profile: {
      name: "孙sir",
      height: 170,
      weightJin: 145.7,
      weightKg: 72.85,
      bmi: 25.2,
      city: "杭州",
      job: "阿里平头哥 · 网络 DPDK 开发"
    },
    fitness: {
      goal: "减脂",
      goalDetail: "第一阶段目标 135 斤（BMI 约 23.4），之后视情况继续。按每月 2–3 斤的速度推，不设死线。",
      gear: "哑铃 5kg × 2 对",
      constraint: "无旧伤，可以跑步",
      strategy: "5kg 哑铃不适合追重量，走「高次数 + 短间歇」的循环训练最有效。力量 3 次 + 跑步 2 次，一周 5 天动起来，2 天休息。",
      intake: "粗算：每天 1700–1900 大卡，蛋白质 110–130g（大约每餐一掌心肉蛋 + 一份豆制品）。别节食到 1500 以下，会掉肌肉。",
      weekly: [
        { day: "周一", focus: "哑铃循环 A", detail: "弯举 / 推举 / 深蹲 各 15 次，走 3 轮", load: "中" },
        { day: "周二", focus: "慢跑", detail: "30 分钟，能说话的强度", load: "中" },
        { day: "周三", focus: "哑铃循环 B", detail: "划船 / 侧平举 / 硬拉 各 15 次，走 3 轮", load: "中" },
        { day: "周四", focus: "休息 / 拉伸", detail: "走路 6000 步 + 拉伸 10 分钟", load: "轻" },
        { day: "周五", focus: "哑铃循环 A 或 B", detail: "挑一个，或两组混着做", load: "中" },
        { day: "周六", focus: "慢跑或快走", detail: "40 分钟，可以换户外长走", load: "中" },
        { day: "周日", focus: "休息 / 爬山", detail: "爬山就替代这天的所有训练", load: "轻" }
      ],
      circuitRule: "一组和一组之间歇 30–60 秒，三个动作连着做完算一轮，三轮之间歇 90 秒。全程大概 25 分钟。",
      moves: MOVES,
      weighTips: "称重固定在同一条件下：早上起床上完厕所、空腹、同一件衣服。每周记 3 次取平均，别被单日波动影响情绪。"
    },
    study: {
      goal: "DPDK / OVS 方向，每天 20–30 分钟",
      note: "碎片时间够用，关键是每天碰一下。看源码比看文章更值，能跑起来的实验记得最牢。",
      cards: STUDY_CARDS,
      rhythm: STUDY_RHYTHM
    },
    hikes: {
      goal: "杭州本地路线打底，再向周边长线扩展",
      note: "距离、爬升、耗时都是大致参考值，出发前我再帮你核实当天的路况、开放情况和交通。",
      routes: HIKES,
      gear: GEAR,
      safety: ["出发前告诉家人路线和预计返回时间", "山里天黑比城区早，留足下山时间", "雨季和台风天不要去溪谷路线", "一个人走就选人多、信号好的成熟路线"]
    },
    travel: TRAVEL,
    fun: FUN
  };
})();
