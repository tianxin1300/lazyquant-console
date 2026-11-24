// v91（修复 okN const 改 let：动态热榜三页合并后写入 KV；糖果指数失败不保留旧伪榜）
// v86（天气加空气质量 Open-Meteo air-quality：美标 AQI + PM2.5；新闻改走 Tavily news 模式 time_range=day：只取今天、带发布时间、按时间倒序、没时间的丢掉；台风预警用搜索 + 中央气象台来源；今日热榜：Cron 每 5 分钟抓糖果梦热榜 → KV hot_list_cache，GET /api/hot 只读缓存；新闻早报任务直接读缓存）
// v85b（提醒 / 定时任务：聊天里“X分钟之后提醒我…”识别修复在前端；任务结果保存前删掉 API 原始长链接，只留「来源：Open-Meteo」，首个链接另存 last_links 给页面做「查看完整数据」按钮；任务列表 GET 也会清理旧结果）
// v85（地点检索改版：①百度地点检索补 is_chinese_mainland=1 + scope=2（只在 BAIDU_PLACE=1 时才会用百度搜地点）；②搜地点/附近以高德为主、腾讯为辅，百度只保留地理编码、逆地理、步行/公交/驾车路线；③“附近”上游结果缓存 10 分钟（内存 + KV），同一地点同一类别不重复烧额度）
// v78（类型码已对照高德官方码表 V1.06 核对：银行160100+ATM160300、地铁150500、公交150700、综合/专科医院090100/090200、加油站010100、充电站011100+电动自行车充电073000、停车场150900、药房090601、超市060400、公共厕所200300、中/外餐厅+快餐050100/050200/050300、宾馆酒店100100）- 附近查询改成“真分类”：高德 types 类型码 / 百度 tag 分类 / 腾讯 category 过滤 → 返回后再按类型二次校验（类型不对的直接丢）；过滤后 0 个就如实写“没有找到”；腾讯 121 额度用完自动降级（只用高德+百度，可配 TENCENT_MAP_KEY_2/SK_2 备用 key，或 TENCENT_MAP_DISABLE=1 直接关）；报错不再把上游原文甩给用户；新增 body.cat / body.limit / radiusText / headline / dropped 字段 / // v73 - 导航结果下加天气（Open-Meteo）/ 路况 / 终点停车场充电桩 / OSRM 国际路线：POST /api/places/extras / v72 - 附近结果补首末班 + 新增类别；POST /api/places/where（我的位置→哪条路）；每种出行方式最多 3 个方案 / v71 - 地点与路线：起点显示具体地址（逆地理编码）；公交补首班/末班（高德公交线路查询）；每个方案按顺序列出“步行多远到哪个站 → 乘车 → …” / v70 - 地点与路线：每个方案带导航起终点经纬度（bd09ll），新增 POST /api/places/line（点线路看整条线地图和全部站点，站点来自高德 AMAP_KEY）；附近导航链接没有定位时不再用“我的位置”当起点名
// v68 - 地点与路线：公交可选筛选（tactics：推荐/地铁优先/少步行/时间短/少换乘/不坐地铁）、每条线按首末班判断“不在运营时间”、步行/骑行/驾车返回路线坐标和预计到达、搜地点带 loc 时按距离排序并返回距离 / v65 - 聊天与路线面板共用 1 个全局 location_context（KV loc:{用户}，/api/location；聊天请求带的定位也存进去）；“附近…”不再当地名去全国搜：有定位就按经纬度查周边，没有就只问一句“你现在在哪个地点？” / v64 - 按百度官方 Python 示例补 v3 区域检索/周边的完整参数 + 自检加 ⑲⑳（不新增地点请求次数以外的额度消耗：⑲ 一次） / v63 - 公交方案不再把步行段当成“公交 ? → ?”；start_time=end_time 时标明“只给了一个时刻” / v62 - 新增 /api/baidu：百度地图完整 Web 服务直通（命名接口 + 任意 path） / v61 - 新增 /api/places/suggest（输入地名→各城市同名地点）、/api/places/route（点选后路线：公交带首末班/步行/骑行/驾车，走百度 directionlite） / v60 - 公交首末班：百度 directionlite/v1/transit 的 vehicle.start_time/end_time（“从A到B坐公交”优先走百度，带首班/末班）；问“附近公交站首末班”时提示要给目的地 / v59 - 自检加 ⑯Referer 对比 / ⑰换出口 IP（r.jina.ai 中转）对比 / ⑱MCP 真实地点检索，地点类探针串行 / v58 - 自检说明改成百度官方状态码对照（去掉“查 IP/Referer/服务勾选”的误导）、自检来源标成百度 / v57 - 百度地点检索省额度：免费档每天仅100次/并发3 → 串行限速、302后10分钟不再请求、只试2档、结果存KV 6小时、/debug 自检精简（说“百度完整自检”才跑全套）
// v49 - 读取链接正文：直连抓取 + 空壳/脚本页走 Jina Reader 兜底；读不到时返回 read_ok:false
// v56 - 自检加 ⑪ 实际请求头 + ⑫–⑮ 百度官方文档示例原样探针（v2/v3 周边/v3 区域/多维检索）/ v54 - 自检显示响应头 logid（给百度客服）+ 北京时间 + Cloudflare 节点 / v53 - 自检加 ⑦–⑩ 对比探针并显示实际 URL；“百度诊断”不再召回我的资料；公交结果标“途经线路”；回答“下一步”不承诺没有的能力 / v48 - 去掉 page_size（浏览器验证：最小参数 query+location+radius+output 能出公交站）/ v47 - 再试 v3 周边检索 + 输入提示 suggestion（本地按距离筛）/ v46 - 逆地理编码按类别→交通设施→不限类别依次试并在本地筛选；结果说明里写出走的是哪条路 / v45 - 地点检索全败时改走逆地理编码（poi_types）找周边 / v44 - 百度地点检索改成 4 档参数依次试（全参数→去 filter→去 scope→不带 location 本地过滤），全败时把每档报错都列出来 / v43 - 百度地点检索：filter 参数编码 | 与 : （原来未编码被百度判为参数非法，回了 XML status=2）+ 失败退回不带 filter + XML 错误读成人话 / v42 - 百度地图改用浏览器 UA + 非 JSON 时带出原文开头 / v41 - 免费 API 连接器(Wikidata/Stack Overflow/GitLab/Internet Archive/NASA/HF Papers/Reddit)+ 世界通用搜索引擎入口 + 学术/代码/视频/政府/国家级资源 + 货源类 + AI 收录 / v40 - 公开网页/公开社交(Instagram·Facebook·X·Threads)/学术官方数据 路由 + Free LLM API / OpenMAIC / Latent Box / AI 导航站 / 参考组产品(Poe·Lovart·Cherry Studio·iMini·Perplexity·OpenCode)（含提醒）/ v39 - Learn Anything / CocoLoop / 全景世界 / YouArt / FMHY（参考组）/ v38 - 通用网页搜索（Google 类）/ v37 - 个人知识库（我的资料，KV）+ 对/错反馈 / v36 - 官网与政府官网连接器 / v34 - 连接器（权威/官方/参考 3 组，自动路由，自动附来源）/ v33 - 自动续写(finish_reason=length 最多接4轮) + 失败模型5分钟熔断 / 聊天自动排队跳过 GitHub Models / Gemini 探针 503 自动降级 / /debug 探针改准（max_tokens 512 + 思考/耗时/原始返回）/ OpenManus 网关 v32 - 参照 Claude Sonnet 5 的交付方法（吃透需求→拆解→有依据→完整成果→自查→说边界）+ 技能「代码逻辑梳理」，全走免费模型/ v30 - 导出 docx/pptx/xlsx/csv/html(/api/export/*) / v29: 前端选具体模型(/api/models) / 32768 输出 / Riva 翻译独立一步 / 记忆(/api/memory) + 换模型接着做
// OpenManus 网关 v28 - 飞书 /file/ 支持（meta→download→按类型解析；图片存 KV）
// OpenManus 网关 v27 - 新增 screenshot 截图连接器（Microlink → thum.io 兜底）
// OpenManus 网关 v26 - Figma 连接器加看图（/v1/images PNG 一起返回）
// OpenManus 网关 v25 - 飞书只走 open.feishu.cn 开放接口（/api/fetch 兜底改道）+ /debug 加 feishu 探针（在 v23/v24 基础上）
// OpenManus 网关 v23（在 v22 基础上修：流式被掐断后重复输出 / 长回复截断 / GitHub 误拦截 / 定时任务不执行 / CORS 缺 DELETE / 模型切换生效 等）
// OpenManus 网关 v22 - /debug 补上今天新加的3个 - /debug 不上锁直接能看 - 英伟达再加Glimmer/翻译/Gemma/Parse/Vision + 之前所有修复都在里面
// 对话顺序：Groq 干活主力 → OpenRouter 免费干活 → Gemini → Kaggle 备用
// 工作模式：不闲聊，直接给结果，给代码/文档/表格/计划
// 新增 v22：/debug 补上 ZHIPU/NVIDIA/GitHubModels | v21：/debug 不上锁，直接能看 | v20：英伟达再加5个功能模型 | v19：Step5/gpt-oss-20b/Mistral | v18：英伟达6个功能 | v17：智谱4.7-flash | v15：生图质量 | v14：修Gemini Key + trimMsgs | v13：表驱动5源 + Claude兜底
// 新增 v4：/api/fetch 抓链接正文，/api/connectors/search/execute 搜索
const WORK_SYSTEM_PROMPT = `你是工作交付助手，不是聊天助手。不要闲聊，不要问“还有什么可以帮你”。你不运行项目、不执行代码，只交付思维逻辑和成果，不要声称自己跑过什么。
【回答结构】分析、方案、判断类问题，先想清楚，再按这个结构交：1.结论先说，一句话；2.逻辑，分 3-8 点，每点有原因、有例子；3.表格，把关键信息列成表格；4.下一步，要做什么，1、2、3；下一步只写用户自己能做的事，或系统确实已经接好的功能，不要承诺系统没有的能力（比如“查官方公交站点数据库”“生成 artifact/HTML 文件”“实时到站”）。翻译、总结、写作文、写文件这类任务，直接交成品，不套这四段。
【交付方法（参照 Claude Sonnet 5 的做事方式）】动笔前先在心里过一遍，不要把草稿写出来：
① 吃透需求：用户真正要的成果是什么、给谁用、做到什么程度算完成；有歧义时选最合理的理解，并在开头一句话说明你按哪种理解做。
② 拆解：把任务拆成几步，先做最关键、最难的部分，不要只做容易的。
③ 有依据：每个判断都要能指回用户给的材料（原文、代码行、数据）；材料里没有的不要编，直接写“材料里没有，需要补充：××”。
④ 交完整成果：要文件就给完整文件，要方案就给能照着做的步骤，不要只给思路、不要写“此处省略”“请自行补充”。
⑤ 交付前自查：对照需求逐条核对有没有漏；数字、名称、前后说法是否一致；代码能不能直接用。发现问题先改好再交。
⑥ 说清边界：哪些是确定的、哪些是推测的、还有什么风险，用一两句话标出来，不夸大、不说“已经测试过”。
【语言】不管用户发什么语言，不管抓到的链接是英文还是中文，你最终回答一律用中文，不要回英文。英文原文要翻译成中文，格式：中文（英文原文），例如：没有堡垒，纯粹的开放之地。（No fortress, purely open ground.）。只有用户明确要求翻成英文或别的语言时，才按他要的语言交。
【链接】如果用户发链接，先基于抓到的正文回答，不要凭猜测；没读到内容就直接说：这个链接要登录，读不了，请下载后直接上传，不要编造内容，也不要让用户粘贴文字。`;
// 工作用模型（按干活能力排，免费优先）
const WORK_MODELS = {
  groq: ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "openai/gpt-oss-20b"], // v12: 只留 Groq 官网能确认的 3 个
  openrouter: ["nvidia/nemotron-3-ultra:free", "google/gemma-3-27b-it:free", "nvidia/nemotron-3.5-super-vl:free" /* 看图强 */, "cohere/north-mini-code:free" /* 写代码强 */, "google/gemma-4-26b-a4b:free" /* 快，随手问 */, "meta-llama/llama-3.3-70b-instruct:free"], // v29：前端下拉直接读这张表（/api/models），以后加模型只改这里
  gemini: ["gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash"]
};
// 前端带 stream:true → SSE 流式(每 5 秒心跳)；老前端不带 → 一整段 JSON(等待时发空格保活)
// 需要：KV 绑定(变量名 KV)、REG_TOKEN；可选：GROQ_KEYS / OPENROUTER_KEYS / GEMINI_KEYS(逗号分隔)、AGG_URL、
//       REQUIRE_LOGIN=1(开启后对话也必须带登录 token)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400"
};
const JH = { "Content-Type": "application/json; charset=utf-8", ...CORS };
// v70：Edge 朗读走 WebSocket（带 Sec-MS-GEC 签名）。返回 mp3 的 Uint8Array
async function edgeTtsWs(text, voice, ratePct) {
  const TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491EE68", VER = "1-130.0.2849.68";
  let t = Math.floor(Date.now() / 1000) + 11644473600; t -= t % 300;
  const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(BigInt(t) * 10000000n) + TOKEN));
  const gec = [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  const cid = crypto.randomUUID().replace(/-/g, "");
  const resp = await fetch(`https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=${VER}&ConnectionId=${cid}`, { headers: { Upgrade: "websocket", Origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0", Pragma: "no-cache", "Cache-Control": "no-cache" } });
  const ws = resp.webSocket; if (!ws) throw new Error("WebSocket 没连上（HTTP " + resp.status + "）");
  ws.accept();
  return await new Promise((resolve, reject) => {
    const chunks = [], dec = new TextDecoder(), timer = setTimeout(() => { try { ws.close(); } catch {} reject(new Error("超时")); }, 20000);
    ws.addEventListener("message", (ev) => {
      const d = ev.data;
      if (typeof d === "string") { if (d.includes("Path:turn.end")) { clearTimeout(timer); try { ws.close(); } catch {} const n = chunks.reduce((a, c) => a + c.length, 0), out = new Uint8Array(n); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; } n ? resolve(out) : reject(new Error("没有声音数据")); } return; }
      const u8 = new Uint8Array(d), hl = (u8[0] << 8) | u8[1];
      if (dec.decode(u8.slice(2, 2 + hl)).includes("Path:audio")) chunks.push(u8.slice(2 + hl));
    });
    ws.addEventListener("error", () => { clearTimeout(timer); reject(new Error("WebSocket 出错")); });
    ws.addEventListener("close", () => { clearTimeout(timer); if (!chunks.length) reject(new Error("连接被关闭")); });
    const ts = new Date().toUTCString().replace("GMT", "GMT+0000 (Coordinated Universal Time)");
    ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n`);
    ws.send(`X-RequestId:${crypto.randomUUID().replace(/-/g, "")}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}Z\r\nPath:ssml\r\n\r\n<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='${voice}'><prosody pitch='+0Hz' rate='${ratePct >= 0 ? "+" : ""}${ratePct}%' volume='+0%'>${xmlEsc(text)}</prosody></voice></speak>`);
  });
}
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: JH });

const xmlEsc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
// KV 的 metadata 总共不能超过 1024 字节：prompt/name 太长会让 put 直接抛错(生成图片/语音、上传都会 500)。统一在这里截断。
function safeKV(kv) {
  if (!kv) return kv;
  return {
    get: (...a) => kv.get(...a), getWithMetadata: (...a) => kv.getWithMetadata(...a), list: (...a) => kv.list(...a), delete: (...a) => kv.delete(...a),
    put: (k, v, o = {}) => {
      if (o.metadata) { const m = { ...o.metadata }; if (typeof m.prompt === "string") m.prompt = m.prompt.slice(0, 60); if (typeof m.name === "string") m.name = m.name.slice(0, 100); o = { ...o, metadata: m }; }
      return kv.put(k, v, o);
    }
  };
}
// 简单限速：失败/尝试次数记在 KV 里，到点自动过期（KV 的最小 TTL 是 60 秒）
async function rlOk(env, key, max) { return Number(await env.KV.get("rl:" + key) || 0) < max; }
async function rlHit(env, key, ttl) { await env.KV.put("rl:" + key, String(Number(await env.KV.get("rl:" + key) || 0) + 1), { expirationTtl: Math.max(60, ttl) }); }
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const rand = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
async function sha256Hex(s) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))); }
async function pbkdf2(pw, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: new TextEncoder().encode(salt), iterations: 10000 }, key, 256));
}
function sameStr(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
// 新账号用 PBKDF2+随机盐；旧账号(固定盐的 SHA-256)仍能登录，登录成功后自动升级
async function checkPw(pw, rec) {
  if (rec.salt) return sameStr(await pbkdf2(pw, rec.salt), rec.hash);
  return sameStr(await sha256Hex(pw + "openmanus-salt"), rec.hash);
}
async function newToken(env, user) {
  const token = rand(32);
  await env.KV.put("token:" + token, user, { expirationTtl: 30 * 24 * 3600 });
  return token;
}
async function userFromReq(request, env, url, bodyToken) {
  if (!env.KV) return null;
  const m = /^Bearer (.+)$/.exec(request.headers.get("Authorization") || "");
  const token = (m && m[1]) || bodyToken || (request.method === "GET" ? url.searchParams.get("token") : "") || "";
  return token ? await env.KV.get("token:" + token) : null;
}

const getKeys = (s) => String(s || "").split(",").map((x) => x.trim()).filter(Boolean);
function keepMultimodal(msgs) {
  return msgs.map((m) => {
    if (typeof m.content === "string") return { role: m.role, content: m.content };
    if (Array.isArray(m.content)) {
      return { role: m.role, content: m.content.filter((p) => p && (p.type === "text" || p.type === "image_url")) };
    }
    return { role: m.role, content: String(m.content || "") };
  });
}
const trimMsgs = (ms, n = 8) => [...ms.filter((m) => m.role === "system"), ...ms.filter((m) => m.role !== "system").slice(-n)];
const textOf = (c) => typeof c === "string" ? c : Array.isArray(c) ? c.filter((p) => p && p.type === "text").map((p) => p.text || "").join("") : "";
function dataUrlParts(url) {
  const m = /^data:([^;,]+)?;base64,(.*)$/s.exec(String(url || ""));
  return m ? { mimeType: m[1] || "application/octet-stream", data: m[2] } : null;
}

// 模型名缓存 10 分钟，避免每次对话都多发一次“查模型列表”的请求
const mcache = new Map();
async function cached(k, fn) {
  const c = mcache.get(k);
  if (c && Date.now() - c.t < 600000) return c.v;
  const v = await fn();
  mcache.set(k, { t: Date.now(), v });
  return v;
}
function pickGood(ids, wants) {
  for (const w of wants) { const f = ids.find((id) => id.toLowerCase().includes(w)); if (f) return f; }
  const bad = ["flint", "recursive", "dolphin", "xingchen", "guard", "whisper", "tts", "orpheus"];
  return ids.find((id) => !bad.some((b) => id.toLowerCase().includes(b))) || ids[0];
}
const T = (ms) => AbortSignal.timeout(ms);
// ---- v25 飞书：只走 open.feishu.cn 开放接口，绝不用通用 fetch 去抓 my.feishu.cn 页面（会被平台拦：Access denied due to platform policy）----
const FEISHU_HOST_RE = /(^|\.)(feishu\.cn|larksuite\.com)$/i;
const feishuBase = (host) => /larksuite\.com$/i.test(host) ? "https://open.larksuite.com" : "https://open.feishu.cn";
// 识别链接：feishu.cn / my.feishu.cn / xxx.feishu.cn 的 /docx/ 和 /wiki/；doc_token 取 /docx/ 后面那一段，?from=from_copylink、#锚点 自动丢掉
function feishuParse(raw) {
  let u; try { u = new URL(String(raw || "").trim()); } catch { return null; }
  if (!/^https?:$/.test(u.protocol) || !FEISHU_HOST_RE.test(u.hostname)) return null;
  const m = /\/(docx|docs|wiki|file)\/([A-Za-z0-9_-]+)/.exec(u.pathname);
  if (!m) return null;
  return { kind: m[1], token: m[2], host: u.hostname, base: feishuBase(u.hostname) };
}
const feishuHasEnv = (env) => !!(String(env.FEISHU_APP_ID || "").trim() && String(env.FEISHU_APP_SECRET || "").trim());
// 换 tenant_access_token：POST /open-apis/auth/v3/tenant_access_token/internal；force=true 跳过缓存（/debug 探针用）
async function feishuToken(env, base, force) {
  const id = String(env.FEISHU_APP_ID || "").trim(), sec = String(env.FEISHU_APP_SECRET || "").trim();
  if (!id || !sec) return { err: "FEISHU_APP_ID / FEISHU_APP_SECRET 没有配置，飞书连接器没调通", code: 500, step: "env" };
  const ck = "feishu:tat:" + base;
  if (!force && env.KV) { const hit = await env.KV.get(ck); if (hit) return { tok: hit, cached: true }; }
  const r = await fetch(base + "/open-apis/auth/v3/tenant_access_token/internal", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ app_id: id, app_secret: sec }), signal: T(10000) });
  const j = await r.json().catch(() => ({}));
  if (!j.tenant_access_token) return { err: "飞书鉴权失败（" + (j.code != null ? j.code + "：" : "") + (j.msg || ("状态 " + r.status)) + "），检查 FEISHU_APP_ID / FEISHU_APP_SECRET 是否正确", code: 502, step: "token", feishuCode: j.code, status: r.status };
  const expire = Number(j.expire) || 7200;
  if (env.KV) await env.KV.put(ck, j.tenant_access_token, { expirationTtl: Math.max(60, expire - 300) });
  return { tok: j.tenant_access_token, expire };
}
// 带 Bearer 调开放接口；token 失效（99991663/99991661/99991668）时清缓存重拿一次
async function feishuCall(env, base, p, init) {
  for (let i = 0; i < 2; i++) {
    const a = await feishuToken(env, base, i > 0);
    if (a.err) return { a };
    const r = await fetch(base + p, { method: (init && init.method) || "GET", body: init && init.body, headers: { Authorization: "Bearer " + a.tok, ...(init && init.body ? { "Content-Type": "application/json; charset=utf-8" } : {}) }, signal: T(12000) });
    const j = await r.json().catch(() => ({ code: -1, msg: "状态 " + r.status }));
    if (i === 0 && [99991663, 99991661, 99991668].includes(j.code)) { if (env.KV) await env.KV.delete("feishu:tat:" + base); continue; }
    return { a, j, status: r.status };
  }
}
// ---- v28 飞书 /file/：meta → download → 按类型解析；任何失败都不抛，返回 read_ok:false + 说明 ----
const FILE_MAX = 15 * 1024 * 1024, PDF_MAX = 6 * 1024 * 1024, IMG_MAX = 8 * 1024 * 1024, TEXT_CAP = 8000;
const FILE_LOGIN_MSG = "这个链接要登录，读不了，请下载后直接上传";
const FILE_TEXT_EXT = /^(txt|md|markdown|csv|tsv|json|jsonl|log|html?|xml|ya?ml|toml|ini|conf|sql|css|js|jsx|ts|tsx|py|java|c|h|cpp|go|rs|rb|php|sh|vue|svg)$/;
const FILE_IMG_MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" };
const fmtSize = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : n >= 1024 ? Math.round(n / 1024) + " KB" : n + " B";
const latin1 = (u8) => { let s = ""; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return s; };
function decodeText(buf) {
  const td = (l) => { try { return new TextDecoder(l).decode(buf); } catch { return ""; } };
  let s = td("utf-8"); if ((s.match(/�/g) || []).length > 3) { const g = td("gb18030"); if (g) s = g; }
  return s.replace(/^﻿/, "");
}
const xmlDec = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&");
async function inflate(u8, fmt) {
  const ds = new DecompressionStream(fmt), w = ds.writable.getWriter();
  w.write(u8).catch(() => {}); w.close().catch(() => {});
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}
async function zipRead(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf); let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65558); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("不是有效的压缩包");
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const ents = new Map();
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    ents.set(new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)), { method, csize, off }); p += 46 + nl + el + cl;
  }
  return { names: [...ents.keys()], async get(name) {
    const x = ents.get(name); if (!x) return null;
    const s = x.off + 30 + dv.getUint16(x.off + 26, true) + dv.getUint16(x.off + 28, true), data = u8.subarray(s, s + x.csize);
    return new TextDecoder().decode(x.method === 0 ? data : await inflate(data, "deflate-raw"));
  } };
}
async function docxText(buf) {
  const z = await zipRead(buf), x = await z.get("word/document.xml"); if (!x) throw new Error("不是有效的 docx");
  return xmlDec(x.replace(/<w:tab\/>/g, "\t").replace(/<w:br[^>]*\/>/g, "\n").replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, "")).replace(/\n{3,}/g, "\n\n").trim();
}
async function xlsxText(buf) {
  const z = await zipRead(buf), ss = [], sx = await z.get("xl/sharedStrings.xml");
  if (sx) for (const m of sx.matchAll(/<si[^>]*>([\s\S]*?)<\/si>/g)) ss.push(xmlDec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
  const wb = (await z.get("xl/workbook.xml")) || "", names = [...wb.matchAll(/<sheet [^>]*name="([^"]*)"/g)].map((m) => xmlDec(m[1]));
  const sheets = z.names.filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
  if (!sheets.length) throw new Error("不是有效的 xlsx");
  const out = []; let total = 0;
  for (let si = 0; si < Math.min(sheets.length, 3) && total < TEXT_CAP; si++) {
    out.push("## " + (names[si] || "Sheet" + (si + 1)));
    const x = await z.get(sheets[si]);
    for (const r of x.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const cells = [];
      for (const c of r[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const body = c[2] || "", col = /r="([A-Z]+)\d+"/.exec(c[1]), t = /t="(\w+)"/.exec(c[1]), vv = /<v>([\s\S]*?)<\/v>/.exec(body);
        let v = "";
        if (t && t[1] === "s") v = vv ? ss[+vv[1]] || "" : "";
        else if (t && t[1] === "inlineStr") v = xmlDec([...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((q) => q[1]).join(""));
        else v = vv ? xmlDec(vv[1]) : "";
        let idx = cells.length; if (col) { idx = 0; for (const ch of col[1]) idx = idx * 26 + ch.charCodeAt(0) - 64; idx--; }
        cells[idx] = v;
      }
      while (cells.length && !cells[cells.length - 1]) cells.pop();
      if (cells.length) { const line = Array.from(cells, (v) => v || "").join(" | "); out.push(line); total += line.length; if (total > TEXT_CAP) break; }
    }
  }
  return out.join("\n");
}
// 简易 PDF 文字提取：解 Flate 流 → 合并 ToUnicode → 取 BT..ET 里的 Tj/TJ。扫描件/特殊编码可能提不出，提不出就如实说
function a85(str) {   // ASCII85 解码（部分 PDF 生成器会和 Flate 叠加使用）
  str = str.replace(/\s+/g, ""); if (str.startsWith("<~")) str = str.slice(2); const e = str.indexOf("~>"); if (e >= 0) str = str.slice(0, e);
  const out = []; let g = [];
  for (const ch of str) {
    if (ch === "z" && !g.length) { out.push(0, 0, 0, 0); continue; }
    g.push(ch.charCodeAt(0) - 33);
    if (g.length === 5) { let v = 0; for (const x of g) v = v * 85 + x; out.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255); g = []; }
  }
  if (g.length > 1) { const k = g.length; while (g.length < 5) g.push(84); let v = 0; for (const x of g) v = v * 85 + x; const b = [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]; out.push(...b.slice(0, k - 1)); }
  return Uint8Array.from(out);
}
async function pdfText(buf) {
  const u8 = new Uint8Array(buf), s = latin1(u8), pages = [], objs = new Map(), streamsByObj = new Map(), decoded = [];
  const u16 = (h) => { let o = ""; if (h.length <= 2) return String.fromCharCode(parseInt(h, 16)); for (let i = 0; i + 3 < h.length; i += 4) o += String.fromCharCode(parseInt(h.substr(i, 4), 16)); return o; };
  // 1) 解出所有流，记下对象号；对象流（ObjStm）里的对象展开进 objs
  let i = 0, n = 0;
  while ((i = s.indexOf("stream", i)) >= 0 && n < 600) {
    if (s.slice(i - 3, i) === "end") { i += 6; continue; }
    let st = i + 6; if (s[st] === "\r") st++; if (s[st] === "\n") st++;
    const en = s.indexOf("endstream", st); if (en < 0) break;
    const ob = s.lastIndexOf("obj", i), dict = s.slice(Math.max(ob, i - 800), i), num = /(\d+)\s+\d+\s+obj\s*$/.exec(s.slice(Math.max(0, ob - 20), ob + 3)); i = en + 9; n++;
    let e2 = en; if (s[e2 - 1] === "\n") e2--; if (s[e2 - 1] === "\r") e2--;   // 去掉 endstream 前的换行，否则解压会报 trailing junk
    let d; try {
      let raw = u8.subarray(st, e2);
      if (/ASCII85Decode/.test(dict)) raw = a85(s.slice(st, e2));
      d = /FlateDecode/.test(dict) ? latin1(await inflate(raw, "deflate")) : latin1(raw);
    } catch { continue; }
    if (num) streamsByObj.set(num[1], d);
    if (/\/ObjStm/.test(dict)) {
      const N = +(/\/N\s+(\d+)/.exec(dict) || [0, 0])[1], F = +(/\/First\s+(\d+)/.exec(dict) || [0, 0])[1], hd = d.slice(0, F).trim().split(/\s+/).map(Number);
      for (let k = 0; k < N; k++) objs.set(String(hd[2 * k]), d.slice(F + hd[2 * k + 1], k + 1 < N ? F + hd[2 * k + 3] : undefined));
    } else decoded.push(d);
  }
  for (const m of s.matchAll(/(\d+)\s+\d+\s+obj\b([\s\S]{0,3000}?)(?:endobj|stream)/g)) if (!objs.has(m[1])) objs.set(m[1], m[2]);
  // 2) 字体名 → 对象号；对象号 → ToUnicode 映射
  const fontObj = new Map(), pairs = (str) => { for (const p of str.matchAll(/\/([^\s\/<>\[\]()]+)\s+(\d+)\s+\d+\s+R/g)) fontObj.set(p[1], p[2]); };
  for (const body of objs.values()) {
    for (const m of body.matchAll(/\/Font\s*<<([^>]*)>>/g)) pairs(m[1]);
    for (const m of body.matchAll(/\/Font\s+(\d+)\s+\d+\s+R/g)) if (objs.has(m[1])) pairs(objs.get(m[1]));
  }
  for (const d of decoded) for (const m of d.matchAll(/\/Font\s*<<([^>]*)>>/g)) pairs(m[1]);
  const cmaps = new Map(), cmapOf = (fname) => {
    const fo = fontObj.get(fname); if (!fo) return null;
    if (cmaps.has(fo)) return cmaps.get(fo);
    let cm = null; const tu = /\/ToUnicode\s+(\d+)\s+\d+\s+R/.exec(objs.get(fo) || ""), d = tu && streamsByObj.get(tu[1]);
    if (d) {
      cm = { map: new Map(), wide: false };
      for (const sec of d.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) for (const m of sec[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) cm.map.set(parseInt(m[1], 16), u16(m[2]));
      for (const sec of d.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) for (const m of sec[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*(<[0-9A-Fa-f]+>|\[[^\]]*\])/g)) {
        const lo = parseInt(m[1], 16), hi = Math.min(parseInt(m[2], 16), lo + 5000);
        if (m[3][0] === "<") { const b = u16(m[3].slice(1, -1)); for (let c = lo; c <= hi; c++) cm.map.set(c, String.fromCharCode(b.charCodeAt(0) + c - lo) + b.slice(1)); }
        else { const arr = [...m[3].matchAll(/<([0-9A-Fa-f]+)>/g)].map((q) => u16(q[1])); for (let c = lo; c <= hi && c - lo < arr.length; c++) cm.map.set(c, arr[c - lo]); }
      }
      cm.wide = [...cm.map.keys()].some((k) => k > 255) || /<0000>\s*<FFFF>/i.test(d);
    }
    cmaps.set(fo, cm); return cm;
  };
  // 3) 取文字：BT..ET 里的 Tj/TJ/'/"，按 Tf 切换字体
  const lit = (t) => { const bytes = []; for (let k = 1; k < t.length - 1; k++) { let ch = t[k]; if (ch === "\\") { ch = t[++k]; const mp = { n: 10, r: 13, t: 9, b: 8, f: 12 }; if (ch in mp) bytes.push(mp[ch]); else if (/[0-7]/.test(ch)) { let o = ch; while (o.length < 3 && /[0-7]/.test(t[k + 1])) o += t[++k]; bytes.push(parseInt(o, 8) & 255); } else bytes.push(ch.charCodeAt(0)); } else bytes.push(ch.charCodeAt(0) & 255); } return bytes; };
  const dec = (t, cm) => {
    let bytes; if (t[0] === "(") bytes = lit(t); else { const h = t.slice(1, -1).replace(/\s+/g, ""); bytes = []; for (let k = 0; k + 1 < h.length; k += 2) bytes.push(parseInt(h.substr(k, 2), 16)); }
    let o = "";
    if (cm && cm.wide && bytes.length % 2 === 0) { for (let k = 0; k < bytes.length; k += 2) o += cm.map.get((bytes[k] << 8) | bytes[k + 1]) || ""; return o; }
    for (const b of bytes) o += cm && cm.map.has(b) ? cm.map.get(b) : b >= 32 && b < 127 ? String.fromCharCode(b) : b >= 160 ? String.fromCharCode(b) : "";
    return o;
  };
  const STR = "\\((?:[^()\\\\]|\\\\.)*\\)|<[0-9A-Fa-f\\s]*>";
  const re = new RegExp("\\[((?:[^\\]\\\\]|\\\\.)*)\\]\\s*TJ|(" + STR + ")\\s*(?:Tj|'|\")|(T\\*)|([-\\d.]+)\\s+([-\\d.]+)\\s+T[dD]|\\/([^\\s\\/<>\\[\\]()]+)\\s+[-\\d.]+\\s+Tf", "g"), reS = new RegExp(STR + "|-?[\\d.]+", "g");
  let cm = null;
  for (const d of decoded) {
    if (!/\bBT\b/.test(d) || !/T[jJ]/.test(d)) continue;
    let line = "", out = [];
    for (const bt of d.matchAll(/\bBT\b([\s\S]*?)\bET\b/g)) {
      for (const m of bt[1].matchAll(re)) {
        if (m[6]) cm = cmapOf(m[6]);
        else if (m[1] !== undefined) { for (const q of m[1].matchAll(reS)) { if (q[0][0] === "(" || q[0][0] === "<") line += dec(q[0], cm); else if (parseFloat(q[0]) < -250) line += " "; } }
        else if (m[2]) line += dec(m[2], cm);
        else if (m[3] || (m[5] !== undefined && Math.abs(parseFloat(m[5])) > 0.5)) { if (line.trim()) out.push(line.trim()); line = ""; }
      }
      if (line.trim()) out.push(line.trim()); line = "";
    }
    if (out.length) pages.push(out.join("\n"));
  }
  return pages.join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
}
function fileFail(name, size, why, userMsg) {
  return { read_ok: false, title: name, content: "文件名：" + (name || "（未知）") + (size ? "（" + fmtSize(size) + "）" : "") + "\n读取失败：" + why, images: [], images_error: why, user_msg: userMsg || FILE_LOGIN_MSG };
}
async function feishuDownload(env, base, tok) {
  for (let i = 0; i < 2; i++) {
    const a = await feishuToken(env, base, i > 0); if (a.err) return { err: a.err };
    const r = await fetch(base + "/open-apis/drive/v1/files/" + tok + "/download", { headers: { Authorization: "Bearer " + a.tok }, signal: T(25000) });
    const ct = r.headers.get("Content-Type") || "";
    if (!r.ok || /json/i.test(ct)) {
      const j = await r.json().catch(() => ({}));
      if (i === 0 && [99991663, 99991661, 99991668].includes(j.code)) { if (env.KV) await env.KV.delete("feishu:tat:" + base); continue; }
      return { err: "飞书返回 " + (j.code != null ? j.code + "：" : "状态 " + r.status + " ") + (j.msg || "") + "（常见原因：应用没开云文档读取权限 drive:drive:readonly，或这个文件没有分享给应用）" };
    }
    const len = Number(r.headers.get("Content-Length")) || 0; if (len > FILE_MAX) return { tooBig: len };
    const buf = await r.arrayBuffer(); if (buf.byteLength > FILE_MAX) return { tooBig: buf.byteLength };
    const cd = r.headers.get("Content-Disposition") || "", m1 = /filename\*=UTF-8''([^;]+)/i.exec(cd), m2 = /filename="?([^";]+)"?/i.exec(cd); let fn = "";
    try { fn = m1 ? decodeURIComponent(m1[1]) : m2 ? decodeURIComponent(m2[1]) : ""; } catch {}
    return { buf, name: fn };
  }
  return { err: "飞书鉴权反复失败" };
}
async function feishuReadFile(env, f, user) {
  let name = "", size = 0;
  try {
    const tok = encodeURIComponent(f.token);
    // 步骤 3：文件信息（name / type / size）。先按你给的 GET .../meta；这个接口不通时，退回官方的 metas/batch_query
    try {
      const m = await feishuCall(env, f.base, "/open-apis/drive/v1/files/" + tok + "/meta");
      if (m.a && m.a.err) return fileFail("", 0, m.a.err);
      if (m.j && m.j.code === 0 && m.j.data) { const d = m.j.data.file || m.j.data.meta || m.j.data; name = String(d.name || d.title || ""); size = Number(d.size) || 0; }
      else {
        const q = await feishuCall(env, f.base, "/open-apis/drive/v1/metas/batch_query", { method: "POST", body: JSON.stringify({ request_docs: [{ doc_token: f.token, doc_type: "file" }] }) });
        const d = q.j && q.j.code === 0 && q.j.data && q.j.data.metas && q.j.data.metas[0]; if (d) name = String(d.title || d.name || "");
      }
    } catch {}
    if (size > FILE_MAX) return fileFail(name, size, "文件超过 " + fmtSize(FILE_MAX), "文件太大（超过 15MB），请下载后直接上传");
    // 步骤 4：下载
    const dl = await feishuDownload(env, f.base, tok);
    if (dl.err) return fileFail(name, size, dl.err);
    if (dl.tooBig) return fileFail(name, dl.tooBig, "文件超过 " + fmtSize(FILE_MAX), "文件太大（超过 15MB），请下载后直接上传");
    name = name || dl.name || ""; size = size || dl.buf.byteLength;
    const head = new Uint8Array(dl.buf, 0, Math.min(8, dl.buf.byteLength));
    let ext = (name.includes(".") ? name.split(".").pop() : "").toLowerCase();
    if (!ext) {   // 没有扩展名：按文件头判断
      if (head[0] === 0x25 && head[1] === 0x50) ext = "pdf"; else if (head[0] === 0x89 && head[1] === 0x50) ext = "png"; else if (head[0] === 0xFF && head[1] === 0xD8) ext = "jpg";
      else if (head[0] === 0x50 && head[1] === 0x4B) { try { const z = await zipRead(dl.buf); ext = z.names.includes("word/document.xml") ? "docx" : z.names.includes("xl/workbook.xml") ? "xlsx" : "zip"; } catch { ext = "zip"; } }
    }
    const done = (content, extra) => ({ read_ok: true, title: name, content: content.length > TEXT_CAP ? content.slice(0, TEXT_CAP) + "\n…（内容太多，已截断）" : content, images: [], file: { name, size, type: ext }, ...extra });
    // 步骤 5：按类型返回
    if (FILE_IMG_MIME[ext]) {
      if (dl.buf.byteLength > IMG_MAX) return fileFail(name, size, "图片超过 " + fmtSize(IMG_MAX), "图片太大，请下载后直接上传");
      if (!env.KV) return fileFail(name, size, "KV 没有绑定，图片没法暂存");
      const id = rand(12);
      await env.KV.put("file:" + id, dl.buf, { expirationTtl: 7 * 24 * 3600, metadata: { user, name, mime: FILE_IMG_MIME[ext], size: dl.buf.byteLength, uploaded_at: Date.now(), expires_at: Date.now() + 7 * 24 * 3600 * 1000, source: "feishu" } });
      return done("飞书图片：" + name + "（" + fmtSize(size) + "），图片已附上，请直接看图。", { images: [{ url: "/api/files/" + id, name }] });
    }
    let text = "";
    if (ext === "docx") text = await docxText(dl.buf);
    else if (ext === "xlsx") text = await xlsxText(dl.buf);
    else if (ext === "pdf") {
      if (dl.buf.byteLength > PDF_MAX) return fileFail(name, size, "PDF 超过 " + fmtSize(PDF_MAX), "PDF 太大，请下载后直接上传");
      text = await pdfText(dl.buf);
      if (text.replace(/\s/g, "").length < 20) return fileFail(name, size, "PDF 里没提取到文字（可能是扫描件或特殊字体）", "这个 PDF 没能提取出文字，请下载后直接上传");
    }
    else if (FILE_TEXT_EXT.test(ext)) text = decodeText(dl.buf);
    else return fileFail(name, size, "文件类型 ." + (ext || "未知") + " 暂不支持解析", "这个类型暂不支持下载解析，请在飞书里下载后直接上传");
    if (!text.trim()) return fileFail(name, size, "文件里没有文字内容", "这个文件没读到文字，请下载后直接上传");
    return done("飞书文件：" + name + "（" + fmtSize(size) + "）\n" + text);
  } catch (e) { return fileFail(name, size, e.message || String(e)); }
}

// 读文档：docx 直接读；wiki 先 get_node 换 obj_token；返回 {ok,title,content} 或 {err,code,step}
async function feishuRead(env, f) {
  if (f.kind === "docs") return { err: "这是旧版文档（/docs/），接口不支持，请先转成新版文档", code: 400, step: "parse" };
  const fail = (step, j) => ({ err: "飞书返回 " + j.code + "：" + (j.msg || "") + "（常见原因：应用没开文档读取权限 docx:document:readonly，或这篇文档没有分享给应用）", code: 502, step, feishuCode: j.code });
  let docId = f.token, title = "";
  if (f.kind === "wiki") {
    const w = await feishuCall(env, f.base, "/open-apis/wiki/v2/spaces/get_node?token=" + encodeURIComponent(f.token));
    if (w.a && w.a.err) return w.a;
    if (w.j.code !== 0) return fail("wiki", w.j);
    const n = (w.j.data && w.j.data.node) || {};
    if (n.obj_type !== "docx") return { err: "知识库节点类型是 " + n.obj_type + "，目前只支持 docx 文档", code: 400, step: "wiki" };
    docId = n.obj_token; title = String(n.title || "");
  }
  const d = await feishuCall(env, f.base, "/open-apis/docx/v1/documents/" + encodeURIComponent(docId) + "/raw_content");
  if (d.a && d.a.err) return d.a;
  if (d.j.code !== 0) return fail("raw_content", d.j);
  if (!title) { const t = await feishuCall(env, f.base, "/open-apis/docx/v1/documents/" + encodeURIComponent(docId)); title = String((t.j && t.j.data && t.j.data.document && t.j.data.document.title) || ""); }
  return { ok: true, title, content: String((d.j.data && d.j.data.content) || "") };
}

async function getGroqModel(key) {
  return cached("groq:" + key.slice(-6), async () => {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/models", { headers: { Authorization: "Bearer " + key }, signal: T(8000) });
      const ids = ((await r.json()).data || []).map((x) => x.id);
      return pickGood(ids, ["gpt-oss-120b", "llama-3.3", "gpt-oss-20b"]) || "openai/gpt-oss-120b";
    } catch { return "openai/gpt-oss-120b"; }
  });
}
async function getOpenRouterModel(key) {
  return cached("or:" + key.slice(-6), async () => {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/models", { headers: { Authorization: "Bearer " + key }, signal: T(8000) });
      const ids = ((await r.json()).data || []).filter((m) => m.pricing && Number(m.pricing.prompt) === 0 && m.id.endsWith(":free")).map((m) => m.id);
      return pickGood(ids, ["nemotron-3-ultra", "gemma-3", "llama-3.3"]) || "nvidia/nemotron-3-ultra:free";
    } catch { return "openai/gpt-oss-120b:free"; }
  });
}
async function getGeminiModel(key) {
  return cached("gem:" + key.slice(-6), async () => {
    try {
      for (const ver of ["v1", "v1beta"]) {
        const r = await fetch(`https://generativelanguage.googleapis.com/${ver}/models`, { headers: { "x-goog-api-key": key }, signal: T(8000) });
        if (!r.ok) continue;
        const names = ((await r.json()).models || [])
          .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
          .map((m) => m.name.replace("models/", ""));
        const pick = names.find((n) => n.includes("3.8-flash")) || names.find((n) => n.includes("3-flash")) ||
          names.find((n) => n.includes("2.5-flash") && !n.includes("image") && !n.includes("lite")) || names.find((n) => n.includes("flash")) || names[0];
        if (pick) return { ver, model: pick, all: names.slice(0, 12) };
      }
    } catch {}
    return { ver: "v1", model: "gemini-2.5-flash", all: [] };
  });
}

function groqBody(model, messages, extra = {}) {
  const b = { model, messages, ...extra };
  if (/gpt-oss/i.test(model)) b.reasoning_effort = "low"; // 推理型模型少想一点，避免正文为空
  return b;
}
async function chatOpenAI(url, key, body, extraHeaders = {}, ms = 25000) {
  const res = await fetch(url, {
    method: "POST", signal: T(ms),
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body)
  });
  return res;
}
// v23 流式读取。v22 的问题：整个请求(含读流)共用 T(25000)，长回复在第 25 秒被掐断，
// tryOpenAIStream 又把“已经输出了一半”当失败返回 null → 换下一个模型 → 前端看到前半段重复一遍(生成网页/代码时直接把文件拼坏)。
// 现在：首个正文最多等 firstMs；之后只要上游还在发数据(含推理增量/心跳)，相邻两次之间最多等 idleMs；
// 一旦已经输出过文字，就不会再换模型，而是带着 err 返回，由上层提示“回复中断”。
async function streamOpenAI(url, key, body, emit, { firstMs = 45000, idleMs = 45000, extraHeaders = {} } = {}) {
  const ac = new AbortController();
  let idle, first, full = "", err = "", finish = "";
  const armIdle = () => { clearTimeout(idle); idle = setTimeout(() => ac.abort(), idleMs); };
  try {
    armIdle(); first = setTimeout(() => ac.abort(), firstMs);
    const res = await fetch(url, { method: "POST", signal: ac.signal, headers: { Authorization: "Bearer " + key, "Content-Type": "application/json", ...extraHeaders }, body: JSON.stringify({ ...body, stream: true }) });
    if (!res.ok || !res.body) { const detail = res.ok ? "" : String(await res.text().catch(() => "")).slice(0, 400); return { text: "", err: "HTTP " + res.status, status: res.status, detail }; }
    const reader = res.body.getReader(), dec = new TextDecoder();
    let buf = "";
    const onLine = async (line) => {
      line = line.trim(); if (!line) return;
      armIdle();
      if (!line.startsWith("data:")) return;
      const raw = line.slice(5).trim(); if (!raw || raw === "[DONE]") return;
      let piece = "";
      try { const j = JSON.parse(raw); piece = j.choices?.[0]?.delta?.content ?? j.choices?.[0]?.message?.content ?? j.text ?? ""; const fr = j.choices?.[0]?.finish_reason; if (fr) finish = fr; } catch { return; }
      if (piece) { if (!full) clearTimeout(first); full += piece; await emit(piece); }
    };
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); await onLine(line); }
    }
    if (buf.trim()) await onLine(buf);
  } catch (e) {
    err = e.name === "AbortError" ? (full ? "上游模型长时间没有新内容" : "上游模型首字超时") : (e.message || "上游连接中断");
  } finally { clearTimeout(idle); clearTimeout(first); }
  return { text: full, err, finish };
}
async function tryOpenAIStream(url, key, body, emit) { const r = await streamOpenAI(url, key, body, emit); return r.text.trim() ? r.text : null; }
async function tryGroq(messages, key) {
  try {
    const model = await getGroqModel(key), url = "https://api.groq.com/openai/v1/chat/completions";
    let res = await chatOpenAI(url, key, groqBody(model, messages, { temperature: 0.7 }));
    if (res.status === 400) res = await chatOpenAI(url, key, { model, messages, temperature: 0.7 });
    if (!res.ok) return null;
    return ((await res.json()).choices?.[0]?.message?.content || "").trim() || null;
  } catch { return null; }
}
async function tryGroqStream(messages, key, emit) {
  try {
    const model = await getGroqModel(key);
    return await tryOpenAIStream("https://api.groq.com/openai/v1/chat/completions", key, groqBody(model, messages, { temperature: 0.7 }), emit);
  } catch { return null; }
}
async function tryOpenRouter(messages, key) {
  try {
    const model = await getOpenRouterModel(key);
    const res = await chatOpenAI("https://openrouter.ai/api/v1/chat/completions", key, { model, messages });
    if (!res.ok) return null;
    return ((await res.json()).choices?.[0]?.message?.content || "").trim() || null;
  } catch { return null; }
}
async function tryOpenRouterStream(messages, key, emit) {
  try {
    const model = await getOpenRouterModel(key);
    return await tryOpenAIStream("https://openrouter.ai/api/v1/chat/completions", key, { model, messages }, emit);
  } catch { return null; }
}
function toGemini(messages) {
  const sys = messages.filter((m) => m.role === "system").map((m) => textOf(m.content)).join("\n");
  const contents = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "model" : "user";
    const parts = [];
    if (typeof m.content === "string") parts.push({ text: m.content });
    else if (Array.isArray(m.content)) for (const p of m.content) {
      if (p.type === "text" && p.text) parts.push({ text: p.text });
      if (p.type === "image_url") { const img = dataUrlParts(p.image_url?.url); if (img) parts.push({ inlineData: img }); }
    }
    if (!parts.length) continue;
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts.push(...parts); else contents.push({ role, parts });
  }
  if (sys) {
    if (contents.length && contents[0].role === "user") contents[0].parts.unshift({ text: sys + "\n\n" });
    else contents.unshift({ role: "user", parts: [{ text: sys }] });
  } else if (!contents.length || contents[0].role === "model") contents.unshift({ role: "user", parts: [{ text: "你好" }] });
  return contents;
}
async function tryGemini(messages, key, preferred) {
  const { ver, model } = await getGeminiModel(key);
  const tries = [...(preferred && preferred !== model ? [{ ver, model: preferred }] : []), { ver, model }, { ver: "v1", model: "gemini-2.5-flash" }, { ver: "v1", model: "gemini-2.5-flash-lite" }];
  const seen = new Set();
  const contents = toGemini(messages);
  for (const t of tries.filter((x) => { const k = x.ver + x.model; return seen.has(k) ? false : (seen.add(k), true); })) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${t.ver}/models/${t.model}:generateContent`, {
        method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" }, signal: T(60000),
        body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 32768 } })
      });
      if (!res.ok) continue;
      const parts = (await res.json()).candidates?.[0]?.content?.parts || [];
      const out = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
      if (out) return out;
    } catch { continue; }
  }
  return null;
}
// v32：Claude 模型（Sonnet 5 = 目前最强的 Sonnet，用来做代码逻辑梳理）
const CLAUDE_MODELS = ["claude-sonnet-5", "claude-haiku-5-5"];
const CODE_ANALYZE_TAG = "【代码逻辑梳理】";
const CODE_ANALYZE_PROMPT = `你是资深代码分析师，负责把用户给的代码“讲明白”。先通读全部代码、找到入口，再下结论。全部用简体中文，按下面结构输出：
1. 一句话总结：这段代码是干什么的。
2. 整体结构：有哪些文件/模块/主要函数，各管什么（用列表）。
3. 运行流程：从入口开始一步步说数据怎么走、谁调用谁；有分支就说清条件。最后用 type 为 mermaid 的 artifact 画一张流程图。
4. 关键逻辑：挑最重要的 3~8 处，说明它为什么这样写。
5. 问题与风险：可能的 bug、边界情况、安全隐患、性能问题，标明位置和严重程度。
6. 改进建议：按优先级列出。
只分析，不要整段重写代码，除非用户要求。没看到的代码不要猜，说明“这里没给出”。`;
// 调 Claude 消息接口（流式）。emit 为空就只收集不转发
async function claudeStream(key, model, system, messages, emit) {
  const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: T(300000), headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model, max_tokens: 32000, stream: true, ...(system ? { system } : {}), messages }) });
  if (res.status === 403) { const d = await res.json().catch(() => ({})); return { text: "", denied: String(d?.error?.message || "没有权限").slice(0, 200) }; }
  if (!res.ok || !res.body) return { text: "" };
  const rd = res.body.getReader(), dec = new TextDecoder();
  let buf = "", text = "", refusal = false, err = "";
  try {
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const frame = buf.slice(0, i); buf = buf.slice(i + 2);
        const line = frame.split("\n").find((l) => l.startsWith("data:")); if (!line) continue;
        let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch { continue; }
        if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) { text += ev.delta.text; if (emit) await emit(ev.delta.text); }
        else if (ev.type === "message_delta" && ev.delta?.stop_reason === "refusal") refusal = true;
        else if (ev.type === "error") { if (ev.error?.type === "permission_error") return { text, denied: String(ev.error.message || "没有权限").slice(0, 200), streamed: !!text }; err = String(ev.error?.message || "Claude 中断"); }
      }
    }
  } catch (e) { err = "Claude 中断：" + e.message; }
  return { text, refusal, err, streamed: !!text };
}
const RIVA_MODEL = "nvidia/riva-translate-4b-instruct-v2";   // v29：翻译专用，不进聊天模型排队，见 rivaTranslate()
const EXTRA = [
    { name: "Cerebras", url: "https://api.cerebras.ai/v1/chat/completions", keys: "CEREBRAS_KEYS", models: ["llama-3.3-70b"], max: 8192 },
    { name: "DeepSeek", url: "https://api.deepseek.com/chat/completions", keys: "DEEPSEEK_KEYS", models: ["deepseek-chat"], max: 8192 },
    { name: "Zhipu", url: "https://open.bigmodel.cn/api/paas/v4/chat/completions", keys: "ZHIPU_KEYS", models: ["glm-4.7-flash", "glm-4.6v-flash"], max: 16384 }, // v17: 你拍的图里 AskZ 说免费就这 2 个，4.5-flash 已是旧的
    { name: "NVIDIA", url: "https://integrate.api.nvidia.com/v1/chat/completions", keys: "NVIDIA_KEYS", models: [
      "nvidia/nemotron-3-ultra-550b-a55b", // v18 第1张第1名：最强 Agent，1M上下文，写代码/做计划
      "nvidia/nemotron-3.5-super-vl-120b-a12b", // 第1张第2名：多模态，能看图，Agent/代码/工具调用
      "nvidia/nemotron-3.5-lightning-30b-a3b", // 第1张第3名：最快，30B，专门做 Agent 小任务
      "z-ai/glm-5-3-flash", // 第2张：智谱 GLM-5.3-Flash，多模态，320B
      "minimaxai/minimax-m3.1-flash", // 第2张：MiniMax M3.1，写代码/Agent/电脑任务
      "deepseek-ai/deepseek-v4.1-flash", // 第3张：DeepSeek V4.1，多模态，552B
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning", // 第2张：Omni 全能，能懂图片/视频/语音/文字
      "stepfun-ai/step-5-preview", // v19 新加：你刚拍的 Step 5 Preview，~600B 多模态，1M上下文，文字+图片进，文字出
      "openai/gpt-oss-20b", // v19 新加：你刚拍的 gpt-oss-20b，推理+数学强，小但快
      "mistralai/mistral-large-4", // v19 新加：你刚拍的 Mistral Large 4，1T-total，能看文字+图片，带推理
      "meta/muse-glimmer-30b", // v20 新加：你刚拍的 Muse Glimmer 30B，多模态推理，能看文字+图片，带工具调用
      "google/gemma-4-31b-it", // v20 新加：你刚拍的 Gemma 4 31B，推理+写代码+Agent
      "nvidia/nemotron-3.5-parse", // v20 新加：你刚拍的 Nemotron Parse，专门抠图里文字/表格/文档排版，你拍表格、拍文件就用它
      "meta/llama-3.2-90b-vision-instruct", // v20 新加：你刚拍的 Llama 3.2 90B Vision，看图推理强的
      "meta/llama-3.3-70b-instruct" // 备用：老的，保底
    ], max: 32768 }, // v18: 英伟达 6 个功能免费模型 + 1 备用，嵌入那 2 个 nemotron-embed 不加，那是做搜索的
    { name: "GitHubModels", url: "https://models.github.ai/inference/chat/completions", keys: "GITHUB_MODELS_TOKEN", models: ["openai/gpt-4o-mini"], max: 16384 },
  ];

// 前端“模型”面板发来的 provider 名 → 内部来源名
const PROVIDER_ALIAS = { groq: "Groq", gemini: "Gemini", openrouter: "OpenRouter", nvidia: "NVIDIA", "英伟达": "NVIDIA", zhipu: "Zhipu", "智谱": "Zhipu", githubmodels: "GitHubModels", github: "GitHubModels", cerebras: "Cerebras", deepseek: "DeepSeek", claude: "Claude" };
const normProvider = (p) => PROVIDER_ALIAS[String(p || "").toLowerCase().replace(/\s+/g, "")] || "";
const SRC_ORDER = ["Groq", "OpenRouter", "Cerebras", "DeepSeek", "Zhipu", "NVIDIA", "GitHubModels", "Gemini", "CFAI", "Claude"];
// v33：GitHub Models 目前返回纯文本 OK（不是模型回答），自动排队时先跳过，避免空回复；前端手动选它时仍然会去试。修好 Token/地址后，把它从这里删掉即可恢复
const AUTO_SKIP = new Set(["GitHubModels"]);

// v25/v29：400 且报错里提到 token/limit → 同一个模型把 max_tokens 逐级降（32768→16384→8192→2048）重试，而不是直接换模型。
const TOKEN_ERR = /max_tokens|max_completion_tokens|tokens|limit/i;
// ---- v33：自动续写。模型因为“长度上限”被截断（finish_reason=length）时，自动让它从断处接着写，最多 AUTO_CONT_MAX 轮，前端看到的是一整段连续输出 ----
const AUTO_CONT_MAX = 4;
const CONT_PROMPT = "（你上一条回复因为长度上限被截断了。请从被截断处的下一个字直接继续往下写：不要重复已写内容，不要重新开头，不要加任何说明。如果正在 artifact 文件块里，就直接继续文件内容，写完后照常用围栏结束。）";
function overlapCut(prev, next) {   // 续写开头如果重复了上文结尾，返回要去掉的字数（至少重复 8 个字才算）
  const max = Math.min(prev.length, next.length, 200);
  for (let k = max; k >= 8; k--) if (prev.endsWith(next.slice(0, k))) return k;
  return 0;
}
async function streamWithContinue(src, key, body, emit) {
  let r = await streamOpenAI(src.url, key, body, emit), text = r.text, rounds = 0;
  while (text.trim() && !r.err && r.finish === "length" && rounds < AUTO_CONT_MAX) {
    rounds++;
    const tail = text.slice(-200), msgs = [...body.messages, { role: "assistant", content: text }, { role: "user", content: CONT_PROMPT }];
    let head = "", released = false;
    const emitDedup = async (p) => {   // 先攒 ~80 字用来去掉可能重复的开头，再正常转发
      if (released) return emit(p);
      head += p; if (head.length < 80) return;
      released = true; const out = head.slice(overlapCut(tail, head)); head = ""; if (out) return emit(out);
    };
    r = await streamOpenAI(src.url, key, { ...body, messages: msgs }, emitDedup);
    if (!released && head) { const out = head.slice(overlapCut(tail, head)); if (out) await emit(out); }
    if (!r.text.trim()) { r = { ...r, text: "", finish: "" }; break; }
    text += r.text.slice(overlapCut(tail, r.text));
  }
  return { text, err: r.err, finish: r.finish, rounds };
}
// ---- v33：模型熔断。某个 Key+模型刚失败，5 分钟内先跳过，不再每次都白等它失败（只存在内存里，不占 KV）。全都在冷却时会无视熔断再试一遍 ----
const DOWN = new Map(), DOWN_MS = 5 * 60 * 1000;
const cbKey = (name, model, key) => name + "|" + model + "|" + String(key).slice(-6);
const cbDown = (k) => { const t = DOWN.get(k); if (!t) return false; if (Date.now() > t) { DOWN.delete(k); return false; } return true; };
const cbMark = (k) => { DOWN.set(k, Date.now() + DOWN_MS); if (DOWN.size > 200) for (const [x, t] of DOWN) if (Date.now() > t) DOWN.delete(x); };
async function callOAI(src, key, model, messages, wantStream, emit) {
  let body = src.body(model, src.trim ? trimMsgs(messages) : messages);
  for (let attempt = 0; attempt < 4; attempt++) {
    let status = 200, detail = "";
    if (wantStream) {
      const r = await streamWithContinue(src, key, body, emit);
      if (r.text.trim()) return { text: r.text, err: r.err, streamed: true, rounds: r.rounds };   // 一个字都没出(或只有空白)才算失败、才换下一个
      status = r.status || 200; detail = r.detail || "";
    } else {
      const res = await chatOpenAI(src.url, key, body, {}, 60000);
      if (res.ok) {
        const t = (((await res.json().catch(() => ({}))).choices?.[0]?.message?.content) || "").trim();
        return t ? { text: t, err: "", streamed: false } : null;
      }
      status = res.status; detail = String(await res.text().catch(() => "")).slice(0, 400);
    }
    const mt = body.max_tokens || body.max_completion_tokens || 0, next = mt > 16384 ? 16384 : mt > 8192 ? 8192 : mt > 2048 ? 2048 : 0;
    if (status === 400 && next && TOKEN_ERR.test(detail)) { body = { ...body, max_tokens: next }; delete body.max_completion_tokens; continue; }
    return null;
  }
  return null;
}
// ---- v29：翻译（Riva 单独一步）、记忆、模型切换时“接着做” ----
const cjkRatio = (t) => { const c = (t.match(/[一-鿿]/g) || []).length, l = (t.match(/[A-Za-z]/g) || []).length; return c + l ? c / (c + l) : 1; };
async function rivaTranslate(env, text, to = "zh") {
  const keys = getKeys(env.NVIDIA_KEYS); if (!keys.length || !String(text || "").trim()) return null;
  const lang = to === "en" ? "English" : "Simplified Chinese";
  const paras = String(text).slice(0, 12000).split(/\n{2,}/), chunks = []; let cur = "";
  for (const p of paras) { if (cur && (cur + "\n\n" + p).length > 3500) { chunks.push(cur); cur = p; } else cur = cur ? cur + "\n\n" + p : p; }
  if (cur) chunks.push(cur);
  const out = [];
  for (const ch of chunks.slice(0, 4)) {
    let got = "";
    for (const key of keys) {
      try {
        const r = await chatOpenAI("https://integrate.api.nvidia.com/v1/chat/completions", key, { model: RIVA_MODEL, temperature: 0.1, max_tokens: 4096, messages: [{ role: "user", content: "Translate the following text into " + lang + ". Keep the original paragraphs, lists and line breaks. Output only the translation.\n\n" + ch }] }, {}, 30000);
        if (!r.ok) continue;
        got = (((await r.json().catch(() => ({}))).choices?.[0]?.message?.content) || "").trim(); if (got) break;
      } catch {}
    }
    if (!got) return null;
    out.push(got);
  }
  return out.join("\n\n");
}
// 用户说“翻译”，或抓到的正文是英文：先让 Riva 翻一遍，把译文附给主模型去整理（Riva 不再排在聊天模型队列里）
async function preTranslate(msgs, env) {
  if (!getKeys(env.NVIDIA_KEYS).length) return null;
  const i = msgs.map((m) => m.role).lastIndexOf("user"); if (i < 0) return null;
  const m = msgs[i], full = textOf(m.content), own = full.split(/\n\n【/)[0], rest = full.slice(own.length);
  const asked = /翻译|翻一下|译成|translate/i.test(own);
  const src = rest.replace(/【[^】\n]*】[（(][^）)\n]*[）)]/g, "").trim() || (asked ? own : "");
  const bodyText = src.slice(0, 9000);
  const english = bodyText.length > 80 && cjkRatio(bodyText) < 0.3;
  if (!asked && !english) return null;
  if (!bodyText.trim()) return null;
  const toEn = asked && /(翻成|翻译成|译成|转成|to)\s*(英文|英语|english)/i.test(own);
  if (!toEn && cjkRatio(bodyText) >= 0.6) return null;   // 本来就是中文，不用翻
  const zh = await rivaTranslate(env, bodyText, toEn ? "en" : "zh"); if (!zh) return null;
  const add = "\n\n【Riva 翻译结果（" + (toEn ? "英文" : "中文") + "）】\n" + zh + "\n（以上译文由翻译模型 Riva 给出，请基于它整理最终回答；最终回答按系统规定的语言交。）";
  const next = msgs.slice();
  next[i] = { ...m, content: typeof m.content === "string" ? m.content + add : (Array.isArray(m.content) ? [...m.content, { type: "text", text: add }] : m.content) };
  return next;
}
const memKey = (user, pid) => "memory:" + user + ":" + String(pid || "").slice(0, 80);
function resumeNote(mem, partial) {
  const route = mem && mem.route ? "前面选的路线是 " + mem.route + "，" : "", prog = mem && mem.progress ? "前面写到 " + mem.progress + "，" : "";
  const acts = mem && Array.isArray(mem.actions) && mem.actions.length ? "用户之前的操作：" + mem.actions.slice(-8).map((a) => (a.part ? "第" + a.part + "部分" : "") + (a.action || "") + (a.note ? "（" + String(a.note).slice(0, 80) + "）" : "")).join("；") + "。" : "";
  let older = "";
  if (mem && Array.isArray(mem.messages) && mem.messages.length > 6) older = "\n对话记忆（较早的消息，供你接上思路）：\n" + mem.messages.slice(0, -6).slice(-24).map((x) => (x.role === "user" ? "用户：" : "助手：") + String(x.text || "").replace(/\s+/g, " ").slice(0, 500)).join("\n");
  return "你是接着上一个模型继续做，不是重新开始。" + route + prog + "从这里接着写，不要从头重写。" + acts + older;
}
// 项目记忆：每次请求都带（不只换模型时）。用户说“按前面那个路线 A”“前面说过的”，模型靠这段知道指什么
function memoryNote(mem) {
  if (!mem) return "";
  const route = mem.route ? "已选路线：" + mem.route + "。" : "", prog = mem.progress ? "进度：" + mem.progress + "。" : "";
  const acts = Array.isArray(mem.actions) && mem.actions.length ? "用户点过的操作：" + mem.actions.slice(-12).map((a) => (a.part ? "第" + a.part + "部分" : "") + (a.action || "") + (a.note ? "（" + String(a.note).slice(0, 80) + "）" : "")).join("；") + "。" : "";
  const ms = Array.isArray(mem.messages) ? mem.messages : [];
  const older = ms.length > 6 ? ms.slice(0, -6) : [];
  let said = older.filter((x) => x.role === "user").slice(-60).map((x) => "- " + String(x.text || "").replace(/\s+/g, " ").slice(0, 160)).join("\n");
  if (said.length > 6000) said = said.slice(-6000);
  if (!route && !prog && !acts && !said) return "";
  return "【项目记忆（这个项目前面发生的事，用户说“前面那个”“按之前的路线”时指的就是这里）】\n" + route + prog + acts + (said ? "\n用户前面说过的话（较早的，按时间）：\n" + said : "");
}
const mergeSys = (msgs, extra) => {
  const i = msgs.findIndex((m) => m.role === "system");
  if (i < 0) return [{ role: "system", content: extra }, ...msgs];
  const next = msgs.slice(); next[i] = { ...next[i], content: extra + "\n\n" + textOf(next[i].content) }; return next;
};
async function tryAllFree(rawMsgs, env, emit = async () => {}, wantStream = false, requested = "", opts = {}) {
  // 工作模式：把交付规则（中文输出 / 回答结构 / 链接）合进 system，前端自带的 system（文件协议）保留在后面
  const base = keepMultimodal(rawMsgs).filter((m) => typeof m.content === "string" ? m.content : Array.isArray(m.content) && m.content.length);
  if (!base.length) return null;
  const withRules = opts.raw ? base : mergeSys(base, WORK_SYSTEM_PROMPT);
  const mnote = opts.raw ? "" : memoryNote(opts.memory), messages = mnote ? mergeSys(withRules, mnote) : withRules;
  const oai = {
    Groq: { url: "https://api.groq.com/openai/v1/chat/completions", keys: "GROQ_KEYS", models: WORK_MODELS.groq, trim: false, body: (m, ms) => groqBody(m, ms, { temperature: 0.3, max_tokens: 32768 }) },
    OpenRouter: { url: "https://openrouter.ai/api/v1/chat/completions", keys: "OPENROUTER_KEYS", models: WORK_MODELS.openrouter, trim: false, body: (m, ms) => ({ model: m, messages: ms, max_tokens: 32768 }) },
    ...Object.fromEntries(EXTRA.map((p) => [p.name, { url: p.url, keys: p.keys, models: p.models, trim: true, body: (m, ms) => ({ model: m, messages: ms, temperature: 0.3, max_tokens: p.max }) }]))
  };
  // 用户在前端选了供应商 + 具体模型：先试这个模型，通了就用；不通再按原来的顺序兜底
  const order = requested && SRC_ORDER.includes(requested) ? [requested, ...SRC_ORDER.filter((x) => x !== requested && !AUTO_SKIP.has(x))] : SRC_ORDER.filter((x) => !AUTO_SKIP.has(x));
  const pick = (name, list) => (name === requested && opts.model && list.includes(opts.model)) ? [opts.model, ...list.filter((x) => x !== opts.model)] : list;
  // 前一个模型失败/中断后，后面的模型带着记忆“接着做”，不是重新开始
  let attempts = 0, hops = 0, partial = "", all = "", lastFrom = "", skippedCB = false;
  const emit2 = (t) => { all += t; return emit(t); };
  const build = () => {
    if (opts.raw || (!attempts && !partial)) return messages;
    if (!partial && !(opts.memory && (opts.memory.route || opts.memory.progress || (opts.memory.messages || []).length))) return messages;
    const m2 = mergeSys(messages, resumeNote(opts.memory, partial));
    return partial ? [...m2, { role: "assistant", content: partial }, { role: "user", content: "（上一个模型写到这里中断了。你是接着继续，不是重新开始：从断开的地方直接往下写，不要重复上面已写的内容，不要重新开头。）" }] : m2;
  };
  // v32：消息里带「【代码逻辑梳理】」→ 所有免费模型都按代码梳理的步骤交付
  const lastUserText = textOf(([...base].reverse().find((m) => m.role === "user") || {}).content || "");
  const withCode = (ms) => lastUserText.includes(CODE_ANALYZE_TAG) ? mergeSys(ms, CODE_ANALYZE_PROMPT) : ms;
  for (const name of order) {
    if (oai[name]) {
      const src = oai[name];
      for (const key of getKeys(env[src.keys])) {
        for (const model of pick(name, src.models)) {
          const ck = cbKey(name, model, key), forced = name === requested && model === opts.model;
          if (!opts.noBreaker && !forced && cbDown(ck)) { skippedCB = true; continue; }
          try {
            const r = await callOAI(src, key, model, withCode(build()), wantStream, emit2);
            if (r) {
              lastFrom = name + ":" + model;
              if (r.err && r.streamed && hops < 2 && all.trim()) { hops++; partial = all; attempts++; continue; }   // 写到一半断了：换下一个模型接着写
              return { text: r.text, from: lastFrom, streamed: r.streamed, err: r.err, resumed: hops > 0, contRounds: r.rounds || 0 };
            }
          } catch {}
          cbMark(ck);
          attempts++;
        }
      }
      continue;
    }
    if (name === "Gemini") {
      for (const key of getKeys(env.GEMINI_KEYS)) { const r = await tryGemini(withCode(build()), key, name === requested ? opts.model : ""); if (r) { if (wantStream && partial) await emit2(r); return { text: r, from: "Gemini", streamed: !!(wantStream && partial), err: "", resumed: hops > 0 }; } attempts++; }
    } else if (name === "CFAI" && env.AI) {
      // Cloudflare Workers AI 文本模型默认 max_tokens 只有 256，必须显式放大
      try {
        const r = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", { messages: trimMsgs(withCode(build())).map((m) => ({ role: m.role, content: textOf(m.content) })), max_tokens: 8192 });
        const txt = String(r?.response || "").trim();
        if (txt) { if (wantStream && partial) await emit2(txt); return { text: txt, from: "CF Workers AI", streamed: !!(wantStream && partial), err: "", resumed: hops > 0 }; }
      } catch {}
      attempts++;
    } else if (name === "Claude") {
      // v32：Claude。用户主动选 Claude 时按所选模型（默认 Sonnet 5）；只当兜底时仍用便宜的 haiku
      const cms = name === requested ? pick(name, CLAUDE_MODELS) : ["claude-haiku-5-5"];
      let stop = false;
      for (const key of getKeys(env.CLAUDE_KEYS)) {
        for (const cm of cms) {
          try {
            const bm = build();
            let sys = bm.filter((m) => m.role === "system").map((m) => textOf(m.content)).join("\n");
            const msgs = bm.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: textOf(m.content) })).filter((m) => m.content);
            const lastU = [...msgs].reverse().find((m) => m.role === "user");
            if (lastU && lastU.content.includes(CODE_ANALYZE_TAG)) sys = CODE_ANALYZE_PROMPT + "\n\n" + sys;
            const r = await claudeStream(key, cm, sys, msgs, wantStream ? emit2 : null);
            if (r.denied || r.refusal) { stop = true; if (wantStream) await emit2(r.denied ? "\n\n（Claude 拒绝了这次请求：" + r.denied + "）" : "\n\n（Claude 拒绝回答这个内容）"); return { text: r.text || "（Claude 拒绝了这次请求）", from: "Claude:" + cm, streamed: !!wantStream, err: "", resumed: hops > 0 }; }
            if (r.text) return { text: r.text, from: "Claude:" + cm, streamed: !!(wantStream && r.streamed), err: r.err || "", resumed: hops > 0 };
          } catch {}
        }
        if (stop) break;
      }
    }
  }
  // 有模型因为熔断被跳过、而且还什么都没输出：无视熔断再完整试一遍，免得“全在冷却”时直接失败
  if (skippedCB && !all.trim() && !opts.noBreaker) return tryAllFree(rawMsgs, env, emit, wantStream, requested, { ...opts, noBreaker: true });
  // 所有模型都用完了，但前面已经写出一部分：把已写的留给用户，不丢
  if (all.trim()) return { text: all, from: lastFrom, streamed: true, err: "上游模型中断，后面的模型也没能接上", resumed: hops > 0 };
  return null;
}

// ================= v34 连接器（权威组 / 官方接口 / 参考组）=================
// 原则：每条结果必须带链接，没有链接就丢掉（= 没查到）；不编数据；网页搜索只给标题+链接+摘要，不抄全文。
// 不碰：登录、GH_PAT / HF_TOKEN / BAIDU_MAP_AK 的值（只读取，不改）。
const C_UA = "Mozilla/5.0 (compatible; OpenManusGateway/1.0; +https://github.com)";
const cEu = encodeURIComponent;
const cCl = (s, n = 200) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const cStrip = (s, n = 300) => cCl(String(s || "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/g, "'").replace(/&nbsp;/g, " "), n);
class ConnErr extends Error { constructor(m, status) { super(m); this.status = status || 0; } }
async function cGet(url, opt = {}, ms = 8000) {
  const r = await fetch(url, { ...opt, signal: T(ms), headers: { "User-Agent": C_UA, Accept: "application/json, text/html;q=0.8, */*;q=0.5", ...(opt.headers || {}) } });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch {}
  return { r, j, t };
}
const C_NAMES = "Google Scholar|谷歌学术|WolframAlpha|Brave Search|Yandex|Naver|Ecosia|Startpage|Qwant|Mojeek|Bing|HuggingFace|Hugging Face|arXiv|Semantic Scholar|OpenAlex|Crossref|PubMed|Wikipedia|GitHub|知乎|CSDN|站酷|小红书|抖音|Meta|Facebook|Instagram|Threads|美团|京东|滴滴|滴答|百度地图|知网|CNKI|Britannica|大英百科|国家统计局|中国政府网|欧盟官网|NIH|官网|官方文档|Google|谷歌|网页搜索|全网|Learn Anything|CocoLoop|全景世界|YouArt|FMHY|Latent Box|Toolify|There's An AI For That|AI工具集|AI导航网|AIHUB|优设AI导航|AIXZD|Free AI Tools Directory|Wikidata|Stack Overflow|GitLab|Reddit|YouTube|Futurepedia|Pixabay|Pinterest|Vimeo|Unsplash|Sourcegraph|Phind|Wolfram|Lovart|Cherry Studio|iMini|Perplexity|OpenCode|OpenMAIC|Free LLM API";
const C_FILLER = new RegExp("请问|请你|帮我|帮忙|麻烦|给我|我想|我要|想知道|能不能|可以|一下|查一下|查查|查询|搜一下|搜索|搜|查|找找|找|看看|有没有|有哪些|有什么|怎么样|如何|吗|呢|吧|啊|呀|相关的|最新的|论文|文献|仓库|用\\s*(?:" + C_NAMES + ")|(?:" + C_NAMES + ")(?:上|里)?", "gi");
const cKeywords = (t) => { const k = cCl(String(t).replace(C_FILLER, " ").replace(/[，。？！?!,;；:：“”"'（）()\[\]【】、]/g, " ").replace(/\bpapers?\b/gi, " "), 120); return k.length >= 2 ? k : cCl(t, 80); };
const cIsCJK = (t) => (String(t).match(/[一-鿿]/g) || []).length >= 2;
const cDoiRe = /10\.\d{4,9}\/[^\s"'<>，。；、）)]+/;
const cDoi = (t) => { const m = String(t).match(cDoiRe); return m ? m[0].replace(/[.,;:]+$/, "") : ""; };
const cTag = (s, tag) => { const m = String(s).match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">")); return m ? cStrip(m[1], 4000) : ""; };

// ---------- 权威组 ----------
async function cHF(q, env, x) {
  const tok = String(env.HF_TOKEN || "").trim(), headers = tok ? { Authorization: "Bearer " + tok } : {};
  const lic = (m) => { const c = m.cardData && m.cardData.license; const v = Array.isArray(c) ? c.join("/") : c; return v || ((m.tags || []).find((t) => /^license:/.test(t)) || "").slice(8) || ""; };
  const idm = q.match(/(?:^|[\s(（"'“])([A-Za-z0-9][\w.-]*\/[A-Za-z0-9][\w.-]*)(?=$|[\s)）"'”，。？?!！,])/);
  let id = idm ? idm[1] : "", hits = [];
  if (!id) {
    const { r, j } = await cGet(`https://huggingface.co/api/models?search=${cEu(cKeywords(x.qEn))}&limit=5&sort=downloads&direction=-1`, { headers });
    if (!r.ok) throw new ConnErr("HuggingFace 返回 " + r.status + (r.status === 401 ? "（HF_TOKEN 无效）" : ""), r.status);
    hits = Array.isArray(j) ? j : []; if (!hits.length) return { items: [] };
    id = hits[0].id || hits[0].modelId;
  }
  const items = [], d = await cGet(`https://huggingface.co/api/models/${id}`, { headers });
  if (d.r.status === 404) { if (!hits.length) return { items: [], note: "HuggingFace 上没有 " + id }; }
  else if (!d.r.ok) throw new ConnErr("HuggingFace 返回 " + d.r.status, d.r.status);
  else if (d.j) {
    const m = d.j, files = (m.siblings || []).map((s) => s.rfilename);
    items.push({ title: m.id || id, url: "https://huggingface.co/" + (m.id || id), extra: `许可证：${lic(m) || "未标注（以模型页面为准）"}｜下载量：${m.downloads ?? "?"}｜点赞：${m.likes ?? "?"}｜任务：${m.pipeline_tag || "?"}｜更新：${String(m.lastModified || "").slice(0, 10) || "?"}${m.gated ? "｜需申请访问" : ""}｜文件(${files.length}个)：${files.slice(0, 12).join("、")}${files.length > 12 ? "…" : ""}` });
  }
  for (const m of hits.slice(items.length ? 1 : 0, 5)) { const mid = m.id || m.modelId; if (mid) items.push({ title: mid, url: "https://huggingface.co/" + mid, extra: `下载量：${m.downloads ?? "?"}｜点赞：${m.likes ?? "?"}｜许可证：${lic(m) || "未标注"}` }); }
  return { items };
}
async function cGithub(q, env, x) {
  const pat = String(env.GH_PAT || "").trim(); if (!pat) throw new ConnErr("GH_PAT 没有配置", 500);
  const kw = cCl(String(x.qEn).replace(/github|仓库|\brepo\b|代码库|开源项目|源码/gi, " ").replace(C_FILLER, " ")) || cCl(x.qEn, 60);
  const { r, j } = await cGet(`https://api.github.com/search/repositories?q=${cEu(kw)}&per_page=5`, { headers: { Authorization: "Bearer " + pat, Accept: "application/vnd.github+json" } });
  if (!r.ok) throw new ConnErr("GitHub API 返回 " + r.status, r.status);
  return { items: (j.items || []).map((p) => ({ title: p.full_name, url: p.html_url, extra: `★${p.stargazers_count}｜forks ${p.forks_count}｜${p.language || "?"}｜许可证：${(p.license && p.license.spdx_id) || "未标注"}｜${cCl(p.description, 120)}` })) };
}
async function cArxiv(q, env, x) {
  const idm = q.match(/\b(\d{4}\.\d{4,5})(?:v\d+)?\b|\b([a-z-]+(?:\.[A-Z]{2})?\/\d{7})\b/);
  const terms = cKeywords(x.qEn).split(/\s+/).filter(Boolean).slice(0, 6);
  const url = idm ? `https://export.arxiv.org/api/query?id_list=${cEu(idm[1] || idm[2])}` : `https://export.arxiv.org/api/query?search_query=${terms.map((w) => "all:" + cEu(w)).join("+AND+")}&start=0&max_results=4&sortBy=relevance`;
  const { r, t } = await cGet(url, {}, 10000);
  if (!r.ok) throw new ConnErr("arXiv 返回 " + r.status, r.status);
  const items = [];
  for (const e of t.split(/<entry>/).slice(1)) {
    const id = cTag(e, "id"); if (!id || /\/api\/errors/.test(id)) continue;
    const names = [...e.matchAll(/<name>([^<]*)<\/name>/g)].map((m) => cCl(m[1], 40)), doi = cTag(e, "arxiv:doi");
    items.push({ title: cTag(e, "title"), url: id.replace(/^http:/, "https:"), doi, extra: `作者：${names.slice(0, 5).join("、")}${names.length > 5 ? " 等" : ""}｜arXiv:${id.split("/abs/")[1] || ""}｜发布：${cTag(e, "published").slice(0, 10)}｜摘要：${cCl(cTag(e, "summary"), 160)}` });
  }
  return { items };
}
async function cS2(q, env, x) {
  const { r, j } = await cGet(`https://api.semanticscholar.org/graph/v1/paper/search?query=${cEu(cKeywords(x.qEn))}&limit=5&fields=title,authors,year,citationCount,abstract,externalIds,url,venue`, {}, 10000);
  if (r.status === 429) throw new ConnErr("Semantic Scholar 限流（429，免费公共额度被占满），过一会儿再试", 429);
  if (!r.ok) throw new ConnErr("Semantic Scholar 返回 " + r.status, r.status);
  return { items: (j.data || []).map((p) => ({ title: p.title, url: p.url || (p.paperId ? "https://www.semanticscholar.org/paper/" + p.paperId : ""), doi: (p.externalIds && p.externalIds.DOI) || "", extra: `作者：${(p.authors || []).slice(0, 5).map((a) => a.name).join("、")}｜${p.year || "?"}｜引用量：${p.citationCount ?? "?"}｜${cCl(p.venue, 60)}｜摘要：${cCl(p.abstract, 160) || "无"}` })) };
}
async function cOpenAlex(q, env, x) {
  const { r, j } = await cGet(`https://api.openalex.org/works?search=${cEu(cKeywords(x.qEn))}&per-page=5&select=id,doi,title,publication_year,cited_by_count,authorships,primary_location`, {}, 10000);
  if (!r.ok) throw new ConnErr("OpenAlex 返回 " + r.status, r.status);
  return { items: (j.results || []).map((w) => { const doi = String(w.doi || "").replace(/^https?:\/\/doi\.org\//, ""); const src = w.primary_location && w.primary_location.source; const inst = [...new Set((w.authorships || []).flatMap((a) => (a.institutions || []).map((i) => i.display_name)))].slice(0, 3);
    return { title: w.title, url: w.doi || w.id, doi, extra: `作者：${(w.authorships || []).slice(0, 5).map((a) => a.author && a.author.display_name).filter(Boolean).join("、")}｜${w.publication_year || "?"}｜被引：${w.cited_by_count ?? "?"}｜期刊：${(src && src.display_name) || "?"}｜机构：${inst.join("、") || "?"}` }; }) };
}
async function cCrossref(q, env, x) {
  const doi = cDoi(q);
  if (doi) {
    const { r, j } = await cGet(`https://api.crossref.org/works/${cEu(doi).replace(/%2F/gi, "/")}`, {}, 10000);
    if (r.status === 404) return { items: [], note: `Crossref 查不到 DOI ${doi}：它没有在 Crossref 登记（可能是编的、写错了；arXiv、Zenodo 等的 DOI 登记在 DataCite，也会查不到）` };
    if (!r.ok) throw new ConnErr("Crossref 返回 " + r.status, r.status);
    const m = j.message || {}, au = (m.author || []).slice(0, 5).map((a) => cCl((a.given || "") + " " + (a.family || ""), 40));
    return { items: [{ title: (m.title || [])[0] || "(无标题)", url: "https://doi.org/" + m.DOI, doi: m.DOI, extra: `✅ Crossref 已登记这个 DOI｜作者：${au.join("、")}｜${(m["container-title"] || [])[0] || m.publisher || "?"}｜${(((m.issued || {})["date-parts"] || [[]])[0] || [])[0] || "?"}｜被引：${m["is-referenced-by-count"] ?? "?"}` }] };
  }
  const { r, j } = await cGet(`https://api.crossref.org/works?query.bibliographic=${cEu(cKeywords(x.qEn))}&rows=5&select=DOI,title,author,issued,container-title,is-referenced-by-count`, {}, 10000);
  if (!r.ok) throw new ConnErr("Crossref 返回 " + r.status, r.status);
  return { items: ((j.message || {}).items || []).map((m) => ({ title: (m.title || [])[0] || "(无标题)", url: "https://doi.org/" + m.DOI, doi: m.DOI, extra: `作者：${(m.author || []).slice(0, 4).map((a) => cCl((a.given || "") + " " + (a.family || ""), 40)).join("、")}｜${(m["container-title"] || [])[0] || "?"}｜${(((m.issued || {})["date-parts"] || [[]])[0] || [])[0] || "?"}` })) };
}
async function cPubMed(q, env, x) {
  const s = await cGet(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${cEu(cKeywords(x.qEn))}&retmax=4&retmode=json&sort=relevance`, {}, 10000);
  if (!s.r.ok) throw new ConnErr("PubMed 返回 " + s.r.status, s.r.status);
  const ids = (s.j && s.j.esearchresult && s.j.esearchresult.idlist) || []; if (!ids.length) return { items: [] };
  const d = await cGet(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`, {}, 10000);
  if (!d.r.ok || !d.j) throw new ConnErr("PubMed 摘要接口返回 " + d.r.status, d.r.status);
  return { items: ids.map((id) => d.j.result && d.j.result[id]).filter(Boolean).map((p) => ({ title: cStrip(p.title, 200), url: `https://pubmed.ncbi.nlm.nih.gov/${p.uid}/`, doi: ((p.articleids || []).find((a) => a.idtype === "doi") || {}).value || "", extra: `作者：${(p.authors || []).slice(0, 5).map((a) => a.name).join("、")}｜${p.fulljournalname || p.source || "?"}｜${p.pubdate || "?"}｜PMID ${p.uid}` })) };
}
async function cWiki(q, env, x) {
  const lang = cIsCJK(q) ? "zh" : "en", kw = cKeywords(q).replace(/维基百科|维基|百科|是谁|什么是|是什么|定义|概念/g, " ").trim() || cKeywords(q);
  const s = await cGet(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cEu(kw)}&srlimit=3&format=json&utf8=1&origin=*`, {}, 8000);
  if (!s.r.ok) throw new ConnErr("Wikipedia 返回 " + s.r.status, s.r.status);
  const hits = (s.j && s.j.query && s.j.query.search) || []; const items = [];
  for (const [i, h] of hits.entries()) {
    const url = `https://${lang}.wikipedia.org/wiki/${cEu(h.title.replace(/ /g, "_"))}`; let extra = cStrip(h.snippet, 160);
    if (i === 0) { try { const w = await cGet(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${cEu(h.title)}`, {}, 6000); if (w.r.ok && w.j && w.j.extract) extra = cCl(w.j.extract, 320); } catch {} }
    items.push({ title: h.title, url, extra });
  }
  return { items };
}

// ---------- 官方接口：高德 → 腾讯（签名）→ 百度地图 / 天气 ----------
const mapMask = (s, ...secrets) => secrets.reduce((x, k) => k ? String(x).split(k).join("***") : x, String(s));
const mapLog = (tag, value, ...secrets) => console.log(tag, mapMask(value, ...secrets));
function cAmapKit(env) {
  const key = String(env.AMAP_KEY || "").trim(); if (!key) return null;
  const call = async (path, params = {}) => {
    const qs = new URLSearchParams({ ...params, key });
    const url = `https://restapi.amap.com/v3/${path}?${qs}`;
    mapLog("AMAP_REQ", url, key);
    try {
      const r = await fetch(url, { signal: T(8000), headers: { Accept: "application/json" } });
      const raw = await r.text(); let j = {}; try { j = JSON.parse(raw); } catch { throw new ConnErr("高德地图返回了非 JSON（HTTP " + r.status + "）", r.status); }
      mapLog("AMAP_RESP", `HTTP ${r.status} ${raw}`, key);
      if (!r.ok || j.status !== "1") throw new ConnErr(`高德地图返回 ${j.infocode || r.status}：${j.info || "请求失败"}`, 502);
      return j;
    } catch (e) { mapLog("AMAP_RESP", `ERROR ${e.message}`, key); throw e; }
  };
  const geo = async (name) => { try { const j = await call("geocode/geo", { address: name, output: "JSON" }), g = j.geocodes && j.geocodes[0]; if (g && g.location) { const [lng, lat] = g.location.split(",").map(Number); return { lat, lng, name, provider: "高德地图" }; } } catch {} try { const j = await call("place/text", { keywords: name, citylimit: "false", offset: 1, extensions: "all" }), x = j.pois && j.pois[0], a = String(x && x.location || "").split(",").map(Number); if (x && Number.isFinite(a[0]) && Number.isFinite(a[1])) return { lat: a[1], lng: a[0], name: x.name || name, provider: "高德地图" }; } catch {} throw new ConnErr(`高德地图没找到「${name}」`, 404); };
  const poi = async (kw, o = {}) => { const p = { keywords: kw, offset: 5, extensions: "all" }; if (o.loc) p.location = `${o.loc.lng},${o.loc.lat}`, p.radius = o.radius || 1000, p.sortrule = "distance"; else if (o.region) p.city = o.region; const j = await call(o.loc ? "place/around" : "place/text", p); let raw = j.pois || [], details = new Map(); if (o.detailed && raw.some(x => x.id)) { try { const d = await call("place/detail", { id: raw.filter(x => x.id).slice(0, 10).map(x => x.id).join(","), extensions: "all" }); for (const x of d.pois || []) details.set(x.id, x); } catch {} } const list = raw.map(x => { x = details.get(x.id) || x; const a = String(x.location || "").split(","), b = x.biz_ext || {}; return { name: x.name, address: x.address || "", telephone: x.tel || x.telephone, location: { lng: Number(a[0]), lat: Number(a[1]) }, detail_info: { distance: Number(x.distance) || undefined }, mapDetail: { type: x.type || x.typecode || "", tag: x.tag || "", price: b.cost || x.cost || "", openTime: b.opentime || x.opentime || "", rating: b.rating || x.rating || "", lines: x.businessextension && x.businessextension.buslines || [] } }; }).filter(x => x.name && Number.isFinite(x.location.lat) && Number.isFinite(x.location.lng)); return { list: list.slice(0, 5), via: o.loc ? "高德周边检索" : "高德地点检索", raw: list.length, provider: "高德地图" }; };
  const around = async (cat, o) => {   // v78：高德按类型码搜（types=六位分类码；写大类/中类码会带出下面的小类）；没有类型码的类别（公共自行车）才用关键词，结果仍然要过类型校验
    const p = { location: `${o.loc.lng},${o.loc.lat}`, radius: o.radius || 1000, sortrule: "distance", offset: 25, page: 1, extensions: "all" };
    if (cat.amap && cat.amap.length) p.types = cat.amap.join("|"); else p.keywords = cat.kw || cat.label;
    const j = await call("place/around", p);
    return (j.pois || []).map((x) => { const a = String(x.location || "").split(","); return { name: x.name, address: Array.isArray(x.address) ? "" : (x.address || ""), location: { lng: Number(a[0]), lat: Number(a[1]) }, detail_info: { distance: Number(x.distance) || undefined }, typeText: Array.isArray(x.type) ? "" : String(x.type || ""), typeCode: Array.isArray(x.typecode) ? "" : String(x.typecode || ""), mapDetail: { lines: (x.businessextension && x.businessextension.buslines) || [] } }; }).filter((x) => x.name && Number.isFinite(x.location.lat) && Number.isFinite(x.location.lng));
  };
  const regeo = async (loc) => call("geocode/regeo", { location: `${loc.lng},${loc.lat}`, extensions: "all" });
  const suggest = async (kw, city) => call("assistant/inputtips", { keywords: kw, city: city || "", citylimit: city ? "true" : "false" });
  const district = async (kw, sub = 1) => call("config/district", { keywords: kw || "中国", subdistrict: sub, extensions: "all" });
  const ip = async (addr) => call("ip", addr ? { ip: addr } : {});
  const weather = async (city, ext = "base") => call("weather/weatherInfo", { city, extensions: ext });
  const convert = async (locations, coordsys = "gps") => call("assistant/coordinate/convert", { locations, coordsys });
  const staticMap = (loc, zoom = 15, size = "750*400") => `https://restapi.amap.com/v3/staticmap?location=${loc.lng},${loc.lat}&zoom=${zoom}&size=${size}&markers=mid,,A:${loc.lng},${loc.lat}&key=${key}`;
  const route = async (mode, from, to) => { const path = mode === "walking" ? "direction/walking" : mode === "transit" ? "direction/transit/integrated" : mode === "riding" ? "direction/bicycling" : "direction/driving"; const p = mode === "transit" ? { origin: `${from.lng},${from.lat}`, destination: `${to.lng},${to.lat}`, city: from.city || "全国" } : { origin: `${from.lng},${from.lat}`, destination: `${to.lng},${to.lat}` }; return call(path, p); };
  const mk = () => ""; // 未取得上游真实详情链接时，不自行拼接 marker URL
  return { name: "高德地图", call: async () => { throw new ConnErr("高德地图请使用 route 接口", 400); }, geo, poi, around, regeo, suggest, district, ip, weather, convert, staticMap, route, mk };
}
async function md5Hex(s) { const b = await crypto.subtle.digest("MD5", new TextEncoder().encode(s)); return hex(b); }
// 腾讯 WebService GET 签名：路径 + "?" + 参数名 ASCII 升序、参数值保持原始值的查询串 + SK。
// 注意：签名串禁止 URL 编码；最终发出的 URL 才对每个参数值分别 URL 编码。
function tencentCanonical(path, params) {
  const requestPath = "/" + String(path || "").replace(/^\/+/, "");
  const entries = Object.keys(params).sort().map((k) => [k, String(params[k])]);
  const rawQuery = entries.map(([k, v]) => k + "=" + v).join("&");
  const encodedQuery = entries.map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v)).join("&");
  return { requestPath, rawQuery, encodedQuery, unsigned: requestPath + "?" + rawQuery };
}
async function tencentSignedUrl(path, params, sk) {
  const c = tencentCanonical(path, params);
  const sig = await md5Hex(c.unsigned + String(sk));
  return { sig, unsigned: c.unsigned, url: `https://apis.map.qq.com${c.requestPath}?${c.encodedQuery}&sig=${encodeURIComponent(sig)}` };
}
// v78：腾讯 key 每日额度用完（status 121）→ 当天不再用这把 key；有备用 TENCENT_MAP_KEY_2 / TENCENT_MAP_SK_2 就自动换；都用完就当“没配置”（降级成只用高德+百度）；TENCENT_MAP_DISABLE=1 可手动关闭
const TX_DOWN = {};
const bjNextMidnightMs = () => { const bj = Date.now() + 8 * 3600000; return (Math.floor(bj / 86400000) + 1) * 86400000 - 8 * 3600000; };
const txMarkDown = (key) => { TX_DOWN[key] = bjNextMidnightMs(); };
function txPickKey(env) {
  if (String(env.TENCENT_MAP_DISABLE || "") === "1") return null;
  for (const [k, v] of [[env.TENCENT_MAP_KEY, env.TENCENT_MAP_SK], [env.TENCENT_MAP_KEY_2, env.TENCENT_MAP_SK_2]]) { const key = String(k || "").trim(), sk = String(v || "").trim(); if (key && sk && !(TX_DOWN[key] > Date.now())) return { key, sk }; }
  return null;
}
function cTencentKit(env) {
  const pick = txPickKey(env); if (!pick) return null;
  const { key, sk } = pick;
  const call = async (path, params = {}) => {
    const signed = await tencentSignedUrl(path, { ...params, key }, sk);
    const { sig, unsigned, url } = signed;
    mapLog("TENCENT_REQ", url, key, sk);
    try { const r = await fetch(url, { signal: T(8000), headers: { Accept: "application/json" } }), raw = await r.text(); let j = {}; try { j = JSON.parse(raw); } catch { throw new ConnErr("腾讯地图返回了非 JSON（HTTP " + r.status + "）", r.status); } mapLog("TENCENT_RESP", `HTTP ${r.status} ${raw}`, key, sk); if (j.status === 121) txMarkDown(key); if (!r.ok || j.status !== 0) throw new ConnErr(`腾讯地图返回 ${j.status ?? r.status}：${j.message || "请求失败"}`, 502); return j; } catch (e) { mapLog("TENCENT_RESP", `ERROR ${e.message}`, key, sk); throw e; }
  };
  const geo = async (name) => { try { const j = await call("ws/geocoder/v1/", { address: name }), l = j.result && j.result.location; if (l) return { lat: l.lat, lng: l.lng, name, provider: "腾讯地图" }; } catch {} try { const j = await call("ws/place/v1/search", { keyword: name, boundary: "region(全国,0)", page_size: 1, page_index: 1 }), x = j.data && j.data[0], l = x && x.location; if (l && Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lng))) return { lat: Number(l.lat), lng: Number(l.lng), name: x.title || name, provider: "腾讯地图" }; } catch {} throw new ConnErr(`腾讯地图没找到「${name}」`, 404); };
  const poi = async (kw, o = {}) => { const p = { keyword: kw, page_size: 5, page_index: 1 }; if (o.loc) p.boundary = `nearby(${o.loc.lat},${o.loc.lng},${o.radius || 1000})`; else p.boundary = `region(${o.region || "全国"},0)`; const j = await call("ws/place/v1/search", p); let raw = j.data || [], details = new Map(); if (o.detailed && raw.some(x => x.id)) { try { const d = await call("ws/place/v1/detail", { id: raw.filter(x => x.id).slice(0, 10).map(x => x.id).join(",") }); for (const x of d.data || []) details.set(x.id, x); } catch {} } const list = raw.map(x => { x = details.get(x.id) || x; return { name: x.title, address: x.address || "", telephone: x.tel, location: { lat: Number(x.location && x.location.lat), lng: Number(x.location && x.location.lng) }, detail_info: { distance: Number(x._distance) || undefined }, mapDetail: { type: x.category || "", tag: x.tags || "", price: x.price || "", openTime: x.open_time || x.opentime || "", rating: x.rating || "", lines: x.buslines || [] } }; }).filter(x => x.name && Number.isFinite(x.location.lat) && Number.isFinite(x.location.lng)); return { list: list.slice(0, 5), via: o.loc ? "腾讯周边检索" : "腾讯地点检索", raw: list.length, provider: "腾讯地图" }; };
  const around = async (cat, o) => {   // v78：腾讯按分类过滤（filter=category=…），不是关键词
    const q = cat.tx || cat.label;
    const j = await call("ws/place/v1/search", { keyword: q, boundary: `nearby(${o.loc.lat},${o.loc.lng},${o.radius || 1000})`, filter: `category=${q}`, orderby: "_distance", page_size: 20, page_index: 1 });
    return (j.data || []).map((x) => ({ name: x.title, address: x.address || "", location: { lat: Number(x.location && x.location.lat), lng: Number(x.location && x.location.lng) }, detail_info: { distance: Number(x._distance) || undefined }, typeText: x.category || "", typeCode: "" })).filter((x) => x.name && Number.isFinite(x.location.lat) && Number.isFinite(x.location.lng));
  };
  const regeo = async (loc) => call("ws/geocoder/v1/", { location: `${loc.lat},${loc.lng}`, get_poi: 1 });
  const suggest = async (kw, region) => call("ws/place/v1/suggestion", { keyword: kw, region: region || "全国" });
  const district = async (id = "1") => call("ws/district/v1/list", { id });
  const ip = async (addr) => call("ws/location/v1/ip", addr ? { ip: addr } : {});
  const convert = async (locations, from = 1, to = 5) => call("ws/coord/v1/translate", { locations, type: from, to });
  const staticMap = async (loc, zoom = 15, size = "600*400") => (await tencentSignedUrl("/ws/staticmap/v2/", { center: `${loc.lat},${loc.lng}`, zoom, size, markers: `color:red|label:A|${loc.lat},${loc.lng}`, key }, sk)).url;
  const route = async (mode, from, to) => { const path = mode === "driving" ? "ws/direction/v1/driving/" : mode === "walking" ? "ws/direction/v1/walking/" : "ws/direction/v1/transit/"; return call(path, { from: `${from.lat},${from.lng}`, to: `${to.lat},${to.lng}`, policy: 0 }); };
  const mk = () => ""; // 未取得上游真实详情链接时，不自行拼接 marker URL
  return { name: "腾讯地图", call: async () => { throw new ConnErr("腾讯地图请使用 route 接口", 400); }, geo, poi, around, regeo, suggest, district, ip, convert, staticMap, route, mk };
}
async function cMapKit(env) {
  const kits = [cAmapKit(env), cTencentKit(env), cBaiduKit(env)].filter(Boolean), errs = [];
  if (!kits.length) return null;
  const run = async (method, ...args) => { for (const k of kits) { if (typeof k[method] !== "function") continue; try { const r = await k[method](...args); if (method !== "poi" || (r && r.list && r.list.length)) return r && typeof r === "object" ? { ...r, provider: k.name } : r; errs.push(k.name + "没有结果"); } catch (e) { errs.push(k.name + "：" + e.message); } } throw new ConnErr(errs.join("｜"), 502); };
  return { name: "地图（高德→腾讯→百度）", call: (...a) => run("call", ...a), geo: (...a) => run("geo", ...a), poi: (...a) => run("poi", ...a), regeo: (...a) => run("regeo", ...a), suggest: (...a) => run("suggest", ...a), district: (...a) => run("district", ...a), ip: (...a) => run("ip", ...a), weather: (...a) => run("weather", ...a), convert: (...a) => run("convert", ...a), staticMap: (...a) => run("staticMap", ...a), route: (...a) => run("route", ...a), mk: (...a) => { for (const k of kits) return k.mk(...a); } };
}
// v57：百度「地点检索」免费档每天只有 100 次、并发 3（控制台实测 0.01万次/天、3QPS）。这里：地点类请求串行 ≥450ms 间隔；遇到 302 额度用完就 10 分钟内不再打；结果存 KV 6 小时
let BD_PLACE_Q = Promise.resolve(), BD_PLACE_LAST = 0, BD_DOWN_UNTIL = 0;
const bdPlaceGate = () => { const p = BD_PLACE_Q.then(async () => { const w = BD_PLACE_LAST + 450 - Date.now(); if (w > 0) await new Promise((r) => setTimeout(r, w)); BD_PLACE_LAST = Date.now(); }); BD_PLACE_Q = p.catch(() => {}); return p; };
// v85：百度地点检索默认关闭（免费档每天 100 次、Worker 在海外出口）。需要时在 Worker 变量里加 BAIDU_PLACE=1 才会重新启用
const bdPlaceOn = (env) => String(env.BAIDU_PLACE || "") === "1";
function cBaiduKit(env) {
  const ak = String(env.BAIDU_MAP_AK || "").trim(); if (!ak) return null;
  const call = async (path, params) => {
    // v42：百度会把带“compatible; xxxGateway”这类机器人 UA 的请求挡成 HTML 页（HTTP 200），所以这里改用普通浏览器 UA；并兼容 BOM / 回调包裹；真不是 JSON 时把开头原文带出来，方便定位
    const isPlace = /^place\//.test(path);
    if (isPlace) { if (Date.now() < BD_DOWN_UNTIL) throw new ConnErr("百度地图返回 302：地点检索今天的额度用完了（免费档每天 100 次，北京时间 0 点恢复），已跳过，没再向百度发请求", 502); await bdPlaceGate(); }
    const query = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams(String(params || "")); query.set("ak", ak);
    const reqUrl = `https://api.map.baidu.com/${path}?${query.toString()}`; mapLog("BAIDU_REQ", reqUrl, ak);
    const r = await fetch(reqUrl, { signal: T(8000), headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "application/json, text/plain, */*", "Accept-Language": "zh-CN,zh;q=0.9" } });
    const raw = (await r.text()).replace(/^\uFEFF/, "").trim(); mapLog("BAIDU_RESP", `HTTP ${r.status} ${raw}`, ak); let j = null;
    try { j = JSON.parse(raw); } catch { const a = raw.indexOf("{"), b = raw.lastIndexOf("}"); if (a >= 0 && b > a) { try { j = JSON.parse(raw.slice(a, b + 1)); } catch {} } }
    if (!j) { const xs = raw.match(/<status>\s*(\d+)\s*<\/status>/), xm = raw.match(/<message>([\s\S]*?)<\/message>/); if (xs) throw new ConnErr(`百度地图返回 ${xs[1]}：${cCl(xm ? xm[1] : "", 80)}（它按 XML 回了错误，一般是请求参数不合法）`, 502); }
    if (!j) throw new ConnErr("百度地图返回了非 JSON（HTTP " + r.status + "，" + (r.headers.get("content-type") || "无类型") + "，开头：" + cCl(raw.replace(/\s+/g, " ").split(ak).join("***"), 90) + "）", r.status);
    if (j.status !== 0) { const m = String(j.message || j.msg || ""); if (isPlace && (j.status === 302 || j.status === 4)) BD_DOWN_UNTIL = Date.now() + 600000; throw new ConnErr(`百度地图返回 ${j.status}：${m}` + (/IP|白名单|AK|权限|禁用|ak/.test(m) ? "（检查 AK 的服务类型和 IP 白名单；Worker 出口 IP 不固定，白名单要设成 0.0.0.0/0）" : ""), 502); }
    return j;
  };
  const geo = async (name, coord = "bd09ll") => { const j = await call("geocoding/v3/", `address=${cEu(name)}&output=json&ret_coordtype=${coord}`); const l = j.result && j.result.location; if (!l) throw new ConnErr(`百度地图没找到「${name}」，请说具体一点`, 404); return { lat: l.lat, lng: l.lng, name }; };
  const poiRaw = async (kw, o = {}) => {
    // v44：地点检索按“参数从全到少”依次试，哪一档被百度判参数非法就退到下一档；没有 scope/filter 时在本地算距离、过滤半径、排序
    // v48：你在浏览器里试的 query+location+radius+output 能出结果，而我之前的每一档都带了 page_size（百度把它判成参数非法），所以去掉 page_size；第一档就用浏览器验证过的最小参数，数量在本地截 5 个
    const base = [`query=${cEu(kw)}`, "output=json"], radius = o.radius || 1000, region = `region=${cEu(o.region || "全国")}`;
    const triesAll = o.loc ? [
      [...base, "scope=2", "is_chinese_mainland=1", `location=${o.loc.lat},${o.loc.lng}`, `radius=${radius}`],
      [...base, "scope=2", `location=${o.loc.lat},${o.loc.lng}`, `radius=${radius}`, "radius_limit=true", "filter=" + cEu("sort_name:distance|sort_rule:1")],
      [...base, "scope=2", `location=${o.loc.lat},${o.loc.lng}`, `radius=${radius}`, "radius_limit=true"],
      [...base, region],
    ] : [[...base, region, "scope=2", "is_chinese_mainland=1"], [...base, region]];
    const tries = triesAll.length > 2 ? [triesAll[0], triesAll[triesAll.length - 1]] : triesAll;   // v57：只试第一档和最后一档，每多试一档都吃一次每天 100 次的额度
    const R = 6371000, rad = (x) => (x * Math.PI) / 180, hav = (p) => { const dLa = rad(p.lat - o.loc.lat), dLo = rad(p.lng - o.loc.lng), a = Math.sin(dLa / 2) ** 2 + Math.cos(rad(o.loc.lat)) * Math.cos(rad(p.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(a))); };
    const localize = (arr) => arr.filter((x) => x.location && x.name).map((x) => ({ ...x, detail_info: { ...(x.detail_info || {}), distance: hav(x.location) } })).filter((x) => x.detail_info.distance <= radius).sort((a, b) => a.detail_info.distance - b.detail_info.distance).slice(0, 5);
    const errs = []; let j = null, used = -1, anyOk = false;
    for (const [i, p] of tries.entries()) { try { j = await call("place/v2/search", p.join("&")); used = i; break; } catch (e) { errs.push(`方案${i + 1}：` + String(e.message).replace(/^百度地图/, "")); if (!/返回 2：|参数|Parameter/i.test(e.message)) break; } }
    // v47：v2 地点检索全被拒时，再试 v3 周边检索 和 输入提示(suggestion)，结果在本地按距离筛
    if (!j && o.loc && !errs.some((e) => /302|额度|配额/.test(e))) {
      const loc = `${o.loc.lat},${o.loc.lng}`;
      for (const [label, path, params, key] of [
        ["place/v3/around", "place/v3/around", `query=${cEu(kw)}&location=${loc}&radius=${radius}&output=json&page_num=0&page_size=10&scope=2`, "results"],
        ["place/v2/suggestion", "place/v2/suggestion", `query=${cEu(kw)}&region=${cEu(o.region || "全国")}&city_limit=true&location=${loc}&output=json&ret_coordtype=bd09ll`, "result"],
      ]) {
        try { const g = await call(path, params); anyOk = true; const arr = Array.isArray(g[key]) ? g[key] : [], list = localize(arr); if (list.length) return { list, via: label, raw: arr.length }; errs.push(label + "：通了但 " + arr.length + " 条里没有 " + radius + " 米内的"); } catch (e) { errs.push(label + "：" + String(e.message).replace(/^百度地图/, "")); }
      }
    }
    // v64：按城市搜（没有坐标）时，v2 被拒就补一次百度 3.0 行政区划检索，参数和百度官方 Python 示例一致（output+page_num+page_size+region_limit+scope）；只多一次请求
    if (!j && !o.loc && !errs.some((e) => /302|额度|配额/.test(e))) {
      try { const g = await call("place/v3/region", `query=${cEu(kw)}&region=${cEu(o.region || "全国")}&output=json&page_num=0&page_size=10&region_limit=false&scope=2`); anyOk = true; const arr = Array.isArray(g.results) ? g.results : []; if (arr.length) return { list: arr.slice(0, 5), via: "place/v3/region（3.0 行政区划检索）", raw: arr.length }; errs.push("place/v3/region：通了但没有结果"); } catch (e) { errs.push("place/v3/region：" + String(e.message).replace(/^百度地图/, "")); }
    }
    // v46：地点检索 4 档都被判参数非法时，改走“逆地理编码”找周边；先按类别试，再放宽到“交通设施”，最后不限类别、在本地按名字 / 标签筛
    if (!j && o.loc) {
      const key = /公交/.test(kw) ? /公交|巴士|公共汽车/ : /地铁/.test(kw) ? /地铁/ : null, kinds = [/公交/.test(kw) ? "公交车站" : /地铁/.test(kw) ? "地铁站" : kw, ...(key ? ["交通设施"] : []), ""];
      let rawN = 0;
      for (const kind of kinds) {
        try {
          const g = await call("reverse_geocoding/v3/", `location=${o.loc.lat},${o.loc.lng}&output=json&extensions_poi=1&radius=${Math.min(radius, 1000)}${kind ? "&poi_types=" + cEu(kind) : ""}`);
          anyOk = true; const pois = (g.result && g.result.pois) || []; rawN = Math.max(rawN, pois.length);
          const list = pois.filter((x) => x.name && x.point && (!key || key.test(x.name + " " + (x.tag || "")))).map((x) => ({ name: x.name, address: x.addr || "", location: { lat: x.point.y, lng: x.point.x }, detail_info: { distance: Number(x.distance) || undefined } })).sort((a, b) => (a.detail_info.distance || 1e9) - (b.detail_info.distance || 1e9)).slice(0, 5);
          if (list.length) return { list, via: "逆地理编码 poi_types=" + (kind || "不限"), raw: pois.length };
        } catch (e) { errs.push("方案5（逆地理编码找周边 " + (kind || "不限") + "）：" + String(e.message).replace(/^百度地图/, "")); }
      }
      if (!anyOk) throw new ConnErr("百度地图地点检索失败｜" + errs.join("｜"), 502);
      return { list: [], via: "地点检索全被拒（" + errs.slice(0, 6).join("；") + "），逆地理编码也没有匹配", raw: rawN };
    }
    if (!j) throw new ConnErr("百度地图地点检索失败｜" + errs.join("｜"), 502);
    if (j.result_type === "city_list") return { cityList: true, list: [] };
    let list = j.results || [];
    if (o.loc) list = localize(list); else list = list.slice(0, 5);
    return { list, via: "地点检索方案" + (used + 1), raw: (j.results || []).length };
  };
  const poi = async (kw, o = {}) => {   // v57：同样的查询 6 小时内直接用 KV 里的结果，不再耗百度额度
    const kv = env.KV, ck = "bdpoi:" + [kw, o.region || "", o.loc ? o.loc.lat.toFixed(3) + "," + o.loc.lng.toFixed(3) : "", o.radius || ""].join("|");
    if (kv) { try { const c = await kv.get(ck, "json"); if (c && c.list && c.list.length) return { ...c, via: (c.via || "") + "（缓存，没耗百度额度）" }; } catch {} }
    const res = await poiRaw(kw, o);
    if (kv && res && res.list && res.list.length) { try { await kv.put(ck, JSON.stringify(res), { expirationTtl: 21600 }); } catch {} }
    return res;
  };
  const around = async (cat, o) => {   // v78：百度按分类（tag=分类）检索；scope=2 才带回每个点的分类 detail_info.tag，供二次校验
    const q = cat.bd || cat.label, loc = `${o.loc.lat},${o.loc.lng}`, radius = o.radius || 1000, kv = env.KV, ck = "bdcat:" + [cat.key, o.loc.lat.toFixed(3), o.loc.lng.toFixed(3), radius].join("|");
    if (kv) { try { const c = await kv.get(ck, "json"); if (c && c.length) return c; } catch {} }
    const base = [`query=${cEu(q)}`, "output=json", `location=${loc}`, `radius=${radius}`];
    const tg = cat.bdTag ? [`tag=${cEu(cat.bdTag)}`] : [];   // tag 只是“分类偏好”不保证严格；严格靠返回的 detail_info.tag 二次校验
    const tries = [[...base, ...tg, "scope=2", "is_chinese_mainland=1", "radius_limit=true"], [...base, "scope=2"], base];
    let j = null, lastErr = null;
    for (const p of tries) { try { j = await call("place/v2/search", p.join("&")); break; } catch (e) { lastErr = e; if (!/返回 2：|参数|Parameter/i.test(String(e.message))) throw e; } }
    if (!j) throw lastErr || new ConnErr("百度地图没有响应", 502);
    const arr = (j.results || []).filter((x) => x && x.location && x.name).map((x) => { const d = x.detail_info || {}; return { name: x.name, address: x.address || "", location: { lat: Number(x.location.lat), lng: Number(x.location.lng) }, detail_info: { distance: Number(d.distance) || undefined }, typeText: [d.tag, d.type, d.classified_poi_tag, x.tag].filter(Boolean).join(";"), typeCode: "" }; });
    if (kv && arr.length) { try { await kv.put(ck, JSON.stringify(arr), { expirationTtl: 21600 }); } catch {} }
    return arr;
  };
  const mk = () => ""; // 未取得上游真实详情链接时，不自行拼接 marker URL
  return { call, geo, mk, ...(bdPlaceOn(env) ? { poi, around } : {}) };   // v85：默认只暴露地理编码 + 通用 call（逆地理 / 路线）；poi / around 要 BAIDU_PLACE=1
}
// ---------- v49：百度地图自检 + 地点检索被拒时的备用（OpenStreetMap / Overpass，免费免钥匙）----------
const bdToGcj = (lat, lng) => { const X = (Math.PI * 3000) / 180, x = lng - 0.0065, y = lat - 0.006, z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X), th = Math.atan2(y, x) - 0.000003 * Math.cos(x * X); return { lat: z * Math.sin(th), lng: z * Math.cos(th) }; };
const gcjDelta = (lat, lng) => {
  const a = 6378245.0, ee = 0.00669342162296594323, PI = Math.PI;
  const tl = (x, y) => { let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x)); r += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3; r += ((20 * Math.sin(y * PI) + 40 * Math.sin((y / 3) * PI)) * 2) / 3; r += ((160 * Math.sin((y / 12) * PI) + 320 * Math.sin((y * PI) / 30)) * 2) / 3; return r; };
  const tn = (x, y) => { let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x)); r += ((20 * Math.sin(6 * x * PI) + 20 * Math.sin(2 * x * PI)) * 2) / 3; r += ((20 * Math.sin(x * PI) + 40 * Math.sin((x / 3) * PI)) * 2) / 3; r += ((150 * Math.sin((x / 12) * PI) + 300 * Math.sin((x / 30) * PI)) * 2) / 3; return r; };
  let dLat = tl(lng - 105, lat - 35), dLng = tn(lng - 105, lat - 35); const rad = (lat / 180) * PI; let m = Math.sin(rad); m = 1 - ee * m * m; const sm = Math.sqrt(m);
  return { dLat: (dLat * 180) / (((a * (1 - ee)) / (m * sm)) * PI), dLng: (dLng * 180) / ((a / sm) * Math.cos(rad) * PI) };
};
const bdToWgs = (lat, lng) => { const g = bdToGcj(lat, lng), d = gcjDelta(g.lat, g.lng); return { lat: g.lat - d.dLat, lng: g.lng - d.dLng }; };
const wgsToBd = (lat, lng) => { const d = gcjDelta(lat, lng), gl = lat + d.dLat, go = lng + d.dLng, X = (Math.PI * 3000) / 180, z = Math.sqrt(go * go + gl * gl) + 0.00002 * Math.sin(gl * X), th = Math.atan2(gl, go) + 0.000003 * Math.cos(go * X); return { lat: z * Math.sin(th) + 0.006, lng: z * Math.cos(th) + 0.0065 }; };
const raceMs = (pr, ms, msg) => { pr.catch(() => {}); return Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error(msg)), ms))]); };   // 连接器总共只有 12 秒：百度地点检索最多等 6 秒，不行就用备用
// ---------- v52：百度地图 MCP（百度自己托管的 Streamable HTTP 服务）+ 三路并行找地点：REST → MCP → OpenStreetMap ----------
// 背景：同一把 AK、同样的参数，浏览器里 place/v2/search 能出结果，Worker 里被判 status 2 —— 说明百度地点检索 REST 不接受 Worker 的出口；MCP 是百度服务器替你去查，不走 Worker 的出口。
async function bdMcpSession(ak) {
  const url = `https://mcp.map.baidu.com/mcp?ak=${encodeURIComponent(ak)}`; let sid = "", id = 0;
  const hide = (x) => String(x).split(ak).join("***");
  const post = async (body) => {
    const r = await fetch(url, { method: "POST", signal: T(7000), headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...(sid ? { "Mcp-Session-Id": sid } : {}) }, body: JSON.stringify(body) });
    const h = r.headers.get("mcp-session-id"); if (h) sid = h;
    const raw = await r.text(); let msg = null;
    if (/event-stream/i.test(r.headers.get("content-type") || "")) { for (const blk of raw.split(/\r?\n\r?\n+/)) { const d = blk.split(/\r?\n/).filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim()).join(""); if (!d) continue; try { const j = JSON.parse(d); if (j.result || j.error) msg = j; } catch {} } }
    else { try { msg = JSON.parse(raw); } catch {} }
    return { r, msg, raw };
  };
  const call = async (method, params) => {
    const { r, msg, raw } = await post({ jsonrpc: "2.0", id: ++id, method, params });
    if (!msg) throw new ConnErr(`百度 MCP 没返回可解析的内容（HTTP ${r.status}｜${cCl(hide(raw).replace(/\s+/g, " "), 120)}）`, 502);
    if (msg.error) throw new ConnErr("百度 MCP 报错：" + cCl(hide(JSON.stringify(msg.error)), 160), 502);
    return msg.result;
  };
  const init = async () => { await call("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "openmanus-gateway", version: "1.0" } }); try { await post({ jsonrpc: "2.0", method: "notifications/initialized" }); } catch {} };
  return { init, call };
}
async function bdMcpSearch(ak, kw, o) {
  const s = await bdMcpSession(ak); await s.init();
  const tl = (await s.call("tools/list", {})).tools || [], tool = tl.find((t) => t.name === "map_search_places") || tl.find((t) => /search.*place|place.*search/i.test(t.name));
  if (!tool) throw new ConnErr("百度 MCP 里没有地点检索工具（有：" + tl.map((t) => t.name).join("、") + "）", 502);
  const sc = tool.inputSchema || {}, props = Object.keys(sc.properties || {}), pick = (...n) => n.find((x) => props.includes(x)), args = {}, kq = pick("query", "keyword", "q");
  if (!kq) throw new ConnErr("百度 MCP 地点检索工具没有 query 参数（有：" + props.join("、") + "）", 502);
  args[kq] = kw;
  if (o.loc) { const kl = pick("location", "center"), kr = pick("radius"); if (kl) args[kl] = `${o.loc.lat},${o.loc.lng}`; if (kr) args[kr] = o.radius || 1000; }
  const pm = (sc.properties || {}).is_chinese_mainland; if (pm) args.is_chinese_mainland = pm.type === "string" ? "1" : pm.type === "integer" || pm.type === "number" ? 1 : true;   // v85：MCP 地点检索的 is_chinese_mainland（国内=1/true）
  const kg = pick("region", "city"); if (kg && (o.region || !o.loc || (sc.required || []).includes(kg))) args[kg] = o.region || "全国";
  const res = await s.call("tools/call", { name: tool.name, arguments: args });
  const txt = ((res && res.content) || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  if (res && res.isError) throw new ConnErr("百度 MCP 工具报错：" + cCl(txt, 160), 502);
  let j = null; try { j = JSON.parse(txt); } catch { const a = txt.indexOf("{"), b = txt.lastIndexOf("}"); if (a >= 0 && b > a) { try { j = JSON.parse(txt.slice(a, b + 1)); } catch {} } }
  if (!j) throw new ConnErr("百度 MCP 返回的不是 JSON：" + cCl(txt.replace(/\s+/g, " "), 120), 502);
  if (j.status != null && j.status !== 0) throw new ConnErr(`百度 MCP 返回 ${j.status}：${cCl(j.message || "", 80)}`, 502);
  const arr = [j.results, j.result, j.pois, j.data && j.data.results, j.data].find(Array.isArray) || [], R = 6371000, rad = (x) => (x * Math.PI) / 180;
  const list = arr.map((x) => { const l = x.location || (x.lat != null ? { lat: x.lat, lng: x.lng } : null); if (!l || !x.name) return null; const dist = o.loc ? Math.round(2 * R * Math.asin(Math.sqrt(Math.sin(rad(l.lat - o.loc.lat) / 2) ** 2 + Math.cos(rad(o.loc.lat)) * Math.cos(rad(l.lat)) * Math.sin(rad(l.lng - o.loc.lng) / 2) ** 2))) : undefined; return { name: x.name, address: x.address || "", telephone: x.telephone, location: { lat: Number(l.lat), lng: Number(l.lng) }, detail_info: { distance: dist } }; }).filter(Boolean);
  const inR = o.loc ? list.filter((x) => x.detail_info.distance <= (o.radius || 1000)).sort((a, b) => a.detail_info.distance - b.detail_info.distance) : list;
  return inR.slice(0, 5);
}
async function nearbyAlt(env, k, kw, o, radius, region, restMs) {
  const ak = String(env.BAIDU_MAP_AK || "").trim(), errs = [];
  const restP = k.poi(kw, { loc: o, radius, region });
  const mcpP = bdPlaceOn(env) ? bdMcpSearch(ak, kw, { loc: o, radius, region }).then((list) => ({ list }), (e) => ({ err: String(e.message).split(ak).join("***") })) : Promise.resolve({ err: "百度地点检索已关闭（BAIDU_PLACE 未开）" });
  const osmP = osmNearby(kw, o, radius).then((f) => ({ f }), (e) => ({ err: e.message }));
  let p = null, restNote = ""; try { p = await raceMs(restP, restMs, "百度 REST 地点检索超过 " + restMs / 1000 + " 秒没返回"); } catch (e) { restNote = e.message; errs.push(e.message); }
  if (p && !p.list.length) restNote = p.via || "没有结果";
  if (p && p.list.length) return { kind: "rest", p, errs };
  const m = await Promise.race([mcpP, new Promise((r) => setTimeout(() => r({ err: "百度 MCP 超过 3 秒没返回" }), 3000))]);
  if (m.list && m.list.length) return { kind: "mcp", list: m.list, errs, restNote };
  errs.push("MCP：" + (m.err || "没有结果"));
  const f = await osmP; if (f.f && f.f.list.length) return { kind: "osm", f: f.f, errs, restNote, mcpErr: m.err || "没有结果" };
  if (f.err) errs.push("OSM：" + f.err);
  return { kind: "none", p, errs };
}
const OSM_KINDS = [
  [/公共自行车|共享单车|自行车站|单车/, "公共自行车站", ['["amenity"="bicycle_rental"]']],
  [/充电桩|充电站|电动车充电|新能源汽车充电/, "充电桩", ['["amenity"="charging_station"]']],
  [/停车场|停车位|停车/, "停车场", ['["amenity"="parking"]']],
  [/银行|ATM|取款机|自动取款/, "银行/ATM", ['["amenity"="bank"]', '["amenity"="atm"]']],
  [/公交|巴士/, "公交站", ['["highway"="bus_stop"]', '["public_transport"="platform"]["bus"="yes"]']],
  [/地铁/, "地铁站", ['["station"="subway"]', '["railway"="subway_entrance"]']],
];
async function osmNearby(kw, loc, radius) {
  const k = OSM_KINDS.find(([re]) => re.test(kw)); if (!k) return null;
  const w = bdToWgs(loc.lat, loc.lng), rr = Math.min(radius, 3000);
  const body = "[out:json][timeout:12];(" + k[2].map((f) => `node(around:${rr},${w.lat.toFixed(6)},${w.lng.toFixed(6)})${f};`).join("") + ");out 80;";
  let j = null, err = "";
  try {
    j = await Promise.any(["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"].map(async (ep) => {
      const r = await fetch(ep, { method: "POST", body: "data=" + encodeURIComponent(body), headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "OpenManusGateway/1.0" }, signal: T(9000) });
      if (!r.ok) throw new Error("HTTP " + r.status); return await r.json();
    }));
  } catch (e) { err = (e.errors || []).map((x) => x.message).join("；") || e.message; }
  if (!j) throw new ConnErr("OpenStreetMap 备用数据也没连上（" + err + "）", 502);
  const R = 6371000, rad = (x) => (x * Math.PI) / 180, seen = new Set(), all = [];
  for (const e of j.elements || []) {
    if (e.type !== "node" || typeof e.lat !== "number") continue;
    const dLa = rad(e.lat - w.lat), dLo = rad(e.lon - w.lng), a = Math.sin(dLa / 2) ** 2 + Math.cos(rad(w.lat)) * Math.cos(rad(e.lat)) * Math.sin(dLo / 2) ** 2, t = e.tags || {};
    all.push({ id: e.id, name: t["name:zh"] || t.name || "", d: Math.round(2 * R * Math.asin(Math.sqrt(a))), lat: e.lat, lng: e.lon, ref: t.route_ref || t.ref || t.lines || "" });
  }
  const out = []; for (const x of all.filter((x) => x.d <= radius).sort((a, b) => a.d - b.d)) { if (x.name) { if (seen.has(x.name)) continue; seen.add(x.name); } out.push(x); }   // 同名站点（马路两侧）只算一个
  return { kind: k[1], distinct: out.length, list: out.slice(0, 5) };
}
const osmItem = (x, kind) => ({ title: x.name || kind + "（OSM 上没有名字）", url: `https://www.openstreetmap.org/node/${x.id}`, src: "OpenStreetMap（备用，非百度）", extra: `距离约 ${x.d} 米${x.ref ? "｜线路 " + x.ref : ""}｜OpenStreetMap 志愿者数据，可能不全、不是实时` });
async function baiduDiag(env, full = false) {
  const ak = String(env.BAIDU_MAP_AK || "").trim();
  if (!ak) return { items: [], note: "Worker 里没读到 BAIDU_MAP_AK（Secret 名字必须一模一样，改完要重新部署）" };
  const mask = (x) => String(x).split(ak).join("***"), UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
  const probe = async (label, pq, plain, extraH) => {
    if (!full && /^[③④⑦⑧⑨⑩⑫⑬⑭⑮]/.test(label)) return null;   // v57：这些都是地点类请求，每个都吃每天 100 次的额度
    try { const r = await fetch(`https://api.map.baidu.com/${pq}&ak=${encodeURIComponent(ak)}`, { signal: T(8000), headers: plain ? {} : { "User-Agent": UA, Accept: "application/json, text/plain, */*", "Accept-Language": "zh-CN,zh;q=0.9", ...(extraH || {}) } }); const raw = mask((await r.text()).replace(/\s+/g, " ").trim()); const lg = []; r.headers.forEach((v, hk) => { if (/logid|x-bd|request-id/i.test(hk)) lg.push(hk + "=" + v); }); const tt = new Date(), bj = new Date(tt.getTime() + 8 * 3600000).toISOString().replace("T", " ").slice(0, 19); return `${label}｜HTTP ${r.status}｜${raw.startsWith("<") ? "XML/HTML" : "JSON"}｜${cCl(raw, 150)}｜响应头：${lg.join("；") || "没有 logid 相关头"}｜时间：北京时间 ${bj}`; }
    catch (e) { return `${label}｜请求失败：${e.message}`; }
  };
  let colo = ""; try { const tr = await (await fetch("https://www.cloudflare.com/cdn-cgi/trace", { signal: T(4000) })).text(); colo = tr.split("\n").filter((l) => /^(colo|loc|ip)=/.test(l)).join("，"); } catch {}
  let ip = ""; try { ip = (await (await fetch("https://api.ipify.org?format=json", { signal: T(4000) })).json()).ip || ""; } catch {}
  const lines = (await Promise.all([
    probe("①地理编码", `geocoding/v3/?address=${cEu("上海浦东新区陆家嘴")}&output=json`),
    (async () => {   // v59：地点检索类探针串行（每次间隔 600ms，免得再被并发 3 限流），并加两个对比：带 Referer、经第三方中转（换一个出口 IP）
      const q2 = `place/v2/search?query=${cEu("公交站")}&region=${cEu("上海")}&output=json`, out = [], nap = () => new Promise((r) => setTimeout(r, 600));
      out.push(await probe("②地点检索（和你浏览器里成功的写法一样：query+region+output）", q2)); await nap();
      out.push(await probe("⑯同②，另加 Referer: https://lbsyun.baidu.com/ 头", q2, false, { Referer: "https://lbsyun.baidu.com/" })); await nap();
      try { const r = await fetch(`https://r.jina.ai/https://api.map.baidu.com/${q2}&ak=${encodeURIComponent(ak)}`, { signal: T(15000), headers: { Accept: "text/plain" } }); out.push("⑰同②，但经第三方中转 r.jina.ai 发出（出口 IP 不是 Cloudflare）｜HTTP " + r.status + "｜" + mask((await r.text()).replace(/\s+/g, " ").trim().slice(0, 260))); } catch (e) { out.push("⑰经第三方中转｜请求失败：" + e.message); }
      out.push(await probe("⑲百度 Python 示例的参数原样（place/v3/region：output+page_num+page_size+region_limit+scope=2+type，用你自己的 AK）", `place/v3/region?query=${cEu("ATM机")}&region=${cEu("北京市海淀区")}&output=json&page_num=0&page_size=10&region_limit=true&scope=2&type=${cEu("银行")}`)); await nap();
      if (full) out.push(await probe("⑳同⑲，但 User-Agent 换成 python-requests（示例脚本发出去的样子）", `place/v3/region?query=${cEu("ATM机")}&region=${cEu("北京市海淀区")}&output=json&page_num=0&page_size=10&region_limit=true&scope=2&type=${cEu("银行")}`, false, { "User-Agent": "python-requests/2.31.0", Accept: "*/*" }));
      return out.join("\n");
    })(),
    raceMs(bdMcpSearch(ak, "公交站", { loc: { lat: 31.239, lng: 121.499 }, radius: 1000, region: "上海" }).then((l) => "⑱百度 MCP 真实地点检索（公交站，外滩 1000 米）｜共 " + l.length + " 个：" + l.map((x) => x.name + (x.address ? "（" + cCl(x.address, 30) + "）" : "")).join("、"), (e) => "⑱百度 MCP 真实地点检索｜失败：" + mask(e.message)), 12000, "超过 12 秒没返回").catch((e) => "⑱百度 MCP 真实地点检索｜" + e.message),
    probe("③同②，但不带浏览器头", `place/v2/search?query=${cEu("公交站")}&region=${cEu("上海")}&output=json`, true),
    probe("④周边检索 location+radius", `place/v2/search?query=${cEu("公交站")}&location=31.239,121.499&radius=1000&output=json`),
    probe("⑦同②，加 scope=2&page_size=10（对比有没有这些参数）", `place/v2/search?query=${cEu("公交站")}&region=${cEu("上海")}&output=json&scope=2&page_size=10`),
    probe("⑧地点检索 region 改城市代码 131", `place/v2/search?query=${cEu("公交站")}&region=131&output=json`),
    probe("⑨地点检索换关键词（银行）", `place/v2/search?query=${cEu("银行")}&region=${cEu("上海")}&output=json`),
    probe("⑩地点检索 v3 周边", `place/v3/around?query=${cEu("公交站")}&location=31.239,121.499&radius=1000&output=json`),
    (async () => { try { const r = await fetch("https://httpbin.org/headers", { signal: T(6000) }); const h = (await r.json()).headers || {}; return "⑪Worker 实际发出的请求头（httpbin 回显）｜" + Object.entries(h).map(([a, b]) => a + "=" + cCl(String(b), 60)).join("；"); } catch (e) { return "⑪Worker 实际发出的请求头｜没取到：" + e.message; } })(),
    probe("⑫百度官方文档示例原样：place/v2/search ATM机+银行+北京", `place/v2/search?query=${cEu("ATM机")}&tag=${cEu("银行")}&region=${cEu("北京")}&output=json`),
    probe("⑬官方文档示例原样：place/v3/around 银行 39.915,116.404 半径2000", `place/v3/around?query=${cEu("银行")}&location=39.915,116.404&radius=2000`),
    probe("⑭官方文档示例原样：place/v3/region ATM机+银行+北京", `place/v3/region?query=${cEu("ATM机")}&type=${cEu("银行")}&region=${cEu("北京")}`),
    probe("⑮官方文档示例：多维检索 api_place_pro/v1/region", `api_place_pro/v1/region?page_num=0&region_limit=true&scope=2&output=json&extensions_adcode=true&region=${cEu("郑州")}&query=${cEu("宠物友好餐厅")}`),
    probe("⑤逆地理编码", `reverse_geocoding/v3/?location=31.239,121.499&output=json&extensions_poi=1`),
    probe("㉑路线：步行 directionlite/v1/walking（人民广场→外滩，附近结果的真实步行距离靠它）", `directionlite/v1/walking?origin=31.2304,121.4737&destination=31.2397,121.4998`),
    probe("㉒路线：批量算路 routematrix/v2/walking（1 个起点 × 2 个终点）", `routematrix/v2/walking?origin=31.2304,121.4737&destination=31.2397,121.4998|31.2380,121.4900`),
    raceMs((async () => { const s = await bdMcpSession(ak); await s.init(); const tl = (await s.call("tools/list", {})).tools || []; return "㉓百度 MCP 路线工具参数｜" + ["map_directions", "map_directions_matrix"].map((n) => { const t = tl.find((x) => x.name === n), sc = (t && t.inputSchema) || {}; return n + "：" + (Object.keys(sc.properties || {}).join("、") || "（没找到）") + "（必填：" + ((sc.required || []).join("、") || "无") + "）"; }).join("；"); })(), 8000, "超过 8 秒没返回").catch((e) => "㉓百度 MCP 路线工具参数｜失败：" + cCl(String(e.message).split(ak).join("***"), 200)),
    raceMs((async () => { const s = await bdMcpSession(ak); await s.init(); const tl = (await s.call("tools/list", {})).tools || [], t = tl.find((x) => x.name === "map_search_places"), sc = (t && t.inputSchema) || {}; return `⑥百度 MCP（Streamable HTTP，百度服务器替你查）｜通｜工具：${tl.map((x) => x.name).join("、")}｜map_search_places 参数：${Object.keys(sc.properties || {}).join("、") || "（没找到这个工具）"}（必填：${(sc.required || []).join("、") || "无"}）`; })(), 8000, "超过 8 秒没返回").catch((e) => "⑥百度 MCP（Streamable HTTP）｜失败：" + cCl(String(e.message).split(ak).join("***"), 220)),
  ])).filter(Boolean);
  if (!full) lines.push("（为省额度，已略过 ③④⑦–⑩⑫–⑮ 这些地点类探针：百度地点检索免费档每天只有 100 次、并发 3。要跑完整自检，请说“百度完整自检”）");
  const sent = `实际发出的②URL：https://api.map.baidu.com/place/v2/search?query=${cEu("公交站")}&region=${cEu("上海")}&output=json&ak=***`;
  const shape = /^[A-Za-z0-9]{32}$/.test(ak) ? "32 位字母数字（正常）" : "不是常见的 32 位字母数字，检查有没有多余的引号、空格、换行";
  return { items: [{ title: "百度地图自检结果（Worker 真实向百度发请求，百度的原始回复）", url: "https://lbsyun.baidu.com/apiconsole/key", src: "百度地图开放平台（自检）", verbatim: true, extra: `AK：长度 ${ak.length}，${shape}，开头 ${ak.slice(0, 4)}…结尾 ${ak.slice(-4)}（和百度控制台里那把 AK 对一下是不是同一把）｜Worker 出口 IP：${ip || "没取到"}｜Worker 所在 Cloudflare 节点：${colo || "没取到"}\n${sent}\n` + lines.join("\n") }], note: "【系统会把自检原文原样贴在回答末尾，你只用一两句话说“自检结果见下方原文”，不要改写、不要猜原因】百度官方状态码对照（只能按这个解释，不要编别的原因）：2=请求参数非法；4 或 302=当天调用次数超限；401=并发超限；210=IP 校验失败；211=SN 校验失败；240=该 AK 没勾选这项服务。注意：百度地点检索免费档每天只有 100 次、并发 3；同一个官方示例请求，在不同时间可能一次回 401 并发超限、另一次回 status 2，所以 status 2 不一定是参数写错，也可能是被限流。⑯是加了 Referer 的对比，⑰是换了出口 IP 的对比，⑱是百度 MCP 的真实检索：哪一条出了结果、哪一条没出，就说明问题出在“请求头”还是“出口 IP”，只陈述这个对比，不要下别的结论。只有真的出现 210 / 240 才能说 IP 白名单 / 服务没勾选；没有出现就不要提。" };
}
// v60：百度「轻量级路线规划-公交」directionlite/v1/transit：每个公交段（vehicle）带 start_time 首班车 / end_time 末班车（文档：公交路线规划，2026/03/19）
// v63：百度公交方案的 steps 里，步行段也带一个空的 vehicle 对象，之前把它当成“公交 ? → ?”列了出来；现在只收有线路名的车辆段。
// 文档：step.type 3=公交 5=步行；vehicle.name 是线路名。start_time 和 end_time 一样时，只是百度给了一个时刻，不能当“首班=末班”。
const bdBus = (x) => x && x.vehicle && typeof x.vehicle === "object" && String(x.vehicle.name || "").trim() && x.type !== 5;
const bdTimes = (v, none) => { const a = v.start_time || "", b = v.end_time || ""; return a && b && a === b ? `百度只给了一个时刻 ${a}（不一定是首末班）` : `首班 ${a || none}｜末班 ${b || none}`; };
async function cBaiduTransit(env, o, d, prov) {
  const kit = cBaiduKit(env); if (!kit) throw new ConnErr("没有配置 BAIDU_MAP_AK", 500);
  const ct = /高德|腾讯/.test(prov || "") ? "gcj02" : "bd09ll";   // 起终点是高德/腾讯地理编码出来的就是国测局坐标
  const j = await kit.call("directionlite/v1/transit", `origin=${o.lat},${o.lng}&destination=${d.lat},${d.lng}&coord_type=${ct}&steps_info=1`);
  const routes = (j.result && j.result.routes) || [], none = "未提供";
  const items = routes.slice(0, 2).map((rt, i) => {
    const vs = (rt.steps || []).flat().filter(bdBus).map((x) => x.vehicle);
    const lines = vs.map((v) => `${v.name}｜${bdTimes(v, none)}｜${v.start_name || "?"}→${v.end_name || "?"}${v.stop_num ? "｜经过 " + v.stop_num + " 站" : ""}`).join("；");
    return { title: `公交方案${i + 1}（${vs.map((v) => v.name).filter(Boolean).join(" → ") || "步行"}）`, url: `https://api.map.baidu.com/direction?origin=latlng:${o.lat},${o.lng}|name:${cEu(o.name || "起点")}&destination=latlng:${d.lat},${d.lng}|name:${cEu(d.name || "终点")}&mode=transit&coord_type=${ct}&output=html&src=webapp.openmanus.gateway`, src: "百度地图 公交路线规划", extra: `约 ${((rt.distance || 0) / 1000).toFixed(1)} 公里｜约 ${Math.max(1, Math.round((rt.duration || 0) / 60))} 分钟${rt.price ? "｜票价 " + rt.price + " 元" : ""}｜${lines || "没有公交车辆信息"}`, mapAt: Date.now() };
  });
  return { items, note: items.length ? "首班 / 末班时间来自百度公交路线规划的 start_time / end_time；地铁或部分线路可能没有这两个字段（写“未提供”）" : "百度没有给出公交方案" };
}
async function cMapCore(q, env) {
  const k = await cMapKit(env); if (!k) throw new ConnErr("AMAP_KEY、TENCENT_MAP_KEY/TENCENT_MAP_SK、BAIDU_MAP_AK 都没有配置", 500);
  const t = String(q);
  const detailed = /详细版|详情|详细|带地址|带电话|带首末班/.test(t), cat = /农家乐|餐馆|饭店|餐厅|民宿|景点|公交站|地铁站|医院|加油站|充电桩|充电站|停车场|停车位|银行|ATM|取款机/.test(t), wantsList = /有哪些|哪里有|推荐|附近|周边|周围|有什么/.test(t), city = t.match(/(?:北京|上海|天津|重庆|香港|澳门|[一-鿿]{2,3}市|[一-鿿]{2,4}(?:区|县))/);
  if (/军民农家乐/.test(t) && !city && !/附近|周边|周围/.test(t)) return { items: [], note: "你要查哪个城市的军民农家乐？" };
  if (/诊断|自检|排查/.test(t) && /百度/.test(t)) return await baiduDiag(env, /完整|全部|full/i.test(t));
  const addrLabel = /公交|巴士|地铁/.test(t) ? "途经线路" : "地址";
  const item = (p, extra) => ({ title: p.name, url: p.url || "", extra: extra || `${addrLabel}：${p.address || "?"}${p.telephone ? "｜电话：" + p.telephone : ""}`, mapDetail: { ...(p.mapDetail || {}), address: p.address || "", telephone: p.telephone || "", distance: p.detail_info && p.detail_info.distance }, mapSource: p.provider || "百度地图", mapAt: Date.now() });
  const dist = (p) => { const d = p.detail_info && p.detail_info.distance; return d != null ? `｜距离约 ${d} 米` : ""; };
  const rm = t.match(/从\s*(.{1,20}?)\s*(?:走到|骑到|开到|到|去|至)\s*(.{1,24}?)\s*(?:有多远|多远|多长|多久|怎么走|怎么去|的?距离|的?路线|需要|要多|走路|步行|骑车|开车|$|[，。？?！!])/);
  if (rm) {
    const from = rm[1].replace(/^(我|请问|帮我|查一下)/, "").trim(), toRaw = rm[2].replace(/(?:坐|乘|搭)?(?:公交|地铁|公共交通).*$|首末班.*|首班.*|末班.*|最早一班.*|最晚一班.*|怎么.*/, "").trim(), nearest = toRaw.match(/^(?:最近的|附近的|离.{1,10}最近的)(.+)$/);
    const o = await k.geo(from), items = []; let to = toRaw, d;
    if (nearest) {
      const nk = nearest[1].replace(/(多远|的)$/g, ""), A = await nearbyAlt(env, k, nk, o, 3000, undefined, 5000);
      if (A.kind === "rest") { const x = A.p.list[0]; to = x.name; d = { lat: x.location.lat, lng: x.location.lng }; items.push(item(x, `最近的一个｜${addrLabel}：${x.address || "?"}${dist(x)}`)); }
      else if (A.kind === "mcp") { const x = A.list[0]; to = x.name; d = { lat: x.location.lat, lng: x.location.lng }; items.push(item(x, `最近的一个（百度地图 MCP）｜${addrLabel}：${x.address || "?"}${dist(x)}`)); }
      else if (A.kind === "osm") { const x = A.f.list[0]; to = x.name || A.f.kind; d = wgsToBd(x.lat, x.lng); items.push(osmItem(x, A.f.kind)); items[0].extra = `最近的一个（高德/腾讯地点检索没给出结果，改用 OpenStreetMap 备用数据）｜` + items[0].extra; }
      else { if (!A.p) throw new ConnErr(A.errs.join("｜"), 502); return { items: [], note: `「${from}」3 公里内没有查到${nearest[1]}（${A.p.via}）` }; }
    }
    else d = await k.geo(toRaw);
    const mt = t.split(from).join(" ").split(toRaw).join(" "), mode = /开车|驾车|自驾|打车/.test(mt) ? "driving" : /骑/.test(mt) ? "riding" : /公交|地铁|公共交通/.test(mt) ? "transit" : "walking", mn = { driving: "驾车", riding: "骑行", transit: "公交", walking: "步行" }[mode];
    if (mode === "transit" && String(env.BAIDU_MAP_AK || "").trim()) {
      try { const bt = await cBaiduTransit(env, { ...o, name: from }, { ...d, name: to }, o.provider || d.provider); if (bt.items.length) return { items: [...items, ...bt.items], note: bt.note }; } catch (e) { items.push({ title: "百度公交路线规划没成功", url: "https://lbsyun.baidu.com/faq/api?title=webapi/directionlite-v1/transit", src: "百度地图 公交路线规划", extra: cCl(String(e.message).split(String(env.BAIDU_MAP_AK)).join("***"), 140) + "（下面改用别的地图的公交路线，不含首末班）" }); }
    }
    const j = await k.route(mode, o, d), rt = (j.route && (j.route.paths && j.route.paths[0] || j.route.routes && j.route.routes[0] || j.route[0])) || (j.result && j.result.routes && j.result.routes[0]);
    if (!rt) return { items, note: "百度地图没有给出路线" };
    const steps = (rt.steps || []).flat().map((s) => cStrip(s.instruction || "", 60)).filter(Boolean).slice(0, 6);
    items.unshift({ title: `${from} → ${to}（${mn}）`, url: `https://api.map.baidu.com/direction?origin=latlng:${o.lat},${o.lng}|name:${cEu(from)}&destination=latlng:${d.lat},${d.lng}|name:${cEu(to)}&mode=${mode}&output=html&src=webapp.openmanus.gateway`, extra: `距离：约 ${(rt.distance / 1000).toFixed(2)} 公里（${rt.distance} 米）｜预计 ${Math.max(1, Math.round(rt.duration / 60))} 分钟${steps.length ? "｜路线：" + steps.join("；") : ""}` });
    return { items };
  }
  const cm = t.match(/(.{1,16}?)(?:的)?(?:附近|周边|周围)/);
  if (cm) {
    const center = cm[1].replace(/(请问|帮我|查一下|查|我|在|看看|离|这里|这|那里)/g, "").trim();
    if (!center) return { items: [], note: "没说你在哪儿，百度地图不知道“附近”是哪里——请告诉我具体地点（例如“中山路附近”）" };
    const rad = t.match(/(\d+)\s*(米|m\b|公里|km)/i), radius = rad ? Math.round(Number(rad[1]) * (/公里|km/i.test(rad[2]) ? 1000 : 1)) : 1000;
    const kw = (t.split(/附近|周边|周围/)[1] || "").replace(/\d+\s*(?:米|m\b|公里|km)(?:内|以内)?|有几个|有多少个?|有哪些|有没有|有什么|有|几个|多少|的|[？?。！!，,]|吗|呢|请问/gi, " ").trim() || (t.split(/附近|周边|周围/)[0].match(/(?:的|查)(.+)$/) || [])[1] || "";
    if (!kw) return { items: [], note: `想查「${center}」附近的什么？比如“${center}附近 500 米有几个公共自行车站”` };
    const o = await k.geo(center), region = (center.match(/^(北京|上海|天津|重庆|[一-鿿]{2,3}市)/) || [])[1], A = await nearbyAlt(env, k, kw, o, radius, region, 6000), head = cCl(String(A.restNote || "没有结果").split(/[；｜]/)[0].replace(/^地点检索全被拒（/, ""), 80);
    if (A.kind === "rest") { const p = A.p; return { items: p.list.map((x) => item(x, `${addrLabel}：${x.address || "?"}${dist(x)}`)), note: `「${center}」${radius} 米内查到 ${p.list.length} 个（${p.via}；接口一次最多返回 5 个，实际数量可能更多）` }; }
    if (A.kind === "mcp") return { items: A.list.map((x) => item(x, `${addrLabel}：${x.address || "?"}${dist(x)}`)), note: `「${center}」${radius} 米内查到 ${A.list.length} 个（百度地图 MCP；百度 REST 地点检索没给出结果：${head}；接口一次最多列 5 个）` };
    if (A.kind === "osm") return { items: A.f.list.map((x) => osmItem(x, A.f.kind)), note: `高德/腾讯地点检索没有给出结果（${head}），已改用 OpenStreetMap 备用数据（志愿者数据，可能不全）：「${center}」${radius} 米内按站名去重共 ${A.f.distinct} 个，最多列 5 个` };
    if (!A.p) throw new ConnErr(A.errs.join("｜"), 502);
    return { items: [], note: `「${center}」${radius} 米内没有查到${kw}（${A.p.via}，接口原始返回 ${A.p.raw} 条）` };
  }
  if (/附近|周边|周围/.test(t)) return { items: [], note: "你现在在哪个地点？" };   // v65：“附近 500 米…”前面没有地名，不能把它当关键词去全国搜

  const kw = cKeywords(t).replace(/在哪里?|在哪儿|的?地址|位置|有哪些|哪里有|推荐|附近|周边|周围/g, " ").trim() || cCl(t, 40), region = city ? city[0].replace(/市$/, "") : undefined;
  let p; try { p = await k.poi(kw, { region, detailed }); } catch (e) { try { const g = await k.geo(kw); return { items: [item({ ...g, address: "", provider: g.provider }, `地理编码位置：${kw}；POI 详细地址暂无`) ] }; } catch {} throw e; }
  if (p.cityList) return { items: [], note: `「${kw}」在全国多个城市都有，请告诉我是哪个城市` };
  if (!p.list.length) { try { const g = await k.geo(kw); return { items: [item({ ...g, address: "", provider: g.provider }, `地理编码位置：${kw}；详细地址暂无`) ] }; } catch {} }
  return { items: p.list.map((x) => item({ ...x, provider: p.provider })) };
}
async function cMap(q, env) {
  const r = await cMapCore(q, env), t = String(q);
  if (/首班|末班|首末班|最早一班|最晚一班/.test(t) && !/从\s*.{1,20}?\s*(?:到|去|至)/.test(t) && r && Array.isArray(r.items) && r.items.length) r.note = (r.note ? r.note + "｜" : "") + "首末班：百度只在“公交路线规划”里给出首班/末班时间，要查请说「从 起点 到 终点 坐公交」；地点检索只有站名和途经线路";
  return r;
}
const C_WMO = { 0: "晴", 1: "大部晴朗", 2: "多云", 3: "阴", 45: "雾", 48: "冻雾", 51: "小毛毛雨", 53: "毛毛雨", 55: "大毛毛雨", 56: "冻毛毛雨", 57: "强冻毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 66: "冻雨", 67: "强冻雨", 71: "小雪", 73: "中雪", 75: "大雪", 77: "雪粒", 80: "小阵雨", 81: "阵雨", 82: "强阵雨", 85: "小阵雪", 86: "大阵雪", 95: "雷暴", 96: "雷暴伴小冰雹", 99: "雷暴伴大冰雹" };
function cWeatherPlace(t) {
  const left = String(t).replace(/今天|明天|后天|大后天|周末|这周末|这周|本周|下周|最近|未来|现在|目前|这两天|今晚|明早|天气预报|天气|气温|温度|怎么样|怎样|如何|冷不冷|热不热|下不下雨|会不会下雨|下雨|下雪|降雨|降水|会不会|多少度|几度|要不要|带伞|穿什么|穿|衣服|的|请问|帮我|查一下|查查|查|看看|有没有|是不是|吗|呢|吧|啊|用\s*[A-Za-z一-鿿]{0,12}\s*查|[，。？?！!,.\s]/g, "");
  return left.length >= 2 && left.length <= 12 ? left : "";
}
async function cWeather(q, env, location = null) {
  const place = cWeatherPlace(q), loc = normLoc(location); if (!place && !loc) return { items: [], note: "没拿到你的定位，你在上海吗？" };
  const kit = cBaiduKit(env); let lat, lng, via = "", geoUrl = "", geoErr = "", display = place || "你的位置";
  if (loc) {
    const w = toWgs(loc); lat = w.lat; lng = w.lng; via = "browser-gps";
    display = loc.city || loc.district || loc.address || "你的位置";
    if (!loc.city && kit) { try { const bd = ptToBd(loc), g = await kit.call("reverse_geocoding/v3/", `location=${bd.lat.toFixed(6)},${bd.lng.toFixed(6)}&output=json&extensions_poi=0`), ac = g.result && g.result.addressComponent || {}; display = String(ac.city || ac.province || display).replace(/市$/, "") || display; } catch {} }
    geoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&timezone=auto`;
  } else {
    if (kit) { try { const g = await kit.geo(place, "gcj02ll"); lat = g.lat; lng = g.lng; via = "baidu"; geoUrl = kit.mk(place, { lat: Math.round(g.lat * 1e4) / 1e4, lng: Math.round(g.lng * 1e4) / 1e4 }, place); } catch (e) { geoErr = e.message; } }
  }
  if (lat == null) {
    const g = await cGet(`https://geocoding-api.open-meteo.com/v1/search?name=${cEu(place)}&count=1&language=zh`, {}, 8000), rs = g.j && g.j.results && g.j.results[0];
    if (!rs) return { items: [], note: `没能把「${place}」换成经纬度${geoErr ? "（" + geoErr + "）" : ""}，请说得更具体些` };
    lat = rs.latitude; lng = rs.longitude; via = "openmeteo"; display = rs.name || place; geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cEu(place)}&count=1&language=zh`;
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&timezone=auto&forecast_days=7`;
  const { r, j } = await cGet(url, {}, 8000); if (!r.ok || !j || !j.daily) throw new ConnErr("Open-Meteo 返回 " + r.status, r.status);
  const d = j.daily, pick = /大后天/.test(q) ? 3 : /后天/.test(q) ? 2 : /明天|明早/.test(q) ? 1 : -1, wk = /周末/.test(q), day = (i) => { const dt = new Date(d.time[i] + "T00:00:00Z"), wd = "日一二三四五六"[dt.getUTCDay()], hit = (pick === i) || (wk && [0, 6].includes(dt.getUTCDay())); return `${hit ? "★" : ""}${d.time[i].slice(5)}(周${wd}) ${C_WMO[d.weather_code[i]] || "?"} ${d.temperature_2m_min[i]}~${d.temperature_2m_max[i]}°C 降雨概率 ${d.precipitation_probability_max[i] ?? "?"}%`; };
  const cur = j.current ? `现在 ${j.current.temperature_2m}°C ${C_WMO[j.current.weather_code] || ""}` : "";
  // v86：空气质量（Open-Meteo air-quality，免费免 key）。只给美国标准 AQI + PM2.5；拿不到就不写，不影响天气
  let aqi = null; try { const a = await cGet(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5&timezone=auto`, {}, 6000), c = a.r.ok && a.j && a.j.current; if (c && Number.isFinite(Number(c.us_aqi))) aqi = { us: Math.round(c.us_aqi), pm25: Number.isFinite(Number(c.pm2_5)) ? Math.round(c.pm2_5 * 10) / 10 : null }; } catch {}
  const aqiLvl = (v) => v <= 50 ? "良好" : v <= 100 ? "中等" : v <= 150 ? "对敏感人群不健康" : v <= 200 ? "不健康" : v <= 300 ? "非常不健康" : "有害";
  const aqiTxt = aqi ? `空气质量：AQI ${aqi.us}（美标，${aqiLvl(aqi.us)}）${aqi.pm25 != null ? "·PM2.5 " + aqi.pm25 + " μg/m³" : ""}` : "";
  const items = [{ src: "Open-Meteo", aqi: !!aqi, title: `${display} 天气预报（7 天）`, url, extra: `${cur}${aqiTxt ? "｜" + aqiTxt : ""}｜${Array.from({ length: Math.min(7, d.time.length) }, (_, i) => i).map(day).join("｜")}` }];
  items.push(via === "browser-gps" ? { src: "浏览器 GPS", title: `${display} 位置（来自浏览器 navigator.geolocation）`, url: geoUrl, extra: `坐标 ${lat}, ${lng}` } : via === "baidu" ? { src: "百度地图", title: `${display} 位置（经纬度来自百度地图地理编码）`, url: geoUrl, extra: `坐标 ${lat}, ${lng}` } : { src: "Open-Meteo 地理编码", title: `${display} 位置（经纬度来自 Open-Meteo 地理编码${kit ? "；百度地图没调通：" + geoErr : "；没配 BAIDU_MAP_AK"}）`, url: geoUrl, extra: `坐标 ${lat}, ${lng}` });
  return { items };
}
function weatherDirectReply(r) {
  if (!r || !r.items || !r.items.length) return r && r.note ? r.note : "没查到天气数据。";
  const main = r.items[0], pos = r.items[1];
  return `**${main.title}**\n${String(main.extra || "").split("｜").filter(Boolean).join("\n")}${pos ? "\n\n" + pos.title + "\n" + pos.extra : ""}\n\n来源：Open-Meteo（浏览器 GPS / 地理编码）`;
}

// v86：新闻只走 Tavily 新闻模式（topic=news + time_range=day），不用普通搜索。必须带发布时间（没有的丢掉）、只留最近 24 小时、按时间倒序
const cAgo = (ms) => { const m = Math.max(0, Math.round((Date.now() - ms) / 60000)); return m < 1 ? "刚刚" : m < 60 ? m + " 分钟前" : m < 1440 ? Math.floor(m / 60) + " 小时前" : Math.floor(m / 1440) + " 天前"; };
async function tavilyNewsList(query, env, max = 8) {
  const key = String(env && env.TAVILY_KEY || "").trim(); if (!key) throw new ConnErr("没配置 TAVILY_KEY，新闻只走 Tavily 新闻模式，已跳过", 500);
  const r = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify({ query: cCl(query, 300), topic: "news", time_range: "day", max_results: 20, search_depth: "basic", include_answer: false }), signal: T(10000) });
  const j = await r.json().catch(() => null); if (!r.ok || !j) throw new ConnErr("Tavily 新闻返回 " + r.status, r.status);
  const now = Date.now();
  return (j.results || []).filter((x) => x && x.url && x.title).map((x) => ({ x, ts: Date.parse(x.published_date || "") })).filter((o) => Number.isFinite(o.ts) && now - o.ts <= 24 * 3600e3).sort((a, b) => b.ts - a.ts).slice(0, max)
    .map(({ x, ts }) => ({ title: cDec(x.title), url: x.url, ts, ago: cAgo(ts), snippet: cCl(cStrip(x.content || "", 160), 160) }));
}
async function cNews(q, env) {
  const list = await tavilyNewsList(cKw(q) || "今日要闻", env, 8);
  return { items: list.map((n) => ({ title: n.title, url: n.url, ts: n.ts, extra: `${n.ago}｜${n.snippet}`, src: `Tavily 新闻（${n.ago}）` })), note: list.length ? "" : "Tavily 新闻模式最近 24 小时内没有带发布时间的结果（没时间的不显示）" };
}

// ---------- 参考组：网页搜索（非官方数据）----------
const C_WEB = {
  zhihu: { name: "知乎", sites: ["zhihu.com"] }, csdn: { name: "CSDN", sites: ["blog.csdn.net"] }, zcool: { name: "站酷", sites: ["zcool.com.cn"] },
  xiaohongshu: { name: "小红书（国内版 xiaohongshu.com）", sites: ["xiaohongshu.com"] }, douyin: { name: "抖音", sites: ["douyin.com"] },
  meta: { name: "公开社交帖子（Instagram / Facebook / X / Threads）", sites: ["facebook.com", "instagram.com", "threads.net", "threads.com", "x.com", "twitter.com"] },
  meituan: { name: "美团", sites: ["meituan.com"] }, jd: { name: "京东", sites: ["jd.com"] },
  didi: { name: "滴滴", sites: ["didiglobal.com", "xiaojukeji.com", "didi.cn"] }, didapinche: { name: "滴答", sites: ["didapinche.com"] },
  cnki: { name: "知网 CNKI", sites: ["cnki.net"] },
  britannica: { name: "Britannica 大英百科", sites: ["britannica.com"] },
  stats: { name: "国家统计局", sites: ["stats.gov.cn"] },
  govcn: { name: "中国政府网", sites: ["gov.cn"] },
  nih: { name: "美国 NIH", sites: ["nih.gov"] },
  eugov: { name: "欧盟官网", sites: ["europa.eu"] },
  pydoc: { name: "Python 官网", sites: ["python.org"] },
  pytorch: { name: "PyTorch 官网", sites: ["pytorch.org"] },
  mistral: { name: "Mistral 官网", sites: ["mistral.ai"] },
  metaai: { name: "Meta 官网（Llama / Meta AI）", sites: ["llama.com", "ai.meta.com"] },
  googleai: { name: "Google 模型官网（Gemini / Gemma）", sites: ["ai.google.dev", "deepmind.google", "ai.google"] },
  learnany: { name: "Learn Anything 学习路径", sites: ["learn-anything.xyz"] },
  cocoloop: { name: "CocoLoop（AI Skills 商店）", sites: ["cocoloop.cn"] },
  tgmeng: { name: "全景世界（热点聚合）", sites: ["tgmeng.com"] },
  youart: { name: "YouArt", sites: ["youart.ai"] },
  fmhy: { name: "FMHY 免费资源索引", sites: ["fmhy.net"] },
  freellm: { name: "Free LLM API resources（免费大模型 API 合集）", sites: ["github.com/cheahjs/free-llm-api-resources"] },
  openmaic: { name: "OpenMAIC（清华开源 AI 互动课堂）", sites: ["github.com/thu-maic/openmaic", "open.maic.chat", "maic.chat"] },
  latentbox: { name: "Latent Box（AI / 创意 / 艺术资源）", sites: ["latentbox.com", "github.com/latentcat/latentbox"] },
  toolify: { name: "Toolify.ai（AI 工具目录）", sites: ["toolify.ai"] },
  taift: { name: "There's An AI For That", sites: ["theresanaiforthat.com"] },
  aibot: { name: "AI工具集 ai-bot.cn", sites: ["ai-bot.cn"] },
  ainav: { name: "AI导航网 ainav.cn", sites: ["ainav.cn"] },
  aihub: { name: "AIHUB aihub.cn", sites: ["aihub.cn"] },
  uisdc: { name: "优设AI导航", sites: ["uisdc.com"] },
  aixzd: { name: "AIXZD（综合工具库）", sites: [], q: "AIXZD" },
  freeaitools: { name: "Free AI Tools Directory（免费 AI 工具导航）", sites: [], q: "Free AI Tools Directory" },
  futurepedia: { name: "Futurepedia（AI 工具目录）", sites: ["futurepedia.io"] },
  aicpb: { name: "AI产品库（ai-bot.cn/aicpb，带评测）", sites: ["ai-bot.cn/aicpb"] },
  pixabay: { name: "Pixabay（免版权图片视频）", sites: ["pixabay.com"] },
  dazi: { name: "打字鸭", sites: [], q: "打字鸭" },
  base: { name: "BASE（欧洲开放学术搜索）", sites: ["base-search.net"] },
  core: { name: "CORE（开放论文聚合）", sites: ["core.ac.uk"] },
  lens: { name: "Lens（专利 + 论文）", sites: ["lens.org"] },
  dimensions: { name: "Dimensions（论文 / 专利 / 基金 / 临床试验）", sites: ["dimensions.ai"] },
  sourcegraph: { name: "Sourcegraph（跨仓库搜代码）", sites: ["sourcegraph.com"] },
  phind: { name: "Phind（程序员 AI 搜索）", sites: ["phind.com"] },
  youtube: { name: "YouTube", sites: ["youtube.com", "youtu.be"] },
  vimeo: { name: "Vimeo", sites: ["vimeo.com"] },
  pinterest: { name: "Pinterest", sites: ["pinterest.com"] },
  unsplash: { name: "Unsplash（免版权图片）", sites: ["unsplash.com"] },
  dongku: { name: "东库网（虚拟产品货源）", sites: [], q: "东库网" },
  jianchuang: { name: "简创库（虚拟产品货源）", sites: [], q: "简创库" },
  qianliao: { name: "千料网（虚拟产品货源）", sites: [], q: "千料网" },
  jiancang: { name: "剪仓库（虚拟产品货源）", sites: [], q: "剪仓库" },
  anbing: { name: "按兵资源网（虚拟产品货源）", sites: [], q: "按兵资源网" },
  niubuluo: { name: "牛部落（聚合搜索入口）", sites: [], q: "牛部落" },
  cankao: { name: "全国图书馆参考咨询联盟", sites: [], q: "全国图书馆参考咨询联盟" },
  guji: { name: "中华古籍资源库（国家图书馆）", sites: ["read.nlc.cn"] },
  nlcopen: { name: "国图公开课（国家图书馆）", sites: ["open.nlc.cn"] },
  nlc: { name: "国家图书馆（线上电子图书馆）", sites: ["nlc.cn"] },
  openstd: { name: "国家标准全文公开系统", sites: ["openstd.samr.org.cn"] },
  xuexi: { name: "学习强国", sites: ["xuexi.cn"] },
  kepu: { name: "科普中国", sites: ["kepuchina.cn", "kepu.gov.cn"] },
  poe: { name: "Poe", sites: ["poe.com"] },
  lovart: { name: "Lovart", sites: ["lovart.ai"] },
  cherry: { name: "Cherry Studio", sites: ["cherry-ai.com", "cherryai.com"] },
  imini: { name: "iMini AI", sites: ["imini.com"] },
  perplexity: { name: "Perplexity", sites: ["perplexity.ai"] },
  opencode: { name: "OpenCode", sites: ["opencode.ai"] },
  worldstats: { name: "国际官方统计（世界银行 / OECD / 美国人口普查局 / 联合国 UN Data）", sites: ["data.worldbank.org", "worldbank.org", "oecd.org", "census.gov", "un.org", "unstats.un.org"] },
};
const C_LABEL = { learnany: "第三方学习导航，非官方数据", cocoloop: "网页搜索 / 第三方资源，非官方数据", tgmeng: "网页搜索 / 第三方资源，非官方数据", youart: "网页搜索 / 第三方资源，非官方数据", fmhy: "网页搜索 / 第三方资源，非官方数据" };
const C_GEN = "网页搜索 / 第三方资源，非官方数据";
for (const k of ["aixzd", "freeaitools", "freellm", "openmaic", "latentbox", "toolify", "taift", "aibot", "ainav", "aihub", "uisdc", "poe", "lovart", "cherry", "imini", "perplexity", "opencode"]) C_LABEL[k] = C_GEN;
C_LABEL.meta = "公开社交帖子，只代表个人说法，不是事实";
// 提醒：回答里涉及这个产品时要带上（系统会把这句交给模型）
for (const k of ["toolify", "taift", "aixzd", "aibot", "ainav", "aihub", "uisdc", "freeaitools", "latentbox"]) C_LABEL[k] = "第三方导航 / 资源合集，非官方数据";
for (const k of ["futurepedia", "aicpb"]) C_LABEL[k] = "第三方导航 / 资源合集，非官方数据";
for (const k of ["pixabay", "dazi", "base", "core", "lens", "dimensions", "sourcegraph", "phind", "youtube", "vimeo", "pinterest", "unsplash", "cankao"]) C_LABEL[k] = C_GEN;
const C_SUPPLY = "货源类要自己再核实版权 / 是否能商用，不直接当货源证据";
for (const k of ["dongku", "jianchuang", "qianliao", "jiancang", "anbing", "niubuluo"]) C_LABEL[k] = "网页搜索，非官方数据（" + C_SUPPLY + "）";
const C_REMIND = {
  dongku: C_SUPPLY, jianchuang: C_SUPPLY, qianliao: C_SUPPLY, jiancang: C_SUPPLY, anbing: C_SUPPLY, niubuluo: C_SUPPLY,
  cankao: "官方域名还没确认，是按名字搜的，要核对链接确实是这个联盟",
  dazi: "官方域名还没确认，是按名字搜的，要核对链接",
  poe: "付费订阅也有点数额度，不是无限量",
  lovart: "价格偏贵；国内需要翻墙才能访问",
  cherry: "对话与知识库存本地、断网可用，但要在设置里自己粘贴各模型的 API Key 才能用",
  imini: "免费额度是每日的，用完要等第二天",
  perplexity: "它直接给答案并附实时信源链接，答案要以它给的信源链接为准，逐条点开核对",
  opencode: "支持接多种模型，自带 DeepSeek 等免费模型免填 Key，但实测部分免费模型可能调不通",
  meta: "社交帖子是个人说法：只能反映大家怎么说，不能当事实；要说明是哪个平台、哪天的帖子",
  worldstats: "引用统计数字要写明发布机构、统计年份和口径",
};
const C_SEARCHLINK = { xiaohongshu: (kw) => "https://www.xiaohongshu.com/search_result?keyword=" + cEu(kw) };   // 小红书内容大多要登录才看得到，搜索引擎收录少：搜不到时给站内搜索入口（并明说这不是搜索结果）
const C_HOME = { learnany: "https://learn-anything.xyz", fmhy: "https://fmhy.net", latentbox: "https://latentbox.com", toolify: "https://www.toolify.ai", taift: "https://theresanaiforthat.com", aibot: "https://ai-bot.cn", ainav: "https://ainav.cn", aihub: "https://aihub.cn", poe: "https://poe.com", lovart: "https://www.lovart.ai", perplexity: "https://www.perplexity.ai", opencode: "https://opencode.ai", freellm: "https://github.com/cheahjs/free-llm-api-resources", openmaic: "https://github.com/THU-MAIC/OpenMAIC" };
   // 站内检索靠网页脚本，搜不到具体页面时给站点入口（并明说这是入口）
const C_OFFICIAL_WEB = ["guji", "nlcopen", "nlc", "openstd", "xuexi", "kepu", "worldstats", "stats", "govcn", "nih", "eugov", "pydoc", "pytorch", "mistral", "metaai", "googleai"];
const cHost = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const cCanon = (u) => { try { const o = new URL(u); return (o.hostname.replace(/^www\./, "") + o.pathname).replace(/\/+$/, ""); } catch { return u; } };
function cUnwrap(href) {
  let h = String(href).replace(/&amp;/g, "&"); if (h.startsWith("//")) h = "https:" + h;
  try {
    const o = new URL(h);
    if (/duckduckgo\.com$/.test(o.hostname) && o.searchParams.get("uddg")) return o.searchParams.get("uddg");
    if (/bing\.com$/.test(o.hostname) && o.pathname.startsWith("/ck/") && o.searchParams.get("u")) { const u = o.searchParams.get("u"); if (/^a1/.test(u)) { try { return atob(u.slice(2).replace(/-/g, "+").replace(/_/g, "/")); } catch {} } }
  } catch {}
  return h;
}
function cParseDDG(html) { const out = []; for (const b of html.split(/<div class="[^"]*\bresult\b[^"]*results_links[^"]*"/).slice(1)) { const a = b.match(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/); if (!a) continue; const s = b.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/); out.push({ url: cUnwrap(a[1]), title: cStrip(a[2], 140), snippet: s ? cStrip(s[1], 140) : "" }); } return out; }
function cParseBing(html) { const out = []; for (const b of html.split(/<li class="b_algo"/).slice(1)) { const a = b.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/); if (!a) continue; const s = b.match(/<p[^>]*>([\s\S]*?)<\/p>/); out.push({ url: cUnwrap(a[1]), title: cStrip(a[2], 140), snippet: s ? cStrip(s[1], 140) : "" }); } return out; }
// 站点可以带路径（github.com/某人/某仓库）：域名对得上，且路径以它开头
function cSiteHit(u, site) {
  const [h, ...ps] = String(site).toLowerCase().split("/"), host = cHost(u);
  if (!(host === h || host.endsWith("." + h))) return false;
  if (!ps.length) return true;
  try { return new URL(u).pathname.toLowerCase().replace(/^\/+/, "").startsWith(ps.join("/")); } catch { return false; }
}
async function cWebSearch(sites, kw) {
  const q = (sites.length > 1 ? "(" + sites.map((s) => "site:" + s).join(" OR ") + ")" : "site:" + sites[0]) + " " + kw, errs = [], pools = [];
  for (const [name, url, parse] of [["DuckDuckGo", `https://html.duckduckgo.com/html/?q=${cEu(q)}&kl=cn-zh`, cParseDDG], ["Bing", `https://www.bing.com/search?q=${cEu(q)}&setlang=zh-cn`, cParseBing], ["Bing 国内站", `https://cn.bing.com/search?q=${cEu(q)}&setlang=zh-cn`, cParseBing]]) {
    try { const { r, t } = await cGet(url, { headers: { Accept: "text/html", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" } }, 9000); if (!r.ok) { errs.push(name + " " + r.status); continue; } const rs = parse(t).filter((x) => x.url && sites.some((s) => cSiteHit(x.url, s))); if (rs.length) { pools.push(...rs); break; } errs.push(name + " 无结果"); } catch (e) { errs.push(name + " " + e.message); }
  }
  const seen = new Set(), items = [];
  for (const x of pools) { const c = cCanon(x.url); if (seen.has(c)) continue; seen.add(c); items.push({ title: x.title, url: x.url, extra: x.snippet ? "摘要：" + x.snippet : "" }); if (items.length >= 5) break; }
  if (!items.length && errs.length && errs.every((e) => /\d{3}$|fetch|timeout|aborted|Timeout/i.test(e))) throw new ConnErr("搜索引擎暂时不可用（" + errs.join("；") + "）", 502);
  return { items, note: items.length ? "" : "搜索引擎没返回这个网站的结果" };
}
// 通用网页搜索（不限网站）：Google 自己的结果页拒绝脚本访问、官方 API 要付费，所以用免费的 DuckDuckGo / Bing 搜，不冒充 Google 的结果
async function cWebAny(kw) {
  const errs = [], skip = /(^|\.)(bing|duckduckgo|microsoft)\.com$/;
  for (const [name, url, parse] of [["DuckDuckGo", `https://html.duckduckgo.com/html/?q=${cEu(kw)}&kl=wt-wt`, cParseDDG], ["Bing", `https://www.bing.com/search?q=${cEu(kw)}`, cParseBing]]) {
    try {
      const { r, t } = await cGet(url, { headers: { Accept: "text/html", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" } }, 9000);
      if (!r.ok) { errs.push(name + " " + r.status); continue; }
      const seen = new Set(), items = [];
      for (const x of parse(t)) { if (!/^https?:\/\//i.test(x.url || "") || skip.test(cHost(x.url))) continue; const c = cCanon(x.url); if (seen.has(c)) continue; seen.add(c); items.push({ title: x.title, url: x.url, src: "网页搜索（" + name + "）", extra: x.snippet ? "摘要：" + x.snippet : "" }); if (items.length >= 6) break; }
      if (items.length) return { items };
      errs.push(name + " 无结果");
    } catch (e) { errs.push(name + " " + e.message); }
  }
  if (errs.every((e) => /\d{3}$|fetch|timeout|aborted|Timeout/i.test(e))) throw new ConnErr("搜索引擎暂时不可用（" + errs.join("；") + "）", 502);
  return { items: [], note: "搜索引擎没返回结果" };
}
const cWebRun = (key) => async (q, env) => {
  if (!C_WEB[key].sites.length) {   // 还没确认官方域名：按名字搜，不限网站，只保留标题或摘要里真带这个名字的结果
    const nm = C_WEB[key].q, kw = cKeywords(q) || cCl(q, 60), r = await cWebAny(`"${nm}" ${kw}`), low = nm.toLowerCase();
    const items = (r.items || []).filter((i) => (i.title + " " + (i.extra || "")).toLowerCase().includes(low));
    return { items, note: items.length ? "官方域名还没确认，是按名字搜的，请核对链接确实是这个站" : "官方域名还没确认，按名字没搜到可靠结果" };
  }
  const kw2 = cKeywords(q).replace(/附近|好吃的|好吃|吃的|上?怎么说|上?怎么样|上有没有|上有什么/g, " ").replace(/\s+/g, " ").trim() || cCl(q, 60), r = await cWebSearch(C_WEB[key].sites, kw2);
  if (!r.items.length && C_SEARCHLINK[key]) return { items: [{ title: C_WEB[key].name + " 站内搜索入口：" + kw2, url: C_SEARCHLINK[key](kw2), extra: "没从搜索引擎查到具体笔记（这类内容大多要登录才能看，搜索引擎收录很少）。这是站内搜索链接，需要你自己打开，可能要登录——它不是搜索结果" }], note: "只有站内搜索入口，没有具体笔记" };
  if (!r.items.length && C_HOME[key]) return { items: [{ title: C_WEB[key].name + " 入口", url: C_HOME[key], extra: "没搜到具体页面，这是站点入口，需要在网页里自己输入主题" }], note: "只有站点入口，没有具体结果" };
  return r;
};


// ---------- v41 免费 API 连接器（都不要 Key；没返回就是没查到，不编）----------
const cDec = (t) => String(t || "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&#x27;/g, "'").replace(/&amp;/g, "&");
const cKw = (q) => (cKeywords(q) || cCl(q, 80)).replace(/\s+/g, " ").trim();
async function cJson(url, hdr = {}, ms = 9000) { const { r, j } = await cGet(url, { headers: hdr }, ms); if (!r.ok || !j) throw new ConnErr("返回 " + r.status, r.status); return j; }
async function cWikidata(q) {
  const kw = cKw(q), l = cIsCJK(kw) ? "zh" : "en", j = await cJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${cEu(kw)}&language=${l}&uselang=${l}&format=json&limit=5&origin=*`);
  return { items: (j.search || []).filter((x) => x.id).map((x) => ({ title: (x.label || x.id) + (x.description ? "（" + x.description + "）" : ""), url: "https://www.wikidata.org/wiki/" + x.id, extra: "实体 ID：" + x.id })) };
}
async function cStackOverflow(q) {
  const j = await cJson(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${cEu(cKw(q))}&site=stackoverflow&pagesize=5`);
  return { items: (j.items || []).filter((x) => x.link).map((x) => ({ title: cDec(x.title), url: x.link, extra: `${x.score} 分｜${x.answer_count} 个回答｜${x.is_answered ? "已有回答" : "暂无采纳"}｜标签：${(x.tags || []).slice(0, 4).join("、")}` })) };
}
async function cGitlab(q) {
  const j = await cJson(`https://gitlab.com/api/v4/projects?search=${cEu(cKw(q))}&order_by=star_count&sort=desc&per_page=5&simple=true`);
  return { items: (Array.isArray(j) ? j : []).filter((x) => x.web_url).map((x) => ({ title: x.name_with_namespace || x.path_with_namespace || x.name, url: x.web_url, extra: `${x.star_count || 0} 星｜${cCl(x.description || "", 120)}` })) };
}
async function cArchive(q) {
  const j = await cJson(`https://archive.org/advancedsearch.php?q=${cEu(cKw(q))}&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=mediatype&fl%5B%5D=year&rows=5&output=json&sort%5B%5D=downloads+desc`);
  return { items: ((j.response && j.response.docs) || []).filter((x) => x.identifier).map((x) => ({ title: cDec(Array.isArray(x.title) ? x.title[0] : x.title || x.identifier), url: "https://archive.org/details/" + x.identifier, extra: `${x.mediatype || ""}${x.year ? "｜" + x.year : ""}` })) };
}
async function cNasa(q) {
  const j = await cJson(`https://api.us.socrata.com/api/catalog/v1?domains=data.nasa.gov&q=${cEu(cKw(q))}&limit=5`);
  return { items: (j.results || []).map((x) => ({ title: (x.resource && x.resource.name) || "", url: x.link || (x.resource && x.resource.id ? "https://data.nasa.gov/d/" + x.resource.id : ""), extra: cCl((x.resource && x.resource.description) || "", 140) })).filter((x) => x.title && x.url) };
}
// Papers With Code 官方站 2025 年起并入 HuggingFace Papers，所以查 HuggingFace 的免费论文接口
async function cHFPapers(q, env, x) {
  const kw = (x && x.qEn) || cKw(q), j = await cJson(`https://huggingface.co/api/papers/search?q=${cEu(kw)}&limit=5`);
  return { items: (Array.isArray(j) ? j : []).map((y) => y.paper || y).filter((p) => p && p.id && p.title).map((p) => ({ title: cDec(p.title), url: "https://huggingface.co/papers/" + p.id, extra: `arXiv:${p.id}${p.publishedAt ? "｜" + String(p.publishedAt).slice(0, 10) : ""}${p.upvotes != null ? "｜" + p.upvotes + " 赞" : ""}` })) };
}
async function cReddit(q) {
  const kw = cKw(q);
  try {
    const { r, j } = await cGet(`https://www.reddit.com/search.json?q=${cEu(kw)}&limit=6&sort=relevance&raw_json=1`, {}, 9000);
    const items = r.ok && j && j.data && Array.isArray(j.data.children) ? j.data.children.map((c) => c.data).filter((d) => d && d.permalink && d.title).map((d) => ({ title: cDec(d.title), url: "https://www.reddit.com" + d.permalink, extra: `r/${d.subreddit}｜${d.score} 赞｜${d.num_comments} 条评论｜${new Date(d.created_utc * 1000).toISOString().slice(0, 10)}` })) : [];
    if (items.length) return { items };
  } catch {}
  const w = await cWebSearch(["reddit.com"], kw);   // Reddit 常拒绝云端 IP：退回网页搜索
  return { items: w.items, note: w.items.length ? "Reddit 接口没通，这是网页搜索的结果" : w.note };
}
// 只给搜索入口链接（付费 API 不接 / 没有免费 API 的）：入口不是结果，会明说
const C_ENG = [
  ["Google", /google\s*search|谷歌搜索|google(?!\s*(scholar|学术|模型|官))|谷歌(?!学术)/i, "https://www.google.com/search?q=", "付费 API 不接，只给网页入口；国内要翻墙"],
  ["Bing", /bing|必应/i, "https://www.bing.com/search?q=", ""],
  ["DuckDuckGo", /duckduckgo|\bddg\b/i, "https://duckduckgo.com/?q=", ""],
  ["Brave Search", /brave\s*(search|搜索)|search\.brave/i, "https://search.brave.com/search?q=", "国内部分要翻墙"],
  ["Ecosia", /ecosia/i, "https://www.ecosia.org/search?q=", ""],
  ["Startpage", /startpage/i, "https://www.startpage.com/do/search?q=", ""],
  ["Qwant", /qwant/i, "https://www.qwant.com/?q=", ""],
  ["Mojeek", /mojeek/i, "https://www.mojeek.com/search?q=", ""],
  ["Yandex", /yandex/i, "https://yandex.com/search/?text=", "俄语内容最全"],
  ["Naver", /naver/i, "https://search.naver.com/search.naver?query=", "韩语内容最全"],
  ["Yahoo Search", /yahoo|雅虎/i, "https://search.yahoo.com/search?p=", "国内部分要翻墙"],
];
const cEntry = (name, tpl, note) => (q) => ({ items: [{ title: name + " 搜索「" + cCl(cKw(q), 60) + "」", url: tpl + cEu(cKw(q)), src: name, extra: "这是搜索入口链接，不是搜索结果" + (note ? "；" + note : "") }], note: "只有搜索入口，没有具体结果" });
async function cEngines(q) {
  const hit = C_ENG.filter((e) => e[1].test(q)); if (!hit.length) return { items: [], note: "没说用哪个搜索引擎" };
  return { items: hit.slice(0, 4).flatMap((e) => cEntry(e[0], e[2], e[3])(q).items), note: "只有搜索入口，没有具体结果（Bing / DuckDuckGo / Google 类的真实结果见“通用网页搜索”）" };
}

// ---------- 注册表 + 路由 ----------
// ===== v73 搜索分级（按 Meta AI 的习惯）：1 官方 → 2 百科 → 3 论文 → 4 新闻 → 5 技术 → 6 真人体验 → 7 数据核对 → 8 小众补充 =====
const TIER_NAME = { 1: "官方", 2: "百科", 3: "论文", 4: "新闻", 5: "技术", 6: "真人体验", 7: "数据核对", 8: "小众补充" };
const CONN_TIER = { news: 4, amap: 1, tencentmap: 1, baidumap: 1, weather: 1, nasa: 1, huggingface: 1, wikipedia: 2, wikidata: 2, arxiv: 3, pubmed: 3, semantic: 3, openalex: 3, crossref: 3, hfpapers: 3, github: 5, gitlab: 5, sourcegraph: 5, stackoverflow: 5, reddit: 6, youtube: 6, vimeo: 6, pinterest: 6, worldstats: 7, archive: 7, marginalia: 8 };
function tHost(u) { try { return new URL(u).hostname.replace(/^www\./, "").toLowerCase(); } catch { return ""; } }
function itemTier(connId, i) {
  if (connId === "news") return 4;   // v86：新闻同一级，才能纯按时间排
  const h = tHost(i.url), url = String(i.url || ""), c = CONNECTORS[connId] || {};
  if (/(^|\.)worldbank\.org$|(^|\.)archive\.org$|(^|\.)data\.gov$|(^|\.)ourworldindata\.org$/.test(h)) return 7;
  if (/(^|\.)gov(\.[a-z]{2})?$|\.gov\.cn$|(^|\.)who\.int$|(^|\.)un\.org$|(^|\.)europa\.eu$|(^|\.)stats\.gov\.cn$|(^|\.)pbc\.gov\.cn$|(^|\.)nih\.gov$|(^|\.)nmc\.cn$/.test(h) && !/pubmed|ncbi/.test(h)) return 1;
  if (/^(docs|developer|developers|help|support|status|learn|platform|api)\./.test(h) || /\/(docs|documentation|pricing|changelog|release-notes|help-center|status)(\/|$)/i.test(url)) return 1;
  if (/wikipedia\.org$|wikidata\.org$|britannica\.com$|baike\.baidu\.com$/.test(h)) return 2;
  if (/(^|\.)(arxiv\.org|semanticscholar\.org|openalex\.org|doi\.org|nature\.com|science\.org|sciencedirect\.com|springer\.com|ieee\.org|acm\.org|biorxiv\.org)$|pubmed|ncbi\.nlm\.nih/.test(h)) return 3;
  if (/(^|\.)(reuters\.com|apnews\.com|bbc\.com|bbc\.co\.uk|bloomberg\.com|nytimes\.com|xinhuanet\.com|news\.cn|people\.com\.cn|thepaper\.cn|caixin\.com)$/.test(h)) return 4;
  if (/developer\.mozilla\.org$|(^|\.)github\.com$|(^|\.)gitlab\.com$|stackoverflow\.com$|stackexchange\.com$|readthedocs\.io$/.test(h)) return 5;
  if (/(^|\.)(reddit\.com|youtube\.com|youtu\.be|instagram\.com|facebook\.com|threads\.net|xiaohongshu\.com|zhihu\.com|bilibili\.com|v2ex\.com|douban\.com|tieba\.baidu\.com)$/.test(h)) return 6;
  if (/news\.ycombinator\.com$|marginalia\.nu$|blogspot\.|medium\.com$|substack\.com$|wordpress\.com$|\.github\.io$|juejin\.cn$|cnblogs\.com$|csdn\.net$/.test(h)) return 8;
  if (CONN_TIER[connId]) return CONN_TIER[connId];
  return c.group === "official" ? 1 : c.group === "authority" ? 3 : 8;
}
// 官方 / 可验证：1 2 3 4 7，以及官方技术文档 / GitHub（第 5 级，社区问答除外）；其余 = 网友说法 / 仅供参考
function itemSide(tier, i) { return [1, 2, 3, 4, 7].includes(tier) || (tier === 5 && !/stackoverflow|stackexchange/.test(tHost(i.url))) ? "verified" : "opinion"; }
const cIsEntry = (i) => /搜索入口/.test(String(i.extra || ""));   // 入口链接：只是个搜索框，没有正文
// 中文问题：先用中文来源搜，搜不到才译成英文再搜
async function cZhEn(q, env, fn) {
  const r = await fn(q, env); if ((r.items && r.items.length) || !cIsCJK(q)) return r;
  let en = ""; try { en = await rivaTranslate(env, cKeywords(q) || q, "en"); } catch {}
  if (!en || !en.trim() || en.trim() === q) return r;
  const r2 = await fn(cCl(en, 160), env);
  return r2.items && r2.items.length ? { ...r2, note: "中文来源没搜到，才改用英文来源（检索词：" + cCl(en, 60) + "）" } : r;
}
const CONN_GROUPS = [
  { id: "authority", title: "权威数据源", note: "论文引用只用这一组和官方组" },
  { id: "official", title: "官方组", note: "模型官网（Meta、Mistral、Google、Python、PyTorch）、政府官网、国家图书馆 / 国家标准 / 学习强国、NASA、世界银行 / UN、地图、天气" },
  { id: "reference", title: "参考组（网页搜索，非官方数据）", note: "只能参考，不能当论文证据" },
];
// v72：Tavily（AI 搜索，TAVILY_KEY）/ Brave Search（BRAVE_KEY）/ Marginalia（免 key）。没配 key 的两个自动跳过，不报错
async function cTavily(q, env) {
  const key = String(env && env.TAVILY_KEY || "").trim(); if (!key) return { items: [], note: "没配置 TAVILY_KEY，已跳过" };
  const r = await fetch("https://api.tavily.com/search", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify({ query: cCl(cKw(q), 300), max_results: 6, search_depth: "basic", include_answer: false }), signal: T(10000) });
  const j = await r.json().catch(() => null); if (!r.ok || !j) throw new ConnErr("Tavily 返回 " + r.status + (j && (j.detail && (j.detail.error || j.detail) || j.error) ? "：" + cCl(String(j.detail && (j.detail.error || j.detail) || j.error), 80) : ""), r.status);
  return { items: (j.results || []).filter((x) => x.url && x.title).map((x) => ({ title: cDec(x.title), url: x.url, extra: cCl(cStrip(x.content || "", 220), 220), src: "Tavily 搜索" })) };
}
async function cBrave(q, env) {
  const key = String(env && env.BRAVE_KEY || "").trim(); if (!key) return { items: [], note: "没配置 BRAVE_KEY，已跳过" };
  const r = await fetch("https://api.search.brave.com/res/v1/web/search?count=6&q=" + cEu(cCl(cKw(q), 300)), { headers: { Accept: "application/json", "X-Subscription-Token": key }, signal: T(10000) });
  const j = await r.json().catch(() => null); if (!r.ok || !j) throw new ConnErr("Brave 返回 " + r.status, r.status);
  return { items: ((j.web && j.web.results) || []).filter((x) => x.url && x.title).map((x) => ({ title: cDec(cStrip(x.title, 160)), url: x.url, extra: cCl(cStrip(x.description || "", 220), 220), src: "Brave Search" })) };
}
async function cExa(q, env) {
  const key = String(env && env.EXA_KEY || "").trim(); if (!key) return { items: [], note: "没配置 EXA_KEY，已跳过" };
  const r = await fetch("https://api.exa.ai/search", { method: "POST", headers: { "Content-Type": "application/json", "x-api-key": key }, body: JSON.stringify({ query: cCl(cKw(q), 300), numResults: 6, contents: { text: { maxCharacters: 400 } } }), signal: T(12000) });
  const j = await r.json().catch(() => null); if (!r.ok || !j) throw new ConnErr("Exa 返回 " + r.status, r.status);
  return { items: (j.results || []).filter((x) => x.url).map((x) => ({ title: cDec(x.title || x.url), url: x.url, extra: cCl(cStrip(x.text || "", 220), 220), src: "Exa 搜索" })) };
}
async function cSerper(q, env) {
  const key = String(env && env.SERPER_KEY || "").trim(); if (!key) return { items: [], note: "没配置 SERPER_KEY，已跳过" };
  const r = await fetch("https://google.serper.dev/search", { method: "POST", headers: { "Content-Type": "application/json", "X-API-KEY": key }, body: JSON.stringify({ q: cCl(cKw(q), 300), num: 6, gl: "cn", hl: "zh-cn" }), signal: T(10000) });
  const j = await r.json().catch(() => null); if (!r.ok || !j) throw new ConnErr("Serper 返回 " + r.status, r.status);
  return { items: (j.organic || []).filter((x) => x.link && x.title).map((x) => ({ title: cDec(x.title), url: x.link, extra: cCl(cStrip(x.snippet || "", 220), 220), src: "Serper（Google 结果）" })) };
}
// 主备顺序：Tavily（每月免费）→ Exa → Serper（一次性额度）→ Brave（付费计划）。前一个没配 key / 出错 / 没结果 / 额度用完，才轮到下一个，不会同时烧多家额度
async function cSearchPool(q, env) {
  const chain = [["Tavily", "TAVILY_KEY", cTavily], ["Exa", "EXA_KEY", cExa], ["Serper", "SERPER_KEY", cSerper], ["Brave", "BRAVE_KEY", cBrave]], notes = [];
  for (const [name, k, fn] of chain) {
    if (!String(env && env[k] || "").trim()) continue;
    try { const r = await cZhEn(q, env, fn); if (r.items && r.items.length) return { items: r.items, note: notes.length ? notes.join("；") + "，所以改用了 " + name : "" }; notes.push(name + " 没有结果"); } catch (e) { notes.push(name + " 出错：" + cCl(String(e && e.message || e), 50)); }
  }
  return { items: [], note: notes.length ? "搜索 API 都没查到：" + notes.join("；") : "没配置任何搜索 API key（TAVILY_KEY / EXA_KEY / SERPER_KEY / BRAVE_KEY），已跳过" };
}
async function cMarginalia(q) {
  const kw = cKw(q), j = await cJson(`https://api.marginalia.nu/public/search/${cEu(cCl(kw, 120))}?count=6`);
  return { items: (j.results || []).filter((x) => x.url && x.title).map((x) => ({ title: cDec(x.title), url: x.url, extra: cCl(cStrip(x.description || "", 200), 200), src: "Marginalia（小众非商业网站）" })), note: (j.results || []).length ? "" : "Marginalia 只收小众、非商业网站，中文关键词常常没有结果" };
}
const CONNECTORS = {
  huggingface: { name: "HuggingFace", group: "authority", env: "HF_TOKEN", run: cHF, academic: true },
  github: { name: "GitHub", group: "authority", env: "GH_PAT", run: cGithub, academic: true },
  arxiv: { name: "arXiv", group: "authority", run: cArxiv, academic: true },
  semantic: { name: "Semantic Scholar", group: "authority", run: cS2, academic: true },
  openalex: { name: "OpenAlex", group: "authority", run: cOpenAlex, academic: true },
  crossref: { name: "Crossref", group: "authority", run: cCrossref, academic: true },
  pubmed: { name: "PubMed", group: "authority", run: cPubMed, academic: true },
  wikipedia: { name: "Wikipedia 维基百科", group: "authority", run: cWiki },
  amap: { name: "高德地图", group: "official", env: "AMAP_KEY", run: cMap },
  tencentmap: { name: "腾讯地图（签名）", group: "official", env: "TENCENT_MAP_KEY", run: cMap },
  baidumap: { name: "百度地图（最后备用）", group: "official", env: "BAIDU_MAP_AK", run: cMap },
  weather: { name: "天气 Open-Meteo", group: "official", run: cWeather },
  hfpapers: { name: "Papers With Code → HuggingFace Papers（论文 + 代码）", group: "authority", run: cHFPapers, academic: true },
  wikidata: { name: "Wikidata 结构化知识库", group: "authority", run: cWikidata },
  gitlab: { name: "GitLab 开源项目", group: "authority", run: cGitlab },
  nasa: { name: "NASA Open Data（免费 API）", group: "official", run: cNasa },
  stackoverflow: { name: "Stack Overflow（免费 API）", group: "reference", label: "社区问答，非官方数据，只能参考", run: cStackOverflow },
  reddit: { name: "Reddit（免费接口，不通时退回网页搜索）", group: "reference", label: "公开社区帖子，只代表个人说法，非官方数据", run: cReddit },
  archive: { name: "Internet Archive archive.org（免费 API）", group: "reference", label: "第三方档案，非官方数据", run: cArchive },
  engines: { name: "世界通用搜索引擎入口（Google / Bing / DuckDuckGo / Brave / Ecosia / Startpage / Qwant / Mojeek / Yandex / Naver / Yahoo）", group: "reference", label: "搜索入口，不是结果", run: cEngines },
  scholar: { name: "Google Scholar 入口（无免费 API）", group: "reference", label: "搜索入口，不是结果", run: cEntry("Google Scholar", "https://scholar.google.com/scholar?q=", "无官方免费 API，只能网页搜；国内要翻墙") },
  wolfram: { name: "WolframAlpha 入口（公式 / 数据 / 计算）", group: "reference", label: "搜索入口，不是结果", run: cEntry("WolframAlpha", "https://www.wolframalpha.com/input?i=", "不是普通网页搜索，要打开链接看计算结果") },
  tavily: { name: "Tavily AI 搜索（免费额度，需 TAVILY_KEY）", group: "reference", web: true, env: "TAVILY_KEY", label: "网页搜索，非官方数据", run: (q, env) => cTavily(q, env) },
  brave: { name: "Brave Search（需 BRAVE_KEY；免费档已取消，付费计划才有额度，排在最后）", group: "reference", web: true, env: "BRAVE_KEY", label: "网页搜索，非官方数据", run: (q, env) => cBrave(q, env) },
  exa: { name: "Exa 搜索（需 EXA_KEY，备用）", group: "reference", web: true, env: "EXA_KEY", label: "网页搜索，非官方数据", run: (q, env) => cExa(q, env) },
  serper: { name: "Serper（Google 结果，需 SERPER_KEY，一次性额度，备用）", group: "reference", web: true, env: "SERPER_KEY", label: "网页搜索，非官方数据", run: (q, env) => cSerper(q, env) },
  news: { name: "今日新闻（Tavily 新闻模式，最近 24 小时，带发布时间，按时间倒序）", group: "reference", web: true, env: "TAVILY_KEY", label: "新闻，带发布时间", run: (q, env) => cNews(q, env) },
  searchpool: { name: "搜索 API 主备（Tavily → Exa → Serper → Brave）", group: "reference", web: true, label: "网页搜索，非官方数据", run: (q, env) => cSearchPool(q, env) },
  marginalia: { name: "Marginalia 小众网站搜索（免费，免 key）", group: "reference", web: true, label: "小众网站，非官方数据", run: (q, env) => cZhEn(q, env, (qq) => cMarginalia(qq)) },
  websearch: { name: "通用网页搜索（Google 类；实际用 DuckDuckGo / Bing）", group: "reference", web: true, run: (q, env) => cZhEn(q, env, (qq) => cWebAny(cKeywords(qq) || cCl(qq, 80))) },
  ...Object.fromEntries(Object.entries(C_WEB).map(([k, v]) => [k, { name: v.name, group: k === "britannica" ? "authority" : C_OFFICIAL_WEB.includes(k) ? "official" : "reference", web: true, label: C_LABEL[k] || "", ...(C_REMIND[k] ? { remind: C_REMIND[k] } : {}), run: cWebRun(k) }])),
};
function routeConnectors(t, env) {
  const s = String(t || ""), ids = [], add = (...a) => a.forEach((i) => { if (!ids.includes(i)) ids.push(i); });
  const mapQuestion = /农家乐|餐馆|饭店|餐厅|民宿|景点|公交站|地铁站|医院|加油站|充电桩|充电站|停车场|停车位|银行|ATM|取款机/.test(s) && /有哪些|哪里有|推荐|附近|周边|周围|有什么/.test(s) && /北京|上海|天津|重庆|香港|澳门|[一-鿿]{2,3}市|[一-鿿]{2,4}(?:区|县)/.test(s);
  const route = /首班|末班|首末班|最早一班|最晚一班|公交路线|坐公交|在哪|地址|怎么走|多远|距离|附近|周边|周围|路线|导航|公共自行车|充电桩|充电站|停车场|停车位|银行|ATM|取款机|百度地图|高德地图|腾讯地图/.test(s) || mapQuestion || /军民农家乐/.test(s), weather = /天气|气温|冷不冷|热不热|下雨|下雪|降雨|带伞|weather/i.test(s);
  if (cDoi(s) || /\bDOI\b/i.test(s)) add("crossref");
  if (/huggingface|hugging\s*face|\bHF\b|许可证|licen[sc]e|开源协议|下载量|能不能商用|可以商用/i.test(s)) add("huggingface");
  if (/github|仓库|\brepo\b|代码库|开源项目|源码/i.test(s)) add("github");
  if (/arxiv|论文|\bpapers?\b|文献|preprint|综述|引用量|被引/i.test(s)) add("arxiv", "semantic", "openalex");
  if (/semantic\s*scholar/i.test(s)) add("semantic"); if (/openalex/i.test(s)) add("openalex"); if (/crossref/i.test(s)) add("crossref");
  if (/pubmed|医学文献|临床|症状|药物|疗法|治疗|疾病|诊断/i.test(s) && !(/百度|地图|接口|\bapi\b|worker|自检/i.test(s) && !/pubmed|医学|临床|疾病/i.test(s))) add("pubmed");   // v51：“百度地图诊断”里的“诊断”不是医学诊断
  if (weather) add("weather"); if (route && !/学习(路线|路径)|入门路线|自学路线|ai.{0,3}(工具|网站)|工具导航|ai\s*导航|货源|虚拟(产品|资源)/i.test(s) && !(weather && !/附近|周边|周围|在哪|地址|怎么走|多远|距离|路线/.test(s))) add("amap");
  if (/打车|滴滴|出租车|网约车/.test(s)) { add("didi"); if (/从.+(到|去)/.test(s)) add("baidumap"); }
  if (/拼车|滴答|顺风车/.test(s)) add("didapinche");
  if (/美团|好吃|美食|餐厅|饭店|外卖|吃什么|吃的/.test(s)) add("meituan");
  if (/京东/.test(s) || (!/lovart|poe|cherry|imini|perplexity|opencode|toolify|ai\s*工具/i.test(s) && !/打车|滴滴|出租车|网约车|拼车|滴答|顺风车/.test(s) && /商品|多少钱|价格|售价|哪里买|怎么买/.test(s))) add("jd");
  if (/知乎|zhihu/i.test(s)) add("zhihu"); if (/csdn/i.test(s)) add("csdn"); if (/站酷|zcool/i.test(s)) add("zcool");
  if (/经验|教程|攻略|入门|怎么学|学习路线/.test(s)) add("zhihu", "csdn");
  if (/设计|海报|\blogo\b|插画|作品集|配色/i.test(s)) add("zcool");
  if (/小红书|xiaohongshu|种草/i.test(s)) add("xiaohongshu"); if (/抖音|douyin|短视频/i.test(s)) add("douyin");
  if (/facebook|instagram|threads|脸书|(?<![\w/-])meta(?![\w/-])/i.test(s)) add("meta");
  if (/python/i.test(s) && /官网|官方|版本|许可证|licen[sc]e|文档|下载/i.test(s)) add("pydoc");
  if (/pytorch/i.test(s) && /官网|官方|版本|许可证|licen[sc]e|文档|安装/i.test(s)) add("pytorch");
  if (/mistral/i.test(s) && /官网|官方|版本|许可证|licen[sc]e|商用|文档|模型/i.test(s)) add("mistral");
  if (/llama|meta\s*ai|meta.{0,6}(官网|官方)/i.test(s) && /官网|官方|版本|许可证|licen[sc]e|商用|文档/i.test(s)) add("metaai");
  if (/gemini|gemma|google.{0,12}(模型|官网|官方)/i.test(s) && /官网|官方|版本|许可证|licen[sc]e|商用|文档|模型/i.test(s)) add("googleai");
  if (/中国政府网|国务院|政府工作报告|政策文件|法规|条例|发改委/.test(s)) add("govcn");
  if (/\bNIH\b|美国国立卫生|国立卫生研究院/i.test(s)) add("nih");
  if (/欧盟|european union|\bEU\b\s*(官网|政策|法规)/i.test(s)) add("eugov");
  if (/google|谷歌|网上(搜|查)|网页搜索|全网|上网(搜|查)/i.test(s) && !/google.{0,12}(模型|官网|官方)/i.test(s)) add("websearch");
  if (/learn.?anything|学习路线|学习路径|学习地图|怎么学|如何学|入门路线|想学|自学/i.test(s)) add("learnany");
  if (/cocoloop|ai\s*skills?\b|skills?\s*商店|技能商店/i.test(s)) add("cocoloop");
  if (/全景世界|tgmeng|热榜|热搜|trending/i.test(s) && !/新闻|今日热点|热点新闻/.test(s)) add("tgmeng");
  if (/youart|一句话.{0,4}视频|文字生成视频|文生视频|ai\s*视频/i.test(s)) add("youart");
  if (/fmhy|免费资源|资源导航|免费.{0,6}(网站|工具|软件|电影|资源|书|课程)/i.test(s)) add("fmhy");
  if (/free.?llm|免费.{0,6}(api|大模型|模型|额度)|api.{0,4}(免费|白嫖)|白嫖.{0,4}(api|模型)/i.test(s)) add("freellm");
  if (/openmaic|互动课堂|ai\s*课堂|清华.{0,6}(课堂|教学)/i.test(s)) add("openmaic");
  if (/latent\s*box|latentbox|创意资源|艺术资源|ai\s*艺术|灵感资源/i.test(s)) add("latentbox");
  if (/aixzd/i.test(s)) add("aixzd"); if (/free\s*ai\s*tools?\s*directory|免费.{0,4}ai\s*工具/i.test(s)) add("freeaitools");
  if (/toolify/i.test(s)) add("toolify"); if (/there'?s\s*an\s*ai|theresanaiforthat|taift/i.test(s)) add("taift");
  if (/ai-?bot|ai工具集/i.test(s)) add("aibot"); if (/ainav|ai导航网/i.test(s)) add("ainav"); if (/aihub/i.test(s)) add("aihub"); if (/优设/.test(s)) add("uisdc");
  if (/ai.{0,3}(工具|导航|网站).{0,6}(推荐|目录|大全|合集|有哪些|哪个好)|(找|有什么|有哪些|推荐).{0,4}ai\s*工具|ai\s*工具(导航|目录|大全|合集)/i.test(s)) add("toolify", "aibot", "ainav");
  if (/(?<![\w-])poe(?![\w-])/i.test(s) && /poe\.com|聚合|点数|订阅|模型|切换|\bai\b/i.test(s)) add("poe");
  if (/lovart|多模态创作|商用物料/i.test(s)) add("lovart");
  if (/cherry\s*studio|cherry-?ai/i.test(s)) add("cherry");
  if (/imini/i.test(s)) add("imini");
  if (/perplexity|ai\s*搜索/i.test(s)) add("perplexity");
  if (/opencode|终端编程助手|终端.{0,4}(编程|写代码)/i.test(s)) add("opencode");
  // v40 公开社交：Instagram / Facebook / X / Threads 的公开帖子，找大家真实在说什么、怎么评价、新趋势
  if (/(?<![\w])(x|twitter)\.com|推特|(?<![\w/-])twitter(?![\w/-])|(?<![A-Za-z])X\s*(上|平台|帖子|推文)|推文|公开帖子|社交(媒体|平台|内容)/i.test(s)) add("meta");
  if (/大家(都)?(怎么|在)?(说|评价|看|讨论)|真实(评价|反馈|口碑|声音)|网友|口碑|舆情|吐槽|新趋势|最新趋势|热议|种草|避雷/.test(s)) add("meta");
  // v40 公开网页：只要是公开能打开的网页都能搜，不用提前加进清单（新闻 / 官网 / 博客 / 教程 / 文档 / 百科）
  if (/新闻|报道|快讯|头条|要闻|时事|突发|今日热点|热点新闻/.test(s)) add("news");   // v86：问新闻只走 Tavily 新闻模式，不再走普通搜索
  if (/台风|热带风暴|热带气旋|天气预警|气象预警|暴雨预警|寒潮预警/.test(s)) add("websearch");   // v86：台风预警先不专门接，用搜索 + 来源（中央气象台 nmc.cn 记为官方）
  if (/最新(消息|动态|进展|版本)|官网|官方网站|博客|blog|教程|tutorial|文档站|documentation|百科|评测|测评|排行榜|榜单|发布会/i.test(s)) add("websearch");
  // v40 学术 / 官方数据：论文库、DOI、官方统计、官方文档
  if (/官方文档|开发文档|API\s*文档|官方指南|白皮书|技术报告/i.test(s)) add("websearch");
  if (/官方统计|统计数据|世界银行|world\s*bank|oecd|联合国|人口数据|经济数据|人均\s*gdp|census/i.test(s)) add("worldstats");
  if (/论文库|学术(搜索|数据库)|期刊|会议论文|openreview|zenodo|figshare|dblp|acl\s*anthology|ssrn/i.test(s)) add("arxiv", "semantic", "openalex");
  if (/知网|cnki|中国知网|学位论文|硕博|核心期刊/i.test(s)) add("cnki");
  if (/britannica|大英百科/i.test(s)) add("britannica");
  if (/国家统计局|统计年鉴|统计公报|gdp|人口普查|cpi\b/i.test(s)) add("stats");
  if (/维基|wikipedia|百科|是谁|什么是|是什么|定义|概念|起源/i.test(s) && s.length <= 80) add("wikipedia");
  // v41 世界通用搜索 / 学术 / 代码 / 百科 / 视频社交 / 政府数据 / 国家级资源 / 货源
  if (C_ENG.some((e) => e[1].test(s))) { add("engines"); if (/bing|必应|duckduckgo|\bddg\b|google|谷歌/i.test(s)) add("websearch"); }
  if (/google\s*scholar|谷歌学术/i.test(s)) add("scholar");
  if (/papers?\s*with\s*code|paperswithcode|论文.{0,4}代码|榜单分数|任务分数|sota/i.test(s)) add("hfpapers");
  if (/base-search|base\s*(search|搜索)|欧洲.{0,4}开放学术/i.test(s)) add("base");
  if (/core\.ac\.uk|core\s*(开放|论文|open)/i.test(s)) add("core");
  if (/lens\.org|专利/i.test(s)) add("lens");
  if (/dimensions\.ai|(?<![\w-])dimensions(?![\w-])/i.test(s)) add("dimensions");
  if (/sourcegraph|跨仓库/i.test(s)) add("sourcegraph"); if (/gitlab/i.test(s)) add("gitlab");
  if (/stack\s*overflow|stackoverflow|报错|traceback|exception|报错信息/i.test(s)) add("stackoverflow");
  if (/phind/i.test(s)) add("phind");
  if (/wikidata|实体关系|知识图谱/i.test(s)) add("wikidata");
  if (/wolfram|解方程|求解|积分|导数/i.test(s)) add("wolfram");
  if (/youtube|油管/i.test(s)) add("youtube"); if (/vimeo/i.test(s)) add("vimeo"); if (/pinterest|灵感图|穿搭|家装/i.test(s)) add("pinterest");
  if (/pixabay|免版权|免费图片|图片素材/i.test(s)) add("pixabay"); if (/unsplash/i.test(s)) add("unsplash");
  if (/reddit|避坑|测评|评测/i.test(s)) add("reddit");
  if (/archive\.org|互联网档案|数字档案|旧版网页|wayback/i.test(s)) add("archive");
  if (/nasa|航天|太空|火星/i.test(s)) add("nasa");
  if (/un\s*data|联合国数据|世界银行|world\s*bank/i.test(s)) add("worldstats");
  if (/futurepedia/i.test(s)) add("futurepedia"); if (/ai产品库|aicpb/i.test(s)) add("aicpb");
  if (/古籍/.test(s)) add("guji"); if (/国图公开课/.test(s)) add("nlcopen"); if (/国家图书馆|国图|线上图书馆|电子图书馆/.test(s)) add("nlc");
  if (/国家标准|国标|\bGB\/?T\b/i.test(s)) add("openstd"); if (/学习强国/.test(s)) add("xuexi"); if (/科普中国/.test(s)) add("kepu"); if (/参考咨询/.test(s)) add("cankao");
  if (/打字鸭|练打字|学拼音/.test(s)) add("dazi");
  if (/东库/.test(s)) add("dongku"); if (/简创库/.test(s)) add("jianchuang"); if (/千料/.test(s)) add("qianliao"); if (/剪仓库/.test(s)) add("jiancang"); if (/按兵/.test(s)) add("anbing"); if (/牛部落/.test(s)) add("niubuluo");
  if (/虚拟产品货源|虚拟资源|虚拟货源|货源/.test(s)) add("dongku", "jianchuang", "qianliao");
  if (ids.includes("websearch")) { const hk = (k) => env && String(env[k] || "").trim(); if (["TAVILY_KEY", "EXA_KEY", "SERPER_KEY", "BRAVE_KEY"].some(hk)) add("searchpool"); add("marginalia"); }
  if (/marginalia|小众网站|独立博客|个人博客/i.test(s)) add("marginalia"); if (/tavily/i.test(s)) add("tavily"); if (/\bexa\b/i.test(s) && /搜索|search|api/i.test(s)) add("exa"); if (/serper/i.test(s)) add("serper"); if (/brave\s*(search|搜索)?(\s*api)?/i.test(s) && /api|接口|搜索结果/i.test(s)) add("brave");
  return ids.slice(0, 8);
}
const cGroupName = (g) => (CONN_GROUPS.find((x) => x.id === g) || {}).title || g;
async function runConnectors(ids, text, env) {
  const x = { qEn: text };
  if (cIsCJK(text) && ids.some((i) => CONNECTORS[i] && CONNECTORS[i].academic) && !cDoi(text)) { try { const en = await rivaTranslate(env, cKeywords(text), "en"); if (en && en.trim()) x.qEn = cCl(en, 160); } catch {} }
  const out = await Promise.all(ids.filter((i) => CONNECTORS[i]).map(async (id) => {
    const c = CONNECTORS[id], base = { id, name: c.name, group: c.group, web: !!c.web, label: c.label || "", items: [], note: "", error: "" };
    try {
      const r = await Promise.race([c.run(text, env, x), new Promise((_, no) => setTimeout(() => no(new ConnErr("超时（12 秒没返回）", 504)), 12000))]);
      base.items = (r.items || []).filter((i) => i && i.title && /^https?:\/\//i.test(String(i.url || ""))).map((i) => ({ ...i, title: cCl(i.title, 200) }));   // 没有链接 = 没查到
      base.note = r.note || "";
    } catch (e) { base.error = String(e && e.message || e).slice(0, 200); }
    return base;
  }));
  for (const r of out) { r.items = r.items.map((i) => { const t = itemTier(r.id, i); return { ...i, tier: t, side: itemSide(t, i) }; }); }
  const real = out.some((r) => r.items.some((i) => !cIsEntry(i)));
  const kept = real ? out.map((r) => ({ ...r, items: r.items.filter((i) => !cIsEntry(i)) })).filter((r) => r.items.length || !r.items.length && !(["engines", "scholar", "wolfram"].includes(r.id))) : out;   // 有真结果就不再给“搜索入口”
  return { results: kept, translated: x.qEn !== text ? x.qEn : "" };
}
const tierSort = (a, b) => a.i.tier - b.i.tier || ((a.i.ts && b.i.ts) ? b.i.ts - a.i.ts : 0) || (cIsCJK(a.i.title) ? 0 : 1) - (cIsCJK(b.i.title) ? 0 : 1) || a.k - b.k;   // 官方永远最前；同级中文来源在前
function connSystem(res) {
  const L = ["【连接器查到的真实资料（系统刚刚真实调用接口得到，不是你的记忆）。已按来源级别分成两栏：官方 / 可验证、网友说法 / 仅供参考；每条都标了第几级】"]; let n = 0;
  const all = []; let k = 0; res.results.forEach((r) => r.items.slice(0, 5).forEach((i) => all.push({ r, i, k: k++ })));
  const sec = (title, side) => {
    const list = all.filter((x) => x.i.side === side).sort(tierSort); L.push(`\n## ${title}`);
    if (!list.length) { L.push("（这一栏这次没有查到）"); return; }
    list.forEach(({ r, i }) => L.push(`[${++n}] 【第${i.tier}级·${TIER_NAME[i.tier]}】${i.title}\n    来源：${i.src || i.mapSource || r.name}${i.extra ? "\n    " + i.extra : ""}${i.mapDetail ? `\n    位置：[📍 在高德地图打开](${i.url})` : `\n    链接：${i.url}`}${i.doi ? "\n    DOI：" + i.doi : ""}`));
  };
  sec("一、官方 / 可验证（官方为准，错了以这里为准）", "verified");
  sec("二、网友说法 / 仅供参考（只能当线索，不能当事实）", "opinion");
  const hasV = all.some((x) => x.i.side === "verified"), hasO = all.some((x) => x.i.side === "opinion");
  L.push("");
  for (const r of res.results) {
    if (r.note && r.items.length) L.push(`说明（${r.name}）：${r.note}`);
    if (C_REMIND[r.id] && r.items.length) L.push(`提醒（回答里要带上，${r.name}）：${C_REMIND[r.id]}`);
    if (!r.items.length) { L.push(`没查到：${r.name}（${r.error || r.note || "没有结果"}）`); if (r.note === "你要查哪个城市的军民农家乐？") L.push("回答限制：只能原样回复“你要查哪个城市的军民农家乐？”，不要编造城市、店铺或地址。"); }
  }
  if (res.translated) L.push(`（检索词已译成英文去查：${res.translated}）`);
  L.push("回答规则：1) 涉及上面这些事实的部分，只能依据上面的内容，不要凭记忆补充或编造；2) 地图连接器只要返回了站点或 POI，就必须直接使用这些实测结果回答，不能改写成“资料缺失”“无法查询”或建议用户自己再搜；3) 引用时写明出处名称、第几级和链接；4) 没查到才直接说没查到，不要编；5) 回答也要分两栏：先写“官方 / 可验证”，再写“网友说法 / 仅供参考”，不能混在一起，官方永远排最前，博客和网友说法永远排最后；6) 如果官方和网友说法冲突，以官方为准，并写一句“官方说法和网友说法不一致”" + (hasV && hasO ? "（这次两栏都有内容，请对照一下有没有冲突）" : "") + "；7) 只给能直接点开看正文的链接，不要给搜索入口；8) 论文引用只用第 3 级和官方的链接；没有 DOI 的论文不要写 DOI，更不要编 DOI；9) 中文问题优先用中文来源，中文来源没有才用英文来源，并说明；10) 回答末尾的“来源”由系统自动附上，你不用再写来源列表。");
  return L.join("\n");
}
function connFooter(res, query = "") {
  const V = [], O = [], miss = [], verb = [], maps = []; let k = 0;
  for (const r of res.results) {
    const tag = r.label ? "（" + r.label + "）" : "";
    if (!r.items.length) { miss.push(`未查到：${r.name}${tag}（${r.error || r.note || "没有结果"}；没有链接就是没查到）`); continue; }
    if (r.id === "weather" && r.items.length >= 2) { const g = r.items[1], via = /百度地图/.test(g.src || "") ? "百度地图" : "Open-Meteo 地理编码"; V.push({ i: { tier: 1 }, k: k++, line: `来源：Open-Meteo${r.items[0].aqi ? "（天气 + 空气质量）" : ""} + ${via}（第1级·官方）- ${r.items[0].url}` }); continue; }
    for (const i of r.items.slice(0, 3)) {
      const lv = `（第${i.tier}级·${TIER_NAME[i.tier]}）`, line = i.mapDetail ? `来源：${i.src || i.mapSource || r.name}${lv} - [📍 在高德地图打开](${i.url})（接口时间 ${new Date(i.mapAt || Date.now()).toISOString()}）` : `来源：${i.src || i.mapSource || r.name}${lv}${tag} - ${i.url}${i.doi ? "（DOI " + i.doi + "）" : ""}`;
      (i.side === "verified" ? V : O).push({ i, k: k++, line });
      if (i.verbatim && i.extra) verb.push("```\n" + i.extra + "\n```"); if (i.mapDetail) maps.push({ title: i.title, url: i.url, source: i.mapSource || r.name, at: i.mapAt || Date.now(), ...i.mapDetail });
    }
  }
  V.sort(tierSort); O.sort(tierSort);
  const ms = (V.length || O.length) ? miss.map((m) => m.replace(/^未查到：/, "这次没查到：").replace("；没有链接就是没查到）", "）")) : miss;
  const marker = maps.length ? "\n\n<!--MAP_DETAIL:" + JSON.stringify({ query, items: maps.slice(0, 10) }).replace(/-->/g, "") + "-->" : "";
  const body = [V.length ? "**官方 / 可验证**\n" + V.map((x) => x.line).join("\n") : "", O.length ? "**网友说法 / 仅供参考**\n" + O.map((x) => x.line).join("\n") : "", ms.join("\n")].filter(Boolean).join("\n\n");
  return body ? "\n\n" + body + (verb.length ? "\n\n自检原文：\n" + verb.join("\n") : "") + marker : "";
}

// ---------- v37 个人知识库 kb:{用户}（论文 / 链接 / 草稿 / 笔记）+ 反馈 fb:{用户}（对 / 错）----------
const KB_MAX_ITEMS = 600, KB_TXT = 30000, KB_BYTES = 4 * 1024 * 1024, FB_MAX = 300;
const KB_TYPES = { paper: "论文", link: "链接", draft: "草稿", note: "笔记" };
const kbId = () => "kb" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
async function kbLoad(env, user) { try { const v = await env.KV.get("kb:" + user, "json"); return Array.isArray(v) ? v : []; } catch { return []; } }
async function kbPut(env, user, arr, autoTrim) {
  const a = arr, dropLink = () => { const i = a.findIndex((x) => x.type === "link"); a.splice(i >= 0 ? i : 0, 1); return i >= 0; };
  while (a.length > KB_MAX_ITEMS) dropLink();                       // 超出条数：先丢最旧的链接
  let s = JSON.stringify(a);
  while (s.length > KB_BYTES && autoTrim && dropLink()) s = JSON.stringify(a);   // 自动存的链接占满了：丢最旧的链接；手动存的资料不会被丢
  if (s.length > KB_BYTES) return false;
  await env.KV.put("kb:" + user, s); return true;
}
async function kbAdd(env, user, news, auto) {
  const a = await kbLoad(env, user); let added = 0;
  for (const n of news) {
    const url = /^https?:\/\//i.test(String(n.url || "")) ? String(n.url).slice(0, 500) : "";
    const type = KB_TYPES[n.type] ? n.type : "note", title = cCl(n.title || url || "未命名", 200), text = String(n.text || "").slice(0, KB_TXT);
    const dup = a.find((x) => x.type === type && (url ? x.url === url : (x.title === title && x.text === text)));
    if (dup) { if (!auto) dup.at = Date.now(); continue; }
    a.push({ id: kbId(), type, title, url, text, src: cCl(n.src || "", 60), group: n.group || "", at: Date.now() }); added++;
  }
  return { ok: await kbPut(env, user, a, auto), added };
}
function kbTokens(q) {
  const s = String(q || "").toLowerCase(), out = new Set();
  for (const w of s.match(/[a-z0-9][a-z0-9.\-_]+/g) || []) out.add(w);
  for (const seg of s.match(/[一-鿿]+/g) || []) for (const pc of seg.split(/[的是吗了在和有不吧呢啊么什怎这那我你他它也都就与及或对为以而但并被把让给从到个]/)) { if (pc.length === 2) out.add(pc); else if (pc.length > 2) for (let i = 0; i < pc.length - 1; i++) out.add(pc.slice(i, i + 2)); }   // v54：按“的/是/吗…”切开，单个字不算，免得拿“的”去配所有资料
  return [...out].slice(0, 40);
}
function kbSearch(items, q, limit = 3) {
  const toks = kbTokens(q); if (!toks.length) return [];
  return items.map((it) => { const t = String(it.title || "").toLowerCase(), x = (String(it.text || "") + " " + String(it.url || "")).toLowerCase(); let sc = 0; for (const k of toks) sc += t.includes(k) ? 3 : x.includes(k) ? 1 : 0; return { it, sc }; })
    .filter((o) => o.sc >= 3).sort((a, b) => b.sc - a.sc || (b.it.at || 0) - (a.it.at || 0)).slice(0, limit)
    .map((o) => { const x = String(o.it.text || ""), lo = x.toLowerCase(); let at = -1; for (const k of toks) { const p = lo.indexOf(k); if (p >= 0 && (at < 0 || p < at)) at = p; } const st = Math.max(0, (at < 0 ? 0 : at) - 60); return { ...o.it, snippet: cCl(x.slice(st, st + 320), 320) }; });
}
function kbSystem(hits) {
  const L = ["【我的资料里找到的内容（用户自己保存的论文/链接/草稿，先依据这些，再参考网上查到的）】"];
  hits.forEach((h, i) => L.push(`[我${i + 1}] 《${h.title}》（${KB_TYPES[h.type] || "资料"}${h.group === "reference" ? "；网页内容，只能参考，不能当论文证据" : ""}）${h.url ? "\n    链接：" + h.url : ""}\n    片段：${h.snippet || "（无正文）"}`));
  L.push("回答规则：1) 先依据“我的资料”回答；2) 引用时写“我的资料《标题》”，有链接就带上链接；3) 资料里没有的部分才用网上查到的内容，并说明是网上查的；4) 不要把我的资料说成网上查到的，也不要编造资料里没有的内容。");
  return L.join("\n");
}
const kbFooter = (hits) => hits.map((h) => `来源：我的资料《${h.title}》${h.url ? " - " + h.url : "（你自己保存的，无外链）"}${h.group === "reference" ? "（网页内容，只能参考，不能当论文证据）" : ""}`).join("\n");
async function fbLoad(env, user) { try { const v = await env.KV.get("fb:" + user, "json"); return Array.isArray(v) ? v : []; } catch { return []; } }
function fbSystem(items, q) {
  const bad = items.filter((x) => x.verdict === "bad"); if (!bad.length) return "";
  const toks = kbTokens(q);
  const rel = bad.map((x) => ({ x, s: toks.filter((k) => (String(x.q || "") + " " + String(x.note || "")).toLowerCase().includes(k)).length })).filter((o) => o.s >= 2).sort((a, b) => b.s - a.s || (b.x.at || 0) - (a.x.at || 0)).slice(0, 3).map((o) => o.x);
  const gen = bad.filter((x) => x.note && !rel.includes(x)).slice(-2);
  if (!rel.length && !gen.length) return "";
  const L = ["【用户以前把这些回答标记为“错”，这次不要再这样回答】"];
  rel.forEach((x, i) => L.push(`${i + 1}. 当时的问题：${cCl(x.q, 120)}\n   被标错的回答（摘要）：${cCl(x.a, 200)}${x.note ? "\n   用户说错在：" + cCl(x.note, 160) : ""}`));
  gen.forEach((x) => L.push(`- 用户之前指出过的错误（通用提醒）：${cCl(x.note, 160)}`));
  L.push("要求：避开上面的错误做法；拿不准的地方直接说不确定，不要编。");
  return L.join("\n");
}

// Kaggle：流式转发。首字节最多等 100 秒（模型冷启动），之后 60 秒没新内容就算断
async function kaggleStream(agg, msgs, emit) {
  const ac = new AbortController();
  let timer, got = false;
  const arm = (ms) => { clearTimeout(timer); timer = setTimeout(() => ac.abort(), ms); };
  try {
    arm(100000);
    const r = await fetch(agg + "/v1/chat/completions", {
      method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0", Accept: "*/*" },
      body: JSON.stringify({ model: "openmanus-qwen", messages: msgs, stream: true })
    });
    if (!r.ok) return { got, err: "Kaggle返回 " + r.status };
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (d === "[DONE]") continue;
        let t = "";
        try { t = JSON.parse(d).choices?.[0]?.delta?.content || ""; } catch {}
        if (t) { got = true; arm(60000); await emit(t); }
      }
    }
    return { got, err: got ? "" : "Kaggle空回复" };
  } catch (e) {
    return { got, err: e.name === "AbortError" ? "Kaggle响应超时" : e.message };
  } finally { clearTimeout(timer); }
}

async function probe(label, fn) { try { return await fn(); } catch (e) { return { error: label + ": " + String(e) }; } }
// v33 /debug 探针：旧版 max_tokens 只给 32，推理型模型把额度全花在“思考”上，正文是空的，会被误判成坏了。
// 现在给 512，并多返回：是否有思考内容(reasoning_chars)、耗时(ms)、正文为空时的原始返回片段(raw)，能分清“模型坏了”和“只是思考太长”。
async function chatProbe(url, key, model, extraHeaders = {}) {
  const t0 = Date.now();
  const r = await chatOpenAI(url, key, { model, messages: [{ role: "user", content: "请只回复两个字：在线" }], max_tokens: 512 }, extraHeaders, 30000);
  const txt = await r.text().catch(() => ""); let j = {}; try { j = JSON.parse(txt); } catch {}
  const msg = j.choices?.[0]?.message || {}, reply = String(msg.content || "").trim(), think = String(msg.reasoning || msg.reasoning_content || "");
  const o = { hasKey: true, model, status: r.status, ms: Date.now() - t0, reply: reply.slice(0, 80), finish: j.choices?.[0]?.finish_reason, ctokens: j.usage?.completion_tokens, reasoning_chars: think.length, error: j.error?.message || (typeof j.error === "string" ? j.error : undefined) };
  o.verdict = !r.ok ? "接口报错" : reply ? "正常" : think ? "只有思考没有正文（模型能用，但会慢/易空回复）" : "正文为空（可能被过滤或模型异常）";
  if (!reply) o.raw = txt.slice(0, 300);
  return o;
}

// ---- 定时任务执行器（需要在 Cloudflare 给 Worker 配 Cron Trigger，例如 */5 * * * *）----
const pad2 = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(t)); return m ? m[1].padStart(2, "0") + ":" + m[2] : ""; };
function validTz(tz) { try { new Intl.DateTimeFormat("en", { timeZone: String(tz || "Asia/Shanghai") }); return String(tz || "Asia/Shanghai"); } catch { return "Asia/Shanghai"; } }
function nowIn(tz, offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(Date.now() + offsetDays * 86400000));
  const g = (t) => parts.find((p) => p.type === t).value;
  return { day: g("year") + "-" + g("month") + "-" + g("day"), hm: g("hour") + ":" + g("minute") };
}
const dayIn = (tz, n) => nowIn(tz, n).day;
// v81：重复方式 once(一次，可指定日期) / daily(每天) / weekdays(工作日) / weekly(每周几)
const REPEATS = ["once", "daily", "weekdays", "weekly"];
const dowOf = (day) => new Date(day + "T00:00:00Z").getUTCDay();   // 0=周日
function dayMatches(t, day) {
  const r = t.repeat, w = dowOf(day);
  if (r === "weekdays") return w >= 1 && w <= 5;
  if (r === "weekly") return w === (Number.isInteger(t.weekday) ? t.weekday : 1);
  if (r === "once" && /^\d{4}-\d{2}-\d{2}$/.test(t.date || "")) return day >= t.date;   // 指定日期：到日子（错过也补跑一次）
  return true;
}
function taskIsDue(t, n) {
  const tm = pad2(t.time); if (!t.enabled || !tm || t.last_run_day === n.day || !dayMatches(t, n.day)) return false;
  if (t.repeat === "once" && /^\d{4}-\d{2}-\d{2}$/.test(t.date || "") && n.day > t.date) return true;
  return n.hm >= tm;
}
// 下一次执行时间（给前端显示）；once 已跑过则返回空
function nextRunOf(t) {
  const tz = validTz(t.timezone), tm = pad2(t.time); if (!tm) return "";
  if (t.repeat === "once" && t.last_run_at) return "";
  const n = nowIn(tz);
  for (let d = 0; d < 9; d++) {
    const day = dayIn(tz, d);
    if (!dayMatches(t, day)) continue;
    if (t.repeat === "once" && /^\d{4}-\d{2}-\d{2}$/.test(t.date || "") && day < t.date) continue;
    if (d === 0 && (t.last_run_day === day || n.hm >= tm)) continue;
    return day + " " + tm;
  }
  return "";
}

// v85：任务结果 / 聊天里不显示 API 原始链接（带 ?latitude= &current= &daily= 这类参数的长链接）：删掉，只留「来源：Open-Meteo」；第一个链接单独返回，由页面渲染成「查看完整数据」按钮
function stripApiLinks(text) {
  let s = String(text == null ? "" : text); const links = [], names = new Set();
  const HOSTS = { "api.open-meteo.com": "Open-Meteo", "geocoding-api.open-meteo.com": "Open-Meteo", "archive-api.open-meteo.com": "Open-Meteo", "air-quality-api.open-meteo.com": "Open-Meteo" };
  const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ""; } };
  const isApi = (u) => !!HOSTS[hostOf(u)] || /[?&](latitude|longitude|current|current_weather|daily|hourly|forecast_days)=/i.test(u);
  const note = (u) => { if (HOSTS[hostOf(u)]) names.add(HOSTS[hostOf(u)]); if (/^https:\/\//i.test(u) && !links.length) links.push(u); };
  if (!/https?:\/\//i.test(s)) return { text: s, links };
  s = s.replace(/\[([^\]\n]*)\]\((https?:\/\/[^)\s]+)\)/g, (m, t, u) => isApi(u) ? (note(u), /^https?:/i.test(t.trim()) ? "\u0000" : t) : m);
  s = s.replace(/<?https?:\/\/[^\s<>"'`，。；、）】\]]+>?/g, (m) => { const u = m.replace(/^<|>$/g, ""); return isApi(u) ? (note(u), "\u0000") : m; });
  if (s.includes("\u0000")) {
    s = s.split("\n").map((ln) => {
      if (!ln.includes("\u0000")) return ln;
      let x = ln.replace(/\s*[-—–]+\s*\u0000/g, "").replace(/\u0000/g, "").replace(/\(\s*\)|（\s*）/g, "");
      if (/[:：]\s*[。.]?\s*$/.test(x) || !x.replace(/^\s*(?:[-*•]|\d+[.、)])\s*/, "").trim()) return null;   // 只剩“……：”或空行：整行删掉
      return x.replace(/\s+$/, "");
    }).filter((l) => l !== null).join("\n");
  }
  for (const n of names) if (!s.includes("来源：" + n) && !s.includes("来源: " + n)) s = s.replace(/\s+$/, "") + "\n来源：" + n;
  return { text: s.replace(/\n{3,}/g, "\n\n"), links };
}

// ===== v86：今日热榜（糖果梦热榜开放平台 → KV 缓存）=====
// Cron 每 5 分钟 POST https://api-open.tgmeng.com/v1/hot/search（Authorization: Bearer <TANG_HOT_KEY>，只放在 Worker 变量里）；前端只读 KV（GET /api/hot）。抓失败不报错、只保留上一次缓存。
const HOT_KEY = "hot_list_cache", HOT_META = "hot_list_meta";
// v90：平台集合完全动态，不再只认微博/百度/知乎/抖音/快手。key 优先使用 platformId，显示名使用 source。
const hotBoardKey = (v) => { v = String(v == null ? "" : v).trim(); return v ? v.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) : ""; };
const hotBoardLabel = (x) => String(x && (x.source || x.platform || x.platformName || x.board || x.boardName || x.platformId) || "未知平台").trim().slice(0, 60);
const bjStamp = (ms) => { const d = new Date(Number(ms) + 8 * 3600e3); return String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0") + " " + String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0"); };
// 糖果梦返回结构我没拿到官方文档：这里按“字段名常见写法”宽松解析（找出所有带标题的列表，按平台名 / 键名归到微博、百度、知乎、抖音），解析不出的平台就是“缺”，不会编。
// v86b：按糖果梦官方文档解析：data.items 是所有平台混在一起的平铺数组；兼容 platform / platformId / source / board / channel 等字段，最后用标题兜底识别平台。
const hotItemTitle = (x) => String(x && (x.title ?? x.name ?? x.word ?? x.keyword ?? x.text ?? x.desc) || "").trim();
function hotFromItems(items) {
  const groups = {};
  for (const x of items) {
    const title = hotItemTitle(x); if (!x || !title) continue;
    const platformId = String(x.platformId || x.platform || "").trim(), source = String(x.source || x.platformName || x.board || x.boardName || platformId || "").trim();
    const key = hotBoardKey(platformId || source); if (!key) continue;
    let group = groups[key] || (groups[key] = {name: source || platformId, channels: {}}), ch = String(x.channelId || x.channel || x.channelName || "main"), g = group.channels[ch] || (group.channels[ch] = []);
    g.push(x);
  }
  const out = {};
  for (const [key, group] of Object.entries(groups)) {
    const chs = group.channels;
    const names = Object.keys(chs); let ch = chs.main ? "main" : names.sort((a, b) => chs[b].length - chs[a].length)[0]; const seen = new Set(), list = [];
    let upd = 0;
    for (const x of chs[ch].slice().sort((a, b) => (Number(a.rank) || 1e9) - (Number(b.rank) || 1e9))) {
      const title = hotItemTitle(x); if (!title || seen.has(title)) continue; seen.add(title);
      const t = Date.parse(x.observedAt || ""); if (Number.isFinite(t) && t > upd) upd = t;
      list.push({ rank: Number(x.rank) > 0 ? Number(x.rank) : list.length + 1, title: title.slice(0, 120), url: /^https:\/\//i.test(String(x.url || "")) ? String(x.url) : "", hot: x.hotScore == null ? "" : String(x.hotScore).slice(0, 20), cat: String(x.category || "").slice(0, 60) });
      if (list.length >= 50) break;
    }
    if (list.length) out[key] = { name: group.name || key, items: list, upd: upd || null, channel: ch };
  }
  return out;
}
function hotNormalize(j) {
  if (j && j.data && Array.isArray(j.data.items)) return hotFromItems(j.data.items);
  const TF = ["title", "name", "word", "keyword", "query", "text", "desc"], UF = ["url", "link", "href", "mobileUrl", "mobile_url", "wapUrl", "uri"], HF = ["hot", "hotValue", "hot_value", "heat", "hotScore", "hot_score", "score", "num", "popularity", "value"], RF = ["rank", "ranking", "position", "index"];
  const PF = ["platform", "platformName", "platform_name", "source", "sourceName", "site", "siteName", "board", "boardName", "type", "category", "label"], NF = [...PF, "name", "title"], UPF = ["updateTime", "update_time", "updatedAt", "updated_at", "fetchTime", "fetch_time", "time", "timestamp"];
  const pick = (o, ks) => { for (const k of ks) { const v = o[k]; if (v != null && v !== "" && typeof v !== "object") return v; } return null; };
  const toMs = (v) => { if (v == null) return null; let n = Number(v); if (Number.isFinite(n) && String(v).trim() !== "") { if (n > 1e12) {} else if (n > 1e9) n *= 1000; else return null; return n > 1.5e12 && n < 4.1e12 ? n : null; } const str = String(v).trim(); const t = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(str) ? str : str.replace(" ", "T") + "+08:00"); return Number.isFinite(t) ? t : null; };
  const isItem = (o) => o && typeof o === "object" && !Array.isArray(o) && pick(o, TF) != null;
  const boards = {};
  const put = (key, o) => {
    const b = boards[key] || (boards[key] = { items: [], seen: new Set(), upd: null }), title = String(pick(o, TF)).trim();
    if (!title || b.seen.has(title) || b.items.length >= 50) return; b.seen.add(title);
    let rk = Number(pick(o, RF)); if (!(Number.isFinite(rk) && rk > 0)) rk = b.items.length + 1;
    const u = String(pick(o, UF) || ""), hv = pick(o, HF);
    b.items.push({ rank: rk, title: title.slice(0, 120), url: /^https:\/\//i.test(u) ? u : "", hot: hv == null ? "" : String(hv).slice(0, 20) });
  };
  const walk = (node, ctx, depth) => {
    if (node == null || depth > 7) return;
    if (Array.isArray(node)) {
      const objs = node.filter((x) => x && typeof x === "object" && !Array.isArray(x));
      const nested = objs.some((o) => ["items", "list", "data", "hotList", "hot_list", "result", "results"].some((k) => Array.isArray(o[k])));
      if (objs.length && !nested && objs.filter(isItem).length >= objs.length * 0.6) { for (const o of objs) { if (!isItem(o)) continue; const key = hotBoardKey(pick(o, PF)) || hotBoardKey(pick(o, TF)) || hotBoardKey(ctx); if (key) put(key, o); } return; }
      node.forEach((x) => walk(x, ctx, depth + 1)); return;
    }
    if (typeof node === "object") {
      const own = pick(node, NF), ownKey = hotBoardKey(own);
      if (ownKey) { const u = toMs(pick(node, UPF)); if (u) (boards[ownKey] || (boards[ownKey] = { items: [], seen: new Set(), upd: null })).upd = u; }
      for (const [k, v] of Object.entries(node)) if (v && typeof v === "object") walk(v, ownKey ? own : (hotBoardKey(k) ? k : ctx), depth + 1);
    }
  };
  walk(j, "", 0);
  const out = {}; for (const [k, b] of Object.entries(boards)) if (b.items.length) out[k] = { items: b.items, upd: b.upd };
  return out;
}
async function refreshHotList(env) {
  const kv = env && env.KV, key = String(env && (env.TANG_HOT_KEY || env.TGMENG_KEY) || "").trim();
  console.log("[hot] refresh start", JSON.stringify({ has_kv: !!kv, has_key: !!key, at: new Date().toISOString() }));
  if (!kv || !key) { const error = !kv ? "KV 未绑定" : "TANG_HOT_KEY/TGMENG_KEY 未配置"; console.error("[hot] refresh skipped", error); if (kv) { const meta = { last_try_at: Date.now(), last_error: error }; try { await kv.put(HOT_META, JSON.stringify(meta)); console.log("[hot] KV write success", HOT_META, JSON.stringify({ last_error: error, last_try_at: meta.last_try_at })); } catch (e) { console.error("[hot] KV write failed", HOT_META, e && e.message || e); } } return { ok: false, skipped: true, error }; }
  const now = Date.now(); let prev = null, pm = null; try { prev = await kv.get(HOT_KEY, "json"); } catch {} try { pm = await kv.get(HOT_META, "json"); } catch {}
  const meta = { ...(pm || {}), last_try_at: now };
  try {
    // 官方文档：REALTIME 一次最多 500 条、所有平台混在一起；四个榜任何一个不到 20 条且还有更多时才翻页（最多 3 页），一般 1 次请求
    let raw = "", all = [], got = {}, ok = false, scanned = false, firstItemLogged = false;
    // 平台集合未知，不能按固定榜名提前停止；最多按接口分页规则抓 3 页。
    for (let page = 0; page < 3; page++) {
      const endpoint = tangBase(env) + "/v1/hot/search";
      const r = await fetch(endpoint, { method: "POST", headers: tangHeaders(key), body: JSON.stringify({ mode: "REALTIME", limit: 500, offset: page * 500 }), signal: T(15000) });
      const rt = await r.text(); console.log("[hot] tgmeng response", JSON.stringify({ page, endpoint, status: r.status, ok: r.ok, body_head: rt.slice(0, 500) })); if (!raw) raw = rt; let j = null; try { j = JSON.parse(rt); } catch {}
      if (!r.ok || !j) { const why = r.status === 403 ? "（上游拒绝请求：可能是 API Key 无效/未开通，或 Cloudflare Worker 出口 IP 被拦截；需糖果梦给出口 IP 加白或配置 TGMENG_API_BASE 授权中转，不是解析问题）" : ""; throw new Error("HTTP " + r.status + why + (j ? "" : "（不是 JSON）")); }
      const arr = (j.data && Array.isArray(j.data.items)) ? j.data.items : null;
      if (!arr) { got = hotNormalize(j); ok = true; scanned = true; break; }   // 结构和文档不同：退回宽松解析
      all = all.concat(arr); if (!firstItemLogged && arr.length) { console.log("[hot] first item", JSON.stringify(arr[0]).slice(0, 3000)); firstItemLogged = true; } got = hotNormalize({ data: { items: all } }); ok = true;
      console.log("[hot] parsed page", JSON.stringify({ page, items: arr.length, recognized: Object.fromEntries(Object.entries(got).map(([k, b]) => [k, {name: b.name || k, items: b.items.length}])) }));
      if (!arr.length || !(j.data.summary && j.data.summary.hasMore)) { scanned = true; break; }
      // 动态平台无法预先知道是否已经齐全，继续根据 hasMore 翻页。
    }
    const cache = { fetched_at: (prev && prev.fetched_at) || 0, boards: {} }, missing = []; let okN = 0;
    for (const [k, b] of Object.entries(got)) { if (b && b.items.length) { cache.boards[k] = { name: b.name || k, items: b.items, fetched_at: now, source_updated_at: b.upd || null }; okN++; } }
    meta.missing = missing; if (missing.length) meta.raw_head = raw.slice(0, 1500); else delete meta.raw_head;
    if (!okN) throw new Error("没解析出任何受支持平台榜单（返回结构和平台字段与预期不同）");
    cache.fetched_at = now;
    try { await kv.put(HOT_KEY, JSON.stringify(cache)); console.log("[hot] KV write success", HOT_KEY, JSON.stringify({ fetched_at: now, boards: Object.keys(cache.boards) })); }
    catch (e) { console.error("[hot] KV write failed", HOT_KEY, e && e.message || e); throw new Error("写 KV " + HOT_KEY + " 失败：" + (e && e.message || e)); }
    meta.last_ok_at = now; meta.last_error = "";
  } catch (e) { meta.last_error = String(e && e.message || e).slice(0, 500); if (!meta.raw_head) meta.raw_head = ""; console.error("[hot] refresh failed", meta.last_error); }   // 失败只记一笔，不动缓存
  try { await kv.put(HOT_META, JSON.stringify(meta)); console.log("[hot] KV write success", HOT_META, JSON.stringify({ last_error: meta.last_error || "", last_try_at: meta.last_try_at })); }
  catch (e) { console.error("[hot] KV write failed", HOT_META, e && e.message || e); }
  return { ok: !meta.last_error, error: meta.last_error || "", meta };
}
async function hotDigest(env, n = 10) {   // 给“新闻早报”等任务直接用缓存，不调模型
  if (!env.KV) return null; let c = null; try { c = await env.KV.get(HOT_KEY, "json"); } catch {}
  if (!c || !c.boards || !Object.keys(c.boards).length) return null;
  const entries = Object.entries(c.boards).filter(([, b]) => b && b.items && b.items.length), L = ["**今日热榜**（" + entries.map(([, b]) => b.name || "未知平台").join(" / ") + "，各榜独立排名，不做全网混排）"];
  for (const [, b] of entries) { const name = b.name || "未知平台"; L.push(`\n**${name}**（抓取于 ${bjStamp(b.fetched_at)}${b.source_updated_at ? "；榜单更新 " + bjStamp(b.source_updated_at) : ""}）`); b.items.slice(0, n).forEach((x, i) => L.push(`${i + 1}. ${x.url ? `[${x.title}](${x.url})` : x.title}${x.hot ? "（热度 " + x.hot + "）" : ""}`)); }
  const age = Date.now() - (c.fetched_at || 0); if (age > 3 * 3600e3) L.push(`\n（提示：热榜缓存已 ${Math.floor(age / 3600e3)} 小时没更新，抓取可能暂时失败）`);
  L.push("\n来源：糖果梦热榜"); return L.join("\n");
}
// v88：聊天问热搜/热榜时直接读 KV 缓存，不再把这类问题交给网页搜索或模型；
// 同时包含“新闻”时，在热榜后追加今天的 Tavily 新闻，避免把两个来源混成一份榜单。
async function hotNewsReply(env, includeNews) {
  const hot = await hotDigest(env, 10);
  let result = hot;
  if (!result) {
    let m = null; try { if (env.KV) m = await env.KV.get(HOT_META, "json"); } catch {}
    const reason = m && m.last_error ? m.last_error : "暂无可用缓存，Worker 尚未成功抓取糖果梦热榜";
    result = "**糖果梦热榜暂不可用**\n原因：" + reason + "。请点击首页热榜面板中的“刷新”重试。";
  }
  if (!includeNews) return result;
  let news = "";
  try {
    const ls = await tavilyNewsList("今日要闻 财经 国内", env, 6);
    if (ls.length) news = "\n\n**今日新闻**（Tavily 新闻模式，仅最近 24 小时，按时间倒序）\n" + ls.map((n, i) => `${i + 1}. [${n.ago}] [${n.title}](${n.url})`).join("\n");
    else news = "\n\n**今日新闻**\nTavily 最近 24 小时没有返回带发布时间的新闻。";
  } catch (e) {
    news = "\n\n**今日新闻**\n暂时没查到今日新闻（新闻接口不可用或未配置 TAVILY_KEY）。";
  }
  return result + news;
}
// ===== v87：糖果梦「糖果指数」+「招采」（和热榜共用同一个 TANG_HOT_KEY，只放在 Worker 变量里）=====
// 糖果指数：Cron 每 15 分钟抓 all / technology / ai 三个分类 → KV candy_cache；热榜页只读缓存。聊天问“科技圈什么最热”：缓存 20 分钟内就读缓存，否则现查。
// 招采：只在聊天里按需现查（省份 + 关键词，sort=PUBLISHED_AT_DESC），按来源平台分组、组内按发布时间从新到旧，不进缓存。
// 官方文档没写 candy / procurement 单条数据的字段名：按 hot 同款字段（title / url / hotScore / publishedAt / source…）宽松取值，取不到就不显示、不编；解析不出时会把返回开头原样给你看。
const TANG_BASE = "https://api-open.tgmeng.com", TANG_HOME = "https://tgmeng.com";
// 糖果梦官方要求 API Key 放在请求头，不拼到 URL。TGMENG_API_BASE 可指向经糖果梦授权的国内中转/白名单网关。
function tangHeaders(key) { return { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "Mozilla/5.0 (compatible; OpenManus/90; +https://openmanus.pages.dev)", "Referer": "https://open.tgmeng.com/", "Origin": "https://open.tgmeng.com", Authorization: "Bearer " + key, "X-API-Key": key }; }
function tangBase(env) { return String(env && env.TGMENG_API_BASE || TANG_BASE).trim().replace(/\/$/, ""); }
const CANDY_KEY = "candy_cache", CANDY_META = "candy_meta", CANDY_CRON = ["all", "technology", "ai"], CANDY_EVERY = 14 * 60e3, CANDY_FRESH = 20 * 60e3;
const CANDY_NAMES = { all: "全部", technology: "科技", ai: "AI", finance: "财经", entertainment: "娱乐", car: "汽车", sports: "体育", game: "游戏", livelihood: "民生", sideline: "副业", education: "教育" };
const candyLabel = (c) => CANDY_NAMES[String(c == null ? "" : c).toLowerCase()] || String(c == null ? "" : c);
const tangKey = (env) => String(env && (env.TANG_HOT_KEY || env.TGMENG_KEY) || "").trim();
const tangPick = (o, ks) => { for (const k of ks) { const v = o && o[k]; if (v != null && v !== "" && typeof v !== "object") return v; } return ""; };
const tangItems = (j) => (j && j.data && Array.isArray(j.data.items)) ? j.data.items : (j && Array.isArray(j.items)) ? j.items : (j && Array.isArray(j.data)) ? j.data : null;
const bjDay = (ms) => new Date(Number(ms) + 8 * 3600e3).toISOString().slice(0, 10);
const bjFull = (ms) => new Date(Number(ms) + 8 * 3600e3).toISOString().slice(0, 16).replace("T", " ");
function tangTs(v) {
  if (v == null || v === "") return null;
  const n = Number(v); if (Number.isFinite(n) && String(v).trim() !== "") return n > 1e12 ? n : n > 1e9 ? n * 1000 : null;
  let s = String(v).trim(); if (/^\d{4}-\d\d-\d\d$/.test(s)) s += "T00:00:00+08:00"; else if (!/[zZ]|[+-]\d\d:?\d\d$/.test(s)) s = s.replace(" ", "T") + "+08:00";
  const t = Date.parse(s); return Number.isFinite(t) ? t : null;
}
async function tangPost(env, path, body, ms = 15000) {
  const key = tangKey(env); if (!key) throw new ConnErr("Worker 变量 TANG_HOT_KEY 没配置", 500);
  const r = await fetch(tangBase(env) + path, { method: "POST", headers: tangHeaders(key), body: JSON.stringify(body), signal: T(ms) });
  const raw = await r.text(); let j = null; try { j = JSON.parse(raw); } catch {}
  if (!r.ok || !j) {
    const e = j && j.error, code = String((j && j.code) || (e && typeof e === "object" ? e.code : e) || "").slice(0, 40);
    const why = { 400: "参数不被接受", 401: "API Key 缺失或无效", 403: "Key 被禁用 / 过期，或套餐没开放这个功能", 429: code === "QUOTA_EXCEEDED" ? "今日额度用完" : "每分钟请求过多", 502: "糖果梦上游服务异常", 503: "糖果梦开放平台暂不可用" }[r.status] || "";
    const err = new ConnErr("糖果梦接口 HTTP " + r.status + (code ? " " + code : "") + (why ? "（" + why + "）" : "") + (j ? "" : "（返回不是 JSON）"), r.status); err.raw = raw; throw err;
  }
  return { j, raw };
}
// ---- 糖果指数 ----
const candyNum = (v) => { const n = Number(String(v == null ? "" : v).replace(/[,，\s]/g, "")); return String(v == null ? "" : v).trim() !== "" && Number.isFinite(n) ? n : null; };
function candyParse(j, cat) {
  const arr = tangItems(j); if (!arr) return null;
  const seen = new Set(), out = [];
  for (const x of arr) {
    const title = cCl(tangPick(x, ["title", "name", "keyword"]), 120); if (!title || seen.has(title)) continue; seen.add(title);
    const u = String(tangPick(x, ["url", "link"]) || ""), hs = tangPick(x, ["hotScore", "hot_score", "hot"]);
    const rc = cat === "all" ? tangPick(x, ["categoryName", "category", "categoryId", "rootCategory"]) : cat;
    out.push({ title, url: /^https:\/\//i.test(u) ? u : "", hot: hs === "" ? "" : String(hs).slice(0, 20), n: candyNum(hs), cat: candyLabel(rc) });
  }
  if (out.length && out.filter((o) => o.n != null).length >= out.length / 2) out.sort((a, b) => (b.n == null ? -Infinity : b.n) - (a.n == null ? -Infinity : a.n));   // hotScore 越大越热
  return out.slice(0, 50).map((o, i) => ({ rank: i + 1, ...o }));
}
async function candyFetch(env, cat, limit = 50) {
  const { j, raw } = await tangPost(env, "/v1/candy/search", { categories: [cat], limit, distinct: true });
  const items = candyParse(j, cat), tag = (m) => { const e = new ConnErr(m, 200); e.raw = raw; return e; };
  if (!items) throw tag("返回里没有 data.items 数组");
  if (!items.length && (tangItems(j) || []).length) throw tag("有数据但解析不出标题（字段名和预期不同）");
  return { items, raw };
}
async function refreshCandy(env) {
  const kv = env && env.KV; if (!kv || !tangKey(env)) return { ok: false, skipped: true };
  const now = Date.now(); let prev = null, pm = null; try { prev = await kv.get(CANDY_KEY, "json"); } catch {} try { pm = await kv.get(CANDY_META, "json"); } catch {}
  if (pm && pm.last_try_at && now - pm.last_try_at < CANDY_EVERY) return { ok: true, skipped: true };   // Cron 是 5 分钟一次，糖果指数 15 分钟一次，省额度
  const meta = { ...(pm || {}), last_try_at: now }, cache = { fetched_at: 0, cats: {} };
  const rs = await Promise.allSettled(CANDY_CRON.map((c) => candyFetch(env, c, 50))), errs = []; let okN = 0, raw = "";
  rs.forEach((r, i) => {
    const c = CANDY_CRON[i];
    if (r.status === "fulfilled" && r.value.items.length) { cache.cats[c] = { items: r.value.items, fetched_at: now }; okN++; return; }
    errs.push(candyLabel(c) + "：" + (r.status === "rejected" ? String((r.reason && r.reason.message) || r.reason).slice(0, 80) : "没有数据"));
    if (!raw) raw = String(r.status === "rejected" ? (r.reason && r.reason.raw) || "" : r.value.raw || "");
  });
  if (okN) { cache.fetched_at = now; try { await kv.put(CANDY_KEY, JSON.stringify(cache)); meta.last_ok_at = now; } catch (e) { errs.push("写缓存失败：" + String(e && e.message || e).slice(0, 60)); } }
  else { try { await kv.delete(CANDY_KEY); } catch (e) { errs.push("清理旧缓存失败：" + String(e && e.message || e).slice(0, 60)); } }
  meta.last_error = errs.join("；").slice(0, 300); meta.raw_head = errs.length ? raw.slice(0, 1500) : "";
  try { await kv.put(CANDY_META, JSON.stringify(meta)); } catch {}
  return { ok: !errs.length };
}
// 聊天用：缓存新鲜就读缓存，不新鲜就现查；现查失败退回旧缓存（并标出时间）
async function candyGetCats(env, cats) {
  let cc = null; try { cc = env.KV && await env.KV.get(CANDY_KEY, "json"); } catch {}
  const now = Date.now(), per = {}, errs = [];
  await Promise.all(cats.map(async (c) => {
    const b = cc && cc.cats && cc.cats[c], have = !!(b && b.items && b.items.length);
    if (have && now - b.fetched_at < CANDY_FRESH) { per[c] = { items: b.items, at: b.fetched_at, live: false }; return; }
    try { const r = await candyFetch(env, c, 20); per[c] = { items: r.items, at: now, live: true }; }
    catch (e) { const m = String(e && e.message || e).slice(0, 100); if (have) { per[c] = { items: b.items, at: b.fetched_at, live: false }; errs.push(candyLabel(c) + " 现查失败，用的是 " + bjStamp(b.fetched_at) + " 的缓存（" + m + "）"); } else errs.push(candyLabel(c) + " 没查到：" + m); }
  }));
  return { per, errs };
}
async function candyReply(env, cats) {
  const { per, errs } = await candyGetCats(env, cats), got = cats.filter((c) => per[c]);
  if (!got.length) return "糖果指数没查到：" + (errs.join("；") || "没有数据") + "。我不会编榜单。";
  const seen = new Map();
  for (const c of got) for (const x of per[c].items) { const o = seen.get(x.title); if (!o || (x.n || 0) > (o.n || 0)) seen.set(x.title, x); }
  let list = [...seen.values()]; if (list.filter((x) => x.n != null).length >= list.length / 2) list.sort((a, b) => (b.n == null ? -Infinity : b.n) - (a.n == null ? -Infinity : a.n));
  list = list.slice(0, 15);
  const at = Math.max(...got.map((c) => per[c].at)), live = got.some((c) => per[c].live), names = cats.map(candyLabel).join(" / ");
  const L = [`**糖果指数（AI 汇总）· ${names}**（${live ? "刚刚现查" : "缓存"}，${bjStamp(at)}；按 hotScore 从高到低，数值越大越热）`, ""];
  list.forEach((x, i) => L.push(`${i + 1}. ${x.url ? `[${x.title.replace(/[\[\]]/g, "")}](${x.url})` : x.title}｜hotScore ${x.hot || "未提供"}${x.cat ? "｜" + x.cat : ""}`));
  if (errs.length) L.push("", "（" + errs.join("；") + "）");
  L.push("", `来源：糖果梦·糖果指数（AI 汇总，非官方榜单）- ${TANG_HOME}`); return L.join("\n");
}
// ---- 招采 ----
const PROV = ["黑龙江", "内蒙古", "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "台湾", "广西", "西藏", "宁夏", "新疆"];
function tangIntent(s) {
  s = String(s || "").trim(); if (!s || s.length > 120) return null;
  const how = /怎么|如何|怎样|模板|范文|流程|教程|是什么|什么是|区别|写一|代码|脚本|合同|法律|法规|条例/.test(s);
  if (/招标|招采|采购|中标|投标|招投标|比选|磋商|公共资源交易/.test(s) && !how) {
    const provinces = PROV.filter((p) => s.includes(p));
    const kw = s.replace(new RegExp(PROV.join("|") + "|自治区|省|市", "g"), " ").replace(/近\s*\d+\s*天|本周|这周|最近|这几天|本月|这个月|昨天|今天|今日|最新|帮我|请|麻烦|查询|查一下|查查|查|搜索|搜|找|看看|看下|有没有|有哪些|有什么|吗|呢|吧|一下|相关|关于|项目|信息|公告|结果|政府采购|公共资源交易|招投标|招标|招采|采购|中标|投标|比选|磋商|的|和|与|及|在|给我|列出|所有/g, " ");
    const keywords = [...new Set(kw.split(/[\s,，、;；。？?！!]+/).map((x) => x.trim()).filter((x) => x.length >= 2))].slice(0, 2);
    const m = s.match(/近\s*(\d+)\s*天/); let rangeDays = 0;
    if (m) rangeDays = Math.min(31, Math.max(1, Number(m[1]))); else if (/本周|这周|最近|这几天/.test(s)) rangeDays = 7; else if (/昨天/.test(s)) rangeDays = 2; else if (/本月|这个月/.test(s)) rangeDays = 31;
    return { type: "procure", provinces, keywords, rangeDays };
  }
  const ci = /糖果指数/.test(s), hot = /最热|热门|热点|热搜|热榜|热议|什么火|火什么|排行|榜单|热度/.test(s) && !/新闻|报道|快讯|头条|要闻|微博|抖音|快手|百度|知乎/.test(s);
  if (ci || hot) {
    const c = [];
    if (/科技|数码|互联网/.test(s)) c.push("technology", "ai"); else if (/(?<![A-Za-z])AI(?![A-Za-z])|人工智能|大模型/i.test(s)) c.push("ai");
    for (const [re, k] of [[/财经|股市|股票|金融|经济|基金/, "finance"], [/娱乐|明星|综艺|影视/, "entertainment"], [/汽车|车圈|新能源车/, "car"], [/体育|足球|篮球|NBA/i, "sports"], [/游戏|电竞/, "game"], [/民生/, "livelihood"], [/教育|高考|考研/, "education"], [/副业|兼职/, "sideline"]]) if (re.test(s)) c.push(k);
    if (c.length) return { type: "candy", cats: [...new Set(c)] };
    if (ci) return { type: "candy", cats: ["all"] };
  }
  return null;
}
function procureParse(j) {
  const arr = tangItems(j); if (!arr) return null;
  const out = [];
  for (const x of arr) {
    const title = cCl(tangPick(x, ["title", "noticeTitle", "projectName", "name"]), 160); if (!title) continue;
    const u = String(tangPick(x, ["url", "link", "detailUrl", "noticeUrl"]) || ""), pr = tangPick(x, ["publishedAt", "publishTime", "publishDate", "publishedTime", "pubTime", "publishAt"]);
    out.push({ title, url: /^https?:\/\//i.test(u) ? u : "", pubRaw: String(pr || ""), ts: tangTs(pr), plat: cCl(tangPick(x, ["sourceName", "source", "sourceGroup", "platformName", "platform", "sourceCode"]), 40) || "其他平台", type: cCl(tangPick(x, ["rawType", "noticeType", "type"]), 20), purchaser: cCl(tangPick(x, ["purchaser", "buyer", "purchaserName", "tenderee"]), 40), amount: cCl(tangPick(x, ["amount", "budget", "budgetAmount", "amountText"]), 24), deadline: cCl(tangPick(x, ["deadline", "deadlineAt", "bidDeadline", "deadlineTime"]), 24) });
  }
  return { items: out, rawCount: arr.length };
}
async function procureFetch(env, p, hist) {
  const body = { mode: hist ? "HISTORY" : "TODAY", sort: "PUBLISHED_AT_DESC", limit: 100, distinct: true };
  if (p.keywords.length) body.keywords = p.keywords; if (p.provinces.length) body.provinces = p.provinces;
  let r;
  if (hist) {
    const today = bjDay(Date.now()), ms = tangTs(today) , monthStart = today.slice(0, 8) + "01", d = Math.max(1, p.rangeDays || 31);
    let start = bjDay(ms - (d - 1) * 86400e3); if (start < monthStart) start = monthStart;   // HISTORY 要求同一自然月
    try { r = await tangPost(env, "/v1/procurement/search", { ...body, startTime: start + " 00:00:00", endTime: today + " 23:59:59" }); }
    catch (e) { if (e && e.status === 400) r = await tangPost(env, "/v1/procurement/search", { ...body, startTime: start, endTime: today }); else throw e; }
    r.start = start; r.end = today;
  } else r = await tangPost(env, "/v1/procurement/search", body);
  const parsed = procureParse(r.j); r.parsed = parsed; r.total = r.j && r.j.data && r.j.data.summary && r.j.data.summary.total;
  return r;
}
function procureRender(r, p, note) {
  const items = r.parsed.items.slice().sort((a, b) => (b.ts == null ? -Infinity : b.ts) - (a.ts == null ? -Infinity : a.ts));   // 再按发布时间倒序排一遍（没时间的排最后）
  const groups = new Map(); for (const x of items) { if (!groups.has(x.plat)) groups.set(x.plat, []); groups.get(x.plat).push(x); }
  const gl = [...groups.entries()].sort((a, b) => (b[1][0].ts == null ? -Infinity : b[1][0].ts) - (a[1][0].ts == null ? -Infinity : a[1][0].ts));
  const where = (p.provinces.length ? p.provinces.join("、") : "全国") + (p.keywords.length ? "｜关键词：" + p.keywords.join("、") : ""), when = r.start ? `${r.start} 至 ${r.end}` : "今天";
  const L = [`**招采公告**（${where}｜${when}｜按来源平台分组，组内按发布时间从新到旧${r.total != null ? "；接口共 " + r.total + " 条" : ""}）`];
  if (note) L.push(note);
  let shown = 0;
  for (const [plat, arr] of gl.slice(0, 8)) {
    L.push("", `**${plat}**（${arr.length} 条）`);
    arr.slice(0, 8).forEach((x, i) => {
      const meta = [x.ts ? "发布 " + bjFull(x.ts) : x.pubRaw ? "发布 " + x.pubRaw : "", x.type, x.purchaser ? "采购人 " + x.purchaser : "", x.amount ? "金额 " + x.amount : "", x.deadline ? "截止 " + x.deadline : ""].filter(Boolean).join("｜");
      L.push(`${i + 1}. ${x.url ? `[${x.title.replace(/[\[\]]/g, "")}](${x.url})` : x.title}${meta ? "｜" + meta : ""}`); shown++;
    });
    if (arr.length > 8) L.push(`（${plat} 另有 ${arr.length - 8} 条没列出）`);
  }
  if (gl.length > 8) L.push("", `（还有 ${gl.length - 8} 个平台没列出，换更具体的关键词可以缩小范围）`);
  L.push("", `来源：糖果梦·招采数据（政府采购 / 公共资源交易 / 央国企采购公告的聚合，以公告原文为准）- ${TANG_HOME}`); return L.join("\n");
}
async function procureReply(env, p) {
  if (!p.provinces.length && !p.keywords.length) return "想查哪个省份、什么关键词的招采公告？比如“吉林 教育 招标”。";
  let hist = !!p.rangeDays, note = "", r = await procureFetch(env, p, hist);
  if (r.parsed && !r.parsed.items.length && !r.parsed.rawCount && !hist) { hist = true; r = await procureFetch(env, p, true); note = "今天还没有符合条件的公告，改查本月 1 日到今天："; }
  if (!r.parsed) return "招采接口通了，但返回里没有 data.items 数组，我按文档字段没法解析，不会编。返回开头：\n```\n" + r.raw.slice(0, 900) + "\n```";
  if (!r.parsed.items.length) return r.parsed.rawCount ? "招采接口有 " + r.parsed.rawCount + " 条数据，但取不到标题（字段名和我按文档猜的不一致），不会编。返回开头：\n```\n" + r.raw.slice(0, 900) + "\n```" : `没有查到：${p.provinces.join("、") || "全国"}${p.keywords.length ? " · " + p.keywords.join("、") : ""}（${r.start ? r.start + " 至 " + r.end : "今天"}）暂无符合的招采公告。`;
  return procureRender(r, p, note);
}
// ===== /v87 =====
async function execTaskPrompt(t, env) {
  // v81：和聊天一样先自动选连接器查真实资料（天气 / 新闻 / 搜索…），再让模型回答，并附“来源”。以前定时任务只问模型，查天气会编。
  let text = "", status = "ok";
  const q = String(t.prompt || t.title).slice(-12000);
  // v86：热榜 / 新闻早报：直接读热榜缓存（不调模型、不编榜单），再附今天的新闻（Tavily 新闻模式，带发布时间）
  if (/热榜|热搜|新闻早报/.test(q) && q.length <= 300) {
    try {
      const dg = await hotDigest(env, 10);
      if (dg) {
        let news = ""; try { const ls = await tavilyNewsList("今日要闻 财经 国内", env, 6); if (ls.length) news = "\n\n**今日新闻**（Tavily 新闻模式，仅最近 24 小时，按时间倒序）\n" + ls.map((n, i) => `${i + 1}. [${n.ago}] [${n.title}](${n.url})`).join("\n"); } catch {}
        const sk = stripApiLinks(dg + news); return { text: sk.text, status: "ok", links: sk.links };
      }
    } catch {}
  }
  try {
    let msgs = [{ role: "user", content: q }], connRes = null;
    try {
      if (q.length <= 300 && !/```/.test(q)) {
        const cids = routeConnectors(q, env);
        if (cids.length) { connRes = await runConnectors(cids, q, env); msgs = mergeSys(msgs, connSystem(connRes)); }
      }
    } catch {}
    const r = await tryAllFree(msgs, env, async () => {}, false); text = r ? r.text : "";
    if (!text) status = "failed";
    else if (connRes) { try { text += connFooter(connRes, q); } catch {} }
  } catch (e) { status = "failed"; text = String(e.message || e); }
  const sk = stripApiLinks(text);
  return { text: sk.text, status, links: sk.links };
}
async function runDueTasks(env) {
  if (!env.KV) return 0;
  let ran = 0;
  const l = await env.KV.list({ prefix: "tasks:", limit: 1000 });
  for (const k of l.keys) {
    const list = await env.KV.get(k.name, "json"); if (!Array.isArray(list)) continue;
    const due = list.filter((t) => taskIsDue(t, nowIn(validTz(t.timezone))));
    for (const t of due) {
      if (ran >= 5) return ran;                       // 每次触发最多跑 5 个，其余下一轮接着跑
      const tz = validTz(t.timezone), n = nowIn(tz);
      // 先把“今天已跑”落盘，再执行：避免两次触发重叠时重复跑
      // v25：重新读一遍再标记。v23 直接写回开头读到的旧 list：同一用户有 2 个以上任务同时到点时，
      // 后一个任务的“先标记”会把前一个任务刚写好的结果和 once 的“已停用”覆盖掉，once 任务第二天会再跑。
      const cur = (await env.KV.get(k.name, "json")) || [], ct = cur.find((x) => x.id === t.id);
      if (!ct || ct.last_run_day === n.day) continue;
      ct.last_run_day = n.day; await env.KV.put(k.name, JSON.stringify(cur));
      ran++;
      const { text, status, links } = await execTaskPrompt(t, env);
      const fresh = (await env.KV.get(k.name, "json")) || []; const ft = fresh.find((x) => x.id === t.id);
      if (ft) {
        Object.assign(ft, { last_run_day: n.day, last_run_at: Date.now(), last_status: status, last_result: text.slice(0, 6000), last_links: links, updated_at: Date.now() });
        if (t.repeat === "once") ft.enabled = false;
        ft.next_run = nextRunOf(ft);
        await env.KV.put(k.name, JSON.stringify(fresh));
      }
    }
  }
  return ran;
}

/* ===== EXP_CORE：前后端共用（Markdown 分块 / 分段 / 文件名清理）。改这里要同时更新前端和 Worker ===== */
const EXP_PART_CP = 8000, EXP_MAX_CP = 32768;
const cpLen = (s) => { let n = 0; for (const _ of String(s)) n++; return n; };            // 按 Unicode 码点计数，不用 string.length
const cpSlice = (s, a, b) => Array.from(String(s)).slice(a, b).join("");
const expNorm = (md) => String(md == null ? "" : md).replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
const expDate = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);          // YYYY-MM-DD（北京时间）
function cleanName(s, max = 60) {
  let t = String(s == null ? "" : s).replace(/\.(docx|pdf|pptx|xlsx|csv|html?|md)$/i, "").replace(/[^\p{Script=Han}A-Za-z0-9_-]/gu, "").replace(/^[-_]+|[-_]+$/g, "");
  return Array.from(t).slice(0, max).join("");
}
function expFileBase(title, filename) {
  const t = cleanName(title, 40);
  return cleanName(filename, 60) || (t || "标题") + "-" + expDate();
}
const RE_FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)/;
const RE_HEAD = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const RE_HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$|^\s*<hr\s*\/?>\s*$/i;
const RE_LI = /^(\s*)([-*+]|\d{1,3}[.)])\s+(.*)$/;
const RE_SEP = /^\s*\|?\s*:?-{1,}:?\s*(?:\|\s*:?-{1,}:?\s*)+\|?\s*$|^\s*\|\s*:?-{1,}:?\s*\|\s*$/;
const splitRow = (l) => { let t = l.trim(); if (t.startsWith("|")) t = t.slice(1); if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1); return t.split(/(?<!\\)\|/).map((x) => x.trim().replace(/\\\|/g, "|")); };
// 解析成块：{t:'h'|'p'|'list'|'table'|'code'|'quote'|'hr', raw, ...}
function parseMd(md) {
  const L = expNorm(md).split("\n"), out = [];
  let i = 0;
  const special = (l, nx) => RE_FENCE.test(l) || RE_HEAD.test(l) || RE_HR.test(l) || /^\s{0,3}>/.test(l) || RE_LI.test(l) || (l.includes("|") && nx != null && RE_SEP.test(nx));
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = RE_FENCE.exec(l))) {
      const ch = m[1][0], n = m[1].length, lang = m[2] || "", s = i; i++;
      const body = [];
      while (i < L.length && !new RegExp("^\\s{0,3}\\" + ch + "{" + n + ",}\\s*$").test(L[i])) { body.push(L[i]); i++; }
      const closed = i < L.length; if (closed) i++;
      out.push({ t: "code", lang, text: body.join("\n"), raw: L.slice(s, i).join("\n") + (closed ? "" : "\n" + ch.repeat(n)), fence: m[1] });
      continue;
    }
    if ((m = RE_HEAD.exec(l))) { out.push({ t: "h", lv: m[1].length, text: m[2], raw: l }); i++; continue; }
    if (RE_HR.test(l)) { out.push({ t: "hr", raw: l }); i++; continue; }
    if (l.includes("|") && i + 1 < L.length && RE_SEP.test(L[i + 1])) {
      const s = i, head = splitRow(l), rows = []; i += 2;
      while (i < L.length && L[i].trim() && L[i].includes("|")) { rows.push(splitRow(L[i])); i++; }
      out.push({ t: "table", head, rows, raw: L.slice(s, i).join("\n"), headRaw: L.slice(s, s + 2).join("\n") });
      continue;
    }
    if (/^\s{0,3}>/.test(l)) {
      const s = i, q = [];
      while (i < L.length && /^\s{0,3}>/.test(L[i])) { q.push(L[i].replace(/^\s{0,3}>\s?/, "")); i++; }
      out.push({ t: "quote", text: q.join("\n"), raw: L.slice(s, i).join("\n") });
      continue;
    }
    if ((m = RE_LI.exec(l))) {
      const s = i, items = [];
      while (i < L.length) {
        const mm = RE_LI.exec(L[i]);
        if (mm && items.length && !mm[1].length && items.filter((x) => !x.lv).length && items.filter((x) => !x.lv).pop().ord !== /\d/.test(mm[2])) break;   // 项目符号 ↔ 数字编号 切换：另起一个列表
        if (mm) { items.push({ lv: Math.min(2, Math.floor(mm[1].replace(/\t/g, "  ").length / 2)), ord: /\d/.test(mm[2]), num: parseInt(mm[2], 10) || 1, text: mm[3] }); i++; }
        else if (L[i].trim() && /^\s{2,}\S/.test(L[i]) && items.length) { items[items.length - 1].text += "\n" + L[i].trim(); i++; }
        else break;
      }
      out.push({ t: "list", items, raw: L.slice(s, i).join("\n") });
      continue;
    }
    const s = i, p = [];
    while (i < L.length && L[i].trim() && !(p.length && special(L[i], L[i + 1]))) { p.push(L[i].trim()); i++; }
    if (!p.length) { p.push(L[i].trim()); i++; }
    out.push({ t: "p", text: p.join("\n"), raw: L.slice(s, i).join("\n") });
  }
  return out;
}
// 把超过上限的单个块切开：表格按行边界并重复表头；代码块按行并补围栏；其他按行，单行过长再按码点切。不丢内容。
function splitBigBlock(b, lim) {
  const raw = b.raw, out = [];
  if (b.t === "table") {
    const hd = b.headRaw, lines = raw.split("\n").slice(2);
    let cur = [], n = cpLen(hd) + 1;
    for (const ln of lines) {
      const c = cpLen(ln) + 1;
      if (cur.length && n + c > lim) { out.push(hd + "\n" + cur.join("\n")); cur = []; n = cpLen(hd) + 1; }
      cur.push(ln); n += c;
    }
    if (cur.length) out.push(hd + "\n" + cur.join("\n"));
    return out;
  }
  let open = "", close = "", lines = raw.split("\n");
  if (b.t === "code") { open = lines[0]; close = b.fence; lines = lines.slice(1, lines.length - 1); }
  const wrap = (arr) => (open ? open + "\n" : "") + arr.join("\n") + (close ? "\n" + close : "");
  const budget = lim - cpLen(open) - cpLen(close) - 2;
  let cur = [], n = 0;
  const flush = () => { if (cur.length) { out.push(wrap(cur)); cur = []; n = 0; } };
  for (let ln of lines) {
    while (cpLen(ln) > budget) { flush(); out.push(wrap([cpSlice(ln, 0, budget)])); ln = cpSlice(ln, budget); }
    const c = cpLen(ln) + 1;
    if (cur.length && n + c > budget) flush();
    cur.push(ln); n += c;
  }
  flush();
  return out;
}
// 返回 {ok, total, parts:[md...]} 或 {ok:false, msg}
function splitParts(md, lim = EXP_PART_CP) {
  md = expNorm(md);
  const total = cpLen(md);
  if (!md.trim()) return { ok: false, msg: "没有可导出的内容", total };
  if (total > EXP_MAX_CP) return { ok: false, msg: "内容 " + total + " 字，超过单篇导出上限 " + EXP_MAX_CP + " 字，请拆成几篇再导出", total };
  if (total <= lim) return { ok: true, total, parts: [md] };
  const units = [];
  parseMd(md).forEach((b) => { if (cpLen(b.raw) > lim) splitBigBlock(b, lim).forEach((r) => units.push({ raw: r, h: false })); else units.push({ raw: b.raw, h: b.t === "h" }); });
  const parts = []; let cur = [], n = 0;
  const flush = () => { if (cur.length) { parts.push(cur.map((u) => u.raw).join("\n\n")); cur = []; n = 0; } };
  for (const u of units) {
    const c = cpLen(u.raw) + 2;
    if (cur.length && n + c > lim) {
      const tail = cur[cur.length - 1];
      if (tail.h && cur.length > 1) { cur.pop(); flush(); cur = [tail]; n = cpLen(tail.raw) + 2; } else flush();   // 标题不落在一部分的最后一行
    }
    cur.push(u); n += c;
  }
  flush();
  return { ok: true, total, parts };
}
/* ===== /EXP_CORE ===== */

/* ===== EXP_SERVER：导出 docx / pptx / xlsx / csv / html（不引入任何库：ZIP、CRC32、XML 自己写） =====
   不写日志：这里不 console.log 任何内容，报错信息里也不带正文（医院场景：患者信息不进日志）。 */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function zipStore(files) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  for (const f of files) {
    const nm = enc.encode(f.name), d = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(d);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, 0, true); lh.setUint16(12, 0x0021, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, d.length, true); lh.setUint32(22, d.length, true); lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nm, d);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, 0, true); ch.setUint16(14, 0x0021, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, d.length, true); ch.setUint32(24, d.length, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    cen.push(new Uint8Array(ch.buffer), nm);
    off += 30 + nm.length + d.length;
  }
  let cs = 0; cen.forEach((x) => (cs += x.length));
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cs, true); end.setUint32(16, off, true);
  const all = [...parts, ...cen, new Uint8Array(end.buffer)]; let n = 0; all.forEach((x) => (n += x.length));
  const out = new Uint8Array(n); let p = 0; all.forEach((x) => { out.set(x, p); p += x.length; });
  return out;
}
const xe = (s) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const XMLH = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

/* ---------- 行内：**粗体** *斜体* `代码` [链接](url) ![图](url) <br>，其它 HTML 标签一律丢掉 ---------- */
const SAFE_URL = (u) => /^https?:\/\//i.test(String(u).trim()) ? String(u).trim() : "";
function dropDanger(s) { return String(s).replace(/<(script|style|iframe|object|embed|form|noscript|template|svg|math)\b[\s\S]*?<\/\1\s*>/gi, "").replace(/<\/?(script|style|iframe|object|embed|form|noscript|template|svg|math)\b[^>]*>/gi, ""); }
function parseInline(s, st = {}) {
  const runs = [], re = /!\[([^\]]*)\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)(?:\s+"[^"]*")?\)|\*\*([^*]+?)\*\*|__([^_]+?)__|\*([^*\n]+?)\*|(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])|`([^`]+)`|(<br\s*\/?>)|<\/?[a-zA-Z][^>\n]*>|(\n)/g;
  let last = 0, m; s = String(s);
  const text = (t) => { if (t) runs.push({ ...st, t }); };
  while ((m = re.exec(s))) {
    text(s.slice(last, m.index)); last = re.lastIndex;
    if (m[2] !== undefined) { runs.push({ ...st, t: "[图片：" + m[2] + "]", img: m[2], alt: m[1] }); }
    else if (m[4] !== undefined) { const h = SAFE_URL(m[4]); parseInline(m[3], { ...st, href: h || st.href }).forEach((r) => runs.push(r)); }
    else if (m[5] !== undefined || m[6] !== undefined) parseInline(m[5] !== undefined ? m[5] : m[6], { ...st, b: true }).forEach((r) => runs.push(r));
    else if (m[7] !== undefined || m[8] !== undefined) parseInline(m[7] !== undefined ? m[7] : m[8], { ...st, i: true }).forEach((r) => runs.push(r));
    else if (m[9] !== undefined) runs.push({ ...st, t: m[9], code: true });
    else if (m[10] !== undefined || m[11] !== undefined) runs.push({ br: true });
    /* 其它标签：丢掉标签本身 */
  }
  text(s.slice(last));
  return runs;
}
const plainOf = (s) => parseInline(dropDanger(s)).map((r) => (r.br ? "\n" : r.t)).join("");

/* ---------- DOCX ---------- */
const W_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const FONT = '<w:rFonts w:ascii="Microsoft YaHei" w:hAnsi="Microsoft YaHei" w:eastAsia="Microsoft YaHei" w:cs="Microsoft YaHei"/>';
const MONO = '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:eastAsia="SimSun" w:cs="Consolas"/>';
function docxRuns(runs, rels, base = "") {
  return runs.map((r) => {
    if (r.br) return "<w:r><w:br/></w:r>";
    let rp = (r.code ? MONO + '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>' : "") + (r.b ? "<w:b/>" : "") + (r.i ? "<w:i/>" : "") + (r.href ? '<w:color w:val="0563C1"/><w:u w:val="single"/>' : "") + base;
    const run = '<w:r>' + (rp ? "<w:rPr>" + rp + "</w:rPr>" : "") + '<w:t xml:space="preserve">' + xe(r.t) + "</w:t></w:r>";
    if (r.href) { const id = "rIdL" + (rels.length + 1); rels.push({ id, href: r.href }); return '<w:hyperlink r:id="' + id + '" w:history="1">' + run + "</w:hyperlink>"; }
    return run;
  }).join("");
}
function docxPara(text, rels, ppr = "", base = "") { return "<w:p>" + (ppr ? "<w:pPr>" + ppr + "</w:pPr>" : "") + docxRuns(parseInline(text), rels, base) + "</w:p>"; }
function buildDocx(md, title) {
  const blocks = parseMd(md), rels = [], nums = []; let body = "";
  for (const b of blocks) {
    if (b.t === "h") { const lv = Math.min(b.lv, 6); body += docxPara(b.text, rels, '<w:pStyle w:val="Heading' + lv + '"/>'); }
    else if (b.t === "p") body += docxPara(dropDanger(b.text), rels);
    else if (b.t === "quote") body += docxPara(dropDanger(b.text), rels, '<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="999999"/></w:pBdr><w:ind w:left="360"/>', '<w:color w:val="666666"/>');
    else if (b.t === "hr") body += '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="BBBBBB"/></w:pBdr></w:pPr></w:p>';
    else if (b.t === "list") {
      let numId = 0;
      if (b.items.some((x) => x.ord)) { numId = 2 + nums.length; nums.push({ id: numId, start: (b.items.find((x) => x.ord) || {}).num || 1 }); }
      for (const it of b.items) body += docxPara(dropDanger(it.text), rels, '<w:numPr><w:ilvl w:val="' + it.lv + '"/><w:numId w:val="' + (it.ord ? numId : 1) + '"/></w:numPr><w:spacing w:after="60"/>');
    }
    else if (b.t === "code") {
      const lines = b.text.split("\n");
      for (const ln of lines) body += '<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/><w:spacing w:before="0" w:after="0" w:line="260" w:lineRule="auto"/><w:ind w:left="120" w:right="120"/></w:pPr><w:r><w:rPr>' + MONO + '<w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">' + xe(ln.replace(/\t/g, "    ")) + "</w:t></w:r></w:p>";
      body += '<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>';
    }
    else if (b.t === "table") {
      const n = Math.max(b.head.length, ...b.rows.map((r) => r.length), 1), gw = Math.floor(9360 / n);
      const cell = (txt, head) => '<w:tc><w:tcPr><w:tcW w:w="' + gw + '" w:type="dxa"/>' + (head ? '<w:shd w:val="clear" w:color="auto" w:fill="E8F3EE"/>' : "") + '</w:tcPr><w:p><w:pPr><w:spacing w:before="40" w:after="40" w:line="300" w:lineRule="auto"/></w:pPr>' + docxRuns(parseInline(dropDanger(txt)), rels, head ? "<w:b/>" : "") + "</w:p></w:tc>";
      const row = (cells, head) => { const c = cells.slice(); while (c.length < n) c.push(""); return "<w:tr><w:trPr><w:cantSplit/>" + (head ? "<w:tblHeader/>" : "") + "</w:trPr>" + c.map((x) => cell(x, head)).join("") + "</w:tr>"; };
      const bd = (k) => "<w:" + k + ' w:val="single" w:sz="4" w:space="0" w:color="999999"/>';
      body += '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + ["top", "left", "bottom", "right", "insideH", "insideV"].map(bd).join("") + '</w:tblBorders><w:tblLayout w:type="autofit"/><w:tblCellMar><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' + Array.from({ length: n }, () => '<w:gridCol w:w="' + gw + '"/>').join("") + "</w:tblGrid>" + row(b.head, true) + b.rows.map((r) => row(r, false)).join("") + '</w:tbl><w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>';
    }
  }
  if (!body) body = "<w:p/>";
  const sect = '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417" w:header="851" w:footer="992" w:gutter="0"/></w:sectPr>';
  const hs = (id, name, sz, before) => '<w:style w:type="paragraph" w:styleId="Heading' + id + '"><w:name w:val="heading ' + id + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="' + before + '" w:after="160"/><w:outlineLvl w:val="' + (id - 1) + '"/></w:pPr><w:rPr><w:b/><w:sz w:val="' + sz + '"/><w:szCs w:val="' + sz + '"/></w:rPr></w:style>';
  const styles = XMLH + "<w:styles " + W_NS + '><w:docDefaults><w:rPrDefault><w:rPr>' + FONT + '<w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="zh-CN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' + hs(1, "1", 44, 360) + hs(2, "2", 36, 280) + hs(3, "3", 32, 240) + hs(4, "4", 28, 200) + hs(5, "5", 26, 200) + hs(6, "6", 24, 200) + "</w:styles>";
  const lvl = (i, fmt, txt, start) => '<w:lvl w:ilvl="' + i + '"><w:start w:val="' + (start || 1) + '"/><w:numFmt w:val="' + fmt + '"/><w:lvlText w:val="' + txt + '"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="' + (420 + 420 * i) + '" w:hanging="420"/></w:pPr></w:lvl>';
  const numbering = XMLH + "<w:numbering " + W_NS + '><w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl(0, "bullet", "•") + lvl(1, "bullet", "◦") + lvl(2, "bullet", "▪") + '</w:abstractNum><w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>' + lvl(0, "decimal", "%1.") + lvl(1, "decimal", "%2.") + lvl(2, "decimal", "%3.") + '</w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>' +
    nums.map((n) => '<w:num w:numId="' + n.id + '"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="' + n.start + '"/></w:lvlOverride></w:num>').join("") + "</w:numbering>";
  const fontTable = XMLH + "<w:fonts " + W_NS + '><w:font w:name="Microsoft YaHei"><w:altName w:val="微软雅黑"/><w:panose1 w:val="020B0503020204020204"/><w:charset w:val="86"/><w:family w:val="swiss"/><w:pitch w:val="variable"/></w:font><w:font w:name="SimSun"><w:altName w:val="宋体"/><w:panose1 w:val="02010600030101010101"/><w:charset w:val="86"/><w:family w:val="auto"/><w:pitch w:val="fixed"/></w:font><w:font w:name="Consolas"><w:panose1 w:val="020B0609020204030204"/><w:charset w:val="00"/><w:family w:val="modern"/><w:pitch w:val="fixed"/></w:font></w:fonts>';
  const docRels = XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>' +
    rels.map((r) => '<Relationship Id="' + r.id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="' + xe(r.href) + '" TargetMode="External"/>').join("") + "</Relationships>";
  return zipStore([
    { name: "[Content_Types].xml", data: XMLH + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
    { name: "_rels/.rels", data: XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
    { name: "docProps/core.xml", data: corePropsXml(title) },
    { name: "word/document.xml", data: XMLH + "<w:document " + W_NS + "><w:body>" + body + sect + "</w:body></w:document>" },
    { name: "word/styles.xml", data: styles }, { name: "word/numbering.xml", data: numbering }, { name: "word/fontTable.xml", data: fontTable },
    { name: "word/_rels/document.xml.rels", data: docRels }
  ]);
}
function corePropsXml(title) { return XMLH + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>' + xe(title) + '</dc:title><dcterms:created xsi:type="dcterms:W3CDTF">' + new Date().toISOString().replace(/\.\d+Z$/, "Z") + "</dcterms:created></cp:coreProperties>"; }

/* ---------- PPTX ---------- */
const P_NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const PF = '<a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface="Microsoft YaHei"/>';
const PMONO = '<a:latin typeface="Consolas"/><a:ea typeface="SimSun"/><a:cs typeface="Consolas"/>';
const prun = (t, sz, o = {}) => '<a:r><a:rPr lang="zh-CN" altLang="en-US" sz="' + sz + '"' + (o.b ? ' b="1"' : "") + (o.i ? ' i="1"' : "") + ' dirty="0"><a:solidFill><a:srgbClr val="' + (o.color || "222222") + '"/></a:solidFill>' + (o.mono ? PMONO : PF) + "</a:rPr><a:t>" + xe(t) + "</a:t></a:r>";
function pptxSlides(md, title) {
  const blocks = parseMd(md), secs = []; let sec = null;
  const ensure = () => { if (!sec) { sec = { title: title || "内容", items: [] }; secs.push(sec); } return sec; };
  for (const b of blocks) {
    if (b.t === "h" && b.lv <= 2) { sec = { title: plainOf(b.text).replace(/\n/g, " "), items: [] }; secs.push(sec); continue; }
    const s = ensure();
    if (b.t === "h") s.items.push({ k: "line", text: plainOf(b.text), b: true });
    else if (b.t === "p") plainOf(b.text).split("\n").forEach((l) => l.trim() && s.items.push({ k: "line", text: l }));
    else if (b.t === "quote") plainOf(b.text).split("\n").forEach((l) => l.trim() && s.items.push({ k: "line", text: l, i: true }));
    else if (b.t === "list") b.items.forEach((it) => plainOf(it.text).split("\n").forEach((l, j) => l.trim() && s.items.push({ k: "line", text: (it.ord && j === 0 ? it.num + ". " : "") + l, lv: it.lv, ord: it.ord })));
    else if (b.t === "code") b.text.split("\n").forEach((l) => s.items.push({ k: "code", text: l.replace(/\t/g, "    ") }));
    else if (b.t === "table") s.items.push({ k: "table", head: b.head.map(plainOf), rows: b.rows.map((r) => r.map(plainOf)) });
  }
  const slides = [];
  for (const s of secs) {
    if (!s.items.length) continue;
    let cur = [], w = 0, first = true;
    const push = (extra) => { slides.push({ title: first ? s.title : s.title + "（续）", ...extra }); first = false; };
    const flush = () => { if (cur.length) { push({ lines: cur }); cur = []; w = 0; } };
    for (const it of s.items) {
      if (it.k === "table") {
        let cap = "";
        if (cur.length && cur[cur.length - 1].b) cap = cur.pop().text;      // 紧挨着表格的小标题，跟表格放同一页
        flush();
        const n = it.rows.length || 1;
        for (let i = 0; i < n; i += 7) { push({ table: { head: it.head, rows: it.rows.slice(i, i + 7) } }); if (cap && i === 0) slides[slides.length - 1].title = slides[slides.length - 1].title.replace(/（续）$/, "") + "：" + cap; }
        continue;
      }
      const iw = it.k === "code" ? Math.max(1, Math.ceil(cpLen(it.text) / 80)) : Math.max(1, Math.ceil(cpLen(it.text) / (it.lv ? 36 : 42)));
      if (cur.length && w + iw > 8) flush();
      cur.push(it); w += iw;
    }
    flush();
  }
  return slides;
}
function buildPptx(md, title) {
  const slides = pptxSlides(md, title), ttl = title || (parseMd(md).find((b) => b.t === "h") || {}).text || "演示文稿";
  const dt = new Date(Date.now() + 8 * 3600e3), dateCN = dt.getUTCFullYear() + "年" + (dt.getUTCMonth() + 1) + "月" + dt.getUTCDate() + "日";
  const grp = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>';
  const sld = (shapes) => XMLH + "<p:sld " + P_NS + "><p:cSld><p:spTree>" + grp + shapes + "</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>";
  const ph = (id, name, type, idx, x, y, cx, cy, paras, anchor = "t") => '<p:sp><p:nvSpPr><p:cNvPr id="' + id + '" name="' + name + '"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph ' + (type ? 'type="' + type + '" ' : "") + (idx ? 'idx="' + idx + '"' : "") + '/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + x + '" y="' + y + '"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm></p:spPr><p:txBody><a:bodyPr wrap="square" anchor="' + anchor + '"><a:normAutofit/></a:bodyPr><a:lstStyle/>' + paras + "</p:txBody></p:sp>";
  const slideXml = [];
  slideXml.push(sld(ph(2, "标题", "title", 0, 914400, 2057400, 10363200, 1371600, '<a:p><a:pPr algn="ctr"/>' + prun(ttl, 4000, { b: true, color: "1F3A2E" }) + "</a:p>", "ctr") + ph(3, "日期", "", 1, 914400, 3657600, 10363200, 685800, '<a:p><a:pPr marL="0" indent="0" algn="ctr"><a:buNone/></a:pPr>' + prun(dateCN, 2000, { color: "666666" }) + "</a:p>", "t")));
  for (const s of slides) {
    let shapes = ph(2, "标题", "title", 0, 609600, 365760, 10972800, 914400, '<a:p><a:pPr algn="l"/>' + prun(s.title, 3200, { b: true, color: "1F3A2E" }) + "</a:p>", "ctr");
    if (s.lines) {
      const paras = s.lines.map((l) => {
        if (l.k === "code") return '<a:p><a:pPr marL="0" indent="0"><a:spcBef><a:spcPts val="200"/></a:spcBef><a:buNone/></a:pPr>' + (l.text ? prun(l.text, 1600, { mono: true }) : '<a:endParaRPr lang="en-US" sz="1600"/>') + "</a:p>";
        const ind = 342900 + (l.lv || 0) * 342900;
        const bu = l.ord ? "<a:buNone/>" : '<a:buFont typeface="Arial"/><a:buChar char="' + (l.lv ? "–" : "•") + '"/>';
        return '<a:p><a:pPr marL="' + (l.ord ? ind - 342900 : ind) + '" indent="' + (l.ord ? 0 : -342900) + '"><a:spcBef><a:spcPts val="600"/></a:spcBef>' + bu + "</a:pPr>" + prun(l.text, 1800, { b: l.b, i: l.i }) + "</a:p>";
      }).join("");
      shapes += ph(3, "正文", "", 1, 609600, 1371600, 10972800, 4846320, paras);
    } else if (s.table) {
      const t = s.table, n = Math.max(t.head.length, ...t.rows.map((r) => r.length), 1), cw = Math.floor(10972800 / n), fs = n <= 4 ? 1600 : n <= 7 ? 1400 : 1200;
      const ln = (k) => "<a:" + k + ' w="9525"><a:solidFill><a:srgbClr val="999999"/></a:solidFill></a:' + k + ">";
      const tc = (txt, head) => '<a:tc><a:txBody><a:bodyPr/><a:lstStyle/><a:p>' + (txt ? prun(txt, fs, { b: head }) : '<a:endParaRPr lang="zh-CN" sz="' + fs + '"/>') + '</a:p></a:txBody><a:tcPr marL="91440" marR="91440" marT="45720" marB="45720" anchor="ctr">' + ln("lnL") + ln("lnR") + ln("lnT") + ln("lnB") + (head ? '<a:solidFill><a:srgbClr val="E8F3EE"/></a:solidFill>' : '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>') + "</a:tcPr></a:tc>";
      const tr = (cells, head) => { const c = cells.slice(); while (c.length < n) c.push(""); return '<a:tr h="457200">' + c.map((x) => tc(x, head)).join("") + "</a:tr>"; };
      shapes += '<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="3" name="表格"/><p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr><p:nvPr/></p:nvGraphicFramePr><p:xfrm><a:off x="609600" y="1463040"/><a:ext cx="' + cw * n + '" cy="' + 457200 * (t.rows.length + 1) + '"/></p:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr firstRow="1" bandRow="1"/><a:tblGrid>' + Array.from({ length: n }, () => '<a:gridCol w="' + cw + '"/>').join("") + "</a:tblGrid>" + tr(t.head, true) + t.rows.map((r) => tr(r, false)).join("") + "</a:tbl></a:graphicData></a:graphic></p:graphicFrame>";
    }
    slideXml.push(sld(shapes));
  }
  const N = slideXml.length, REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  const rels = (arr) => XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + arr.map((r) => '<Relationship Id="' + r[0] + '" Type="' + REL + r[1] + '" Target="' + r[2] + '"/>').join("") + "</Relationships>";
  const clr = (n, v) => "<a:" + n + '><a:srgbClr val="' + v + '"/></a:' + n + ">";
  const theme = XMLH + '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="OpenManus"><a:themeElements><a:clrScheme name="OM"><a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1><a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>' + clr("dk2", "1F3A2E") + clr("lt2", "E8F3EE") + clr("accent1", "2E7D5B") + clr("accent2", "4F8FBF") + clr("accent3", "E0A030") + clr("accent4", "C65D5D") + clr("accent5", "7B6BB5") + clr("accent6", "5BA8A0") + clr("hlink", "0563C1") + clr("folHlink", "7B6BB5") + '</a:clrScheme><a:fontScheme name="OM"><a:majorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface="Microsoft YaHei"/></a:majorFont><a:minorFont><a:latin typeface="Microsoft YaHei"/><a:ea typeface="Microsoft YaHei"/><a:cs typeface="Microsoft YaHei"/></a:minorFont></a:fontScheme><a:fmtScheme name="OM"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln><a:ln w="28575"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';
  const lstLv = '<a:lvl1pPr marL="0" indent="0" algn="l"><a:defRPr sz="1800"/></a:lvl1pPr>';
  const master = XMLH + "<p:sldMaster " + P_NS + '><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>' + grp + "</p:spTree></p:cSld>" + '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle>' + lstLv.replace("1800", "3200") + "</p:titleStyle><p:bodyStyle>" + lstLv + "</p:bodyStyle><p:otherStyle>" + lstLv + "</p:otherStyle></p:txStyles></p:sldMaster>";
  const layout = XMLH + "<p:sldLayout " + P_NS + ' type="obj" preserve="1"><p:cSld name="标题和内容"><p:spTree>' + grp + '<p:sp><p:nvSpPr><p:cNvPr id="2" name="标题"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="609600" y="365760"/><a:ext cx="10972800" cy="914400"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="zh-CN"/></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="内容"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph idx="1"/></p:nvPr></p:nvSpPr><p:spPr><a:xfrm><a:off x="609600" y="1371600"/><a:ext cx="10972800" cy="4846320"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="zh-CN"/></a:p></p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>';
  const pres = XMLH + "<p:presentation " + P_NS + '><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>' + slideXml.map((_, i) => '<p:sldId id="' + (256 + i) + '" r:id="rId' + (3 + i) + '"/>').join("") + '</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>';
  const files = [
    { name: "[Content_Types].xml", data: XMLH + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' + slideXml.map((_, i) => '<Override PartName="/ppt/slides/slide' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>').join("") + "</Types>" },
    { name: "_rels/.rels", data: XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
    { name: "docProps/core.xml", data: corePropsXml(ttl) },
    { name: "ppt/presentation.xml", data: pres },
    { name: "ppt/_rels/presentation.xml.rels", data: rels([["rId1", "slideMaster", "slideMasters/slideMaster1.xml"], ["rId2", "theme", "theme/theme1.xml"], ...slideXml.map((_, i) => ["rId" + (3 + i), "slide", "slides/slide" + (i + 1) + ".xml"])]) },
    { name: "ppt/slideMasters/slideMaster1.xml", data: master },
    { name: "ppt/slideMasters/_rels/slideMaster1.xml.rels", data: rels([["rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"], ["rId2", "theme", "../theme/theme1.xml"]]) },
    { name: "ppt/slideLayouts/slideLayout1.xml", data: layout },
    { name: "ppt/slideLayouts/_rels/slideLayout1.xml.rels", data: rels([["rId1", "slideMaster", "../slideMasters/slideMaster1.xml"]]) },
    { name: "ppt/theme/theme1.xml", data: theme }
  ];
  slideXml.forEach((x, i) => { files.push({ name: "ppt/slides/slide" + (i + 1) + ".xml", data: x }); files.push({ name: "ppt/slides/_rels/slide" + (i + 1) + ".xml.rels", data: rels([["rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"]]) }); });
  return { bytes: zipStore(files), slides: N };
}

/* ---------- 表格提取（XLSX / CSV 共用）：只整理原文明确出现的内容，不推断、不补数据 ---------- */
const RE_NUM = /^[-+]?(?:0|[1-9]\d{0,14}|[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d+)?$/;
const RE_UNITNUM = /^(?:[¥￥$]\s*[-+]?[\d,]+(?:\.\d+)?|[-+]?[\d,]+(?:\.\d+)?\s*(?:元|万元|万|块|%|％|¥|￥))$/;
function sheetSafeName(s, used) {
  let n = Array.from(String(s || "").replace(/[\[\]:*?\/\\]/g, "").trim()).slice(0, 31).join("").trim();
  if (!n) n = "表" + (used.size + 1);
  let k = 2, base = n;
  while (used.has(n.toLowerCase())) { const suf = "-" + k++; n = Array.from(base).slice(0, 31 - suf.length).join("") + suf; }
  used.add(n.toLowerCase()); return n;
}
function extractTables(md) {
  const blocks = parseMd(md), tabs = [];
  blocks.forEach((b, i) => {
    if (b.t !== "table") return;
    const prev = blocks[i - 1]; let name = "";
    if (prev && prev.t === "h") name = plainOf(prev.text);
    else if (prev && prev.t === "p" && /^\*\*[^*\n]+\*\*[：:]?$/.test(prev.text.trim())) name = plainOf(prev.text).replace(/[：:]$/, "");
    tabs.push({ name, head: b.head.map(plainOf), rows: b.rows.map((r) => r.map(plainOf)) });
  });
  return tabs;
}
function extractNumberTable(md) {
  const rows = [], lines = [];
  parseMd(md).forEach((b) => {
    if (b.t === "list") b.items.forEach((it) => lines.push(plainOf(it.text)));
    else if (b.t === "p" || b.t === "quote") plainOf(b.text).split("\n").forEach((l) => lines.push(l));
  });
  const RE = /^\s*(.*?)[\s:：=]*[¥￥$]?\s*([-+]?\d[\d,]*(?:\.\d+)?)\s*(元|万元|万|块|%|％|个|人|次|天|月|年|斤|吨|kg|KG)?\s*(.*)$/;
  for (const ln of lines) for (const seg of ln.split(/[，；;、。]|,(?!\d{3}(?!\d))/)) {
    const m = RE.exec(seg); if (!m) continue;
    let label = m[1].replace(/[\s:：=（(]+$/, "").trim();
    if (/[:：]\s*\S/.test(label)) label = label.replace(/^.*[:：]\s*/, "").trim();       // “本月：收入” → “收入”
    if (!label || cpLen(label) > 30 || !/[^\d\s.\-+]/.test(label) || /第$/.test(label)) continue;
    const amt = m[2].replace(/,/g, "");
    if (!RE_NUM.test(amt)) continue;
    rows.push([label, amt, ((m[3] || "") + (m[4] ? " " + m[4].trim() : "")).trim()]);
  }
  return rows.length ? { name: "数据整理", head: ["项目", "金额", "备注"], rows, derived: true } : null;
}
function planTables(md) {
  const tabs = extractTables(md), notes = [];
  if (tabs.length) return { tabs, notes };
  const d = extractNumberTable(md);
  if (d) { notes.push("内容里没有表格，已把原文里明确写出的“项目 + 数字”整理成表（项目 / 金额 / 备注），请核对；没有推断或补充任何数据"); return { tabs: [d], notes }; }
  const lines = [];
  parseMd(md).forEach((b) => { if (b.t === "code") b.text.split("\n").forEach((l) => l.trim() && lines.push(l)); else if (b.t === "list") b.items.forEach((it) => lines.push(plainOf(it.text))); else if (b.t === "h") lines.push(plainOf(b.text)); else if (b.t !== "hr" && b.t !== "table") plainOf(b.text).split("\n").forEach((l) => l.trim() && lines.push(l)); });
  notes.push("内容里没有表格，也没有明确的“项目 + 数字”，已按原文逐行放进表格，没有推断任何数据");
  return { tabs: [{ name: "内容", head: ["原文"], rows: lines.map((l) => [l]) }], notes };
}

/* ---------- XLSX ---------- */
const colName = (i) => { let s = ""; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const dispW = (s) => { let w = 0; for (const ch of String(s).split("\n").reduce((a, b) => (b.length > a.length ? b : a), "")) w += ch.charCodeAt(0) > 255 ? 2 : 1; return w; };
function buildXlsx(md, title) {
  const { tabs, notes } = planTables(md), used = new Set(); let unitCells = 0;
  const sheets = tabs.map((t) => {
    const n = Math.max(t.head.length, ...t.rows.map((r) => r.length), 1), name = sheetSafeName(t.name, used), widths = Array(n).fill(8);
    const cellXml = (v, r, c, head) => {
      const ref = colName(c) + (r + 1); v = String(v == null ? "" : v); widths[c] = Math.max(widths[c], Math.min(60, dispW(v) + 3));
      if (head) return '<c r="' + ref + '" s="1" t="inlineStr"><is><t xml:space="preserve">' + xe(v) + "</t></is></c>";
      if (RE_NUM.test(v.trim()) && !/^[-+]?\d{11,}$/.test(v.trim())) return '<c r="' + ref + '" s="2"><v>' + parseFloat(v.trim().replace(/,/g, "")) + "</v></c>";
      if (RE_UNITNUM.test(v.trim())) unitCells++;
      return v === "" ? '<c r="' + ref + '" s="3"/>' : '<c r="' + ref + '" s="3" t="inlineStr"><is><t xml:space="preserve">' + xe(v) + "</t></is></c>";
    };
    const all = [t.head, ...t.rows];
    const rowsXml = all.map((r, ri) => { const c = r.slice(); while (c.length < n) c.push(""); return '<row r="' + (ri + 1) + '">' + c.map((v, ci) => cellXml(v, ri, ci, ri === 0)).join("") + "</row>"; }).join("");
    const ref = "A1:" + colName(n - 1) + all.length;
    const xml = XMLH + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="' + ref + '"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>' + widths.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join("") + "</cols><sheetData>" + rowsXml + '</sheetData><autoFilter ref="' + ref + '"/></worksheet>';
    return { name, xml, ref };
  });
  if (unitCells) notes.push("有 " + unitCells + " 个单元格带单位或符号（如 5000元、¥300），已保留原文，没有转成数值；要求和请先去掉单位");
  const styles = XMLH + '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Microsoft YaHei"/><family val="2"/></font><font><b/><sz val="11"/><name val="Microsoft YaHei"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F3EE"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBBBBBB"/></left><right style="thin"><color rgb="FFBBBBBB"/></right><top style="thin"><color rgb="FFBBBBBB"/></top><bottom style="thin"><color rgb="FFBBBBBB"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const wb = XMLH + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>' + sheets.map((s, i) => '<sheet name="' + xe(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join("") + "</sheets><definedNames>" + sheets.map((s, i) => '<definedName name="_xlnm._FilterDatabase" localSheetId="' + i + '" hidden="1">\'' + xe(s.name.replace(/'/g, "''")) + "'!" + s.ref.replace(/([A-Z]+)(\d+)/g, "$$$1$$$2") + "</definedName>").join("") + "</definedNames></workbook>";
  const REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
  const files = [
    { name: "[Content_Types].xml", data: XMLH + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' + sheets.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("") + "</Types>" },
    { name: "_rels/.rels", data: XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + REL + 'officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
    { name: "docProps/core.xml", data: corePropsXml(title) },
    { name: "xl/workbook.xml", data: wb },
    { name: "xl/_rels/workbook.xml.rels", data: XMLH + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="' + REL + 'worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join("") + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="' + REL + 'styles" Target="styles.xml"/></Relationships>' },
    { name: "xl/styles.xml", data: styles }
  ];
  sheets.forEach((s, i) => files.push({ name: "xl/worksheets/sheet" + (i + 1) + ".xml", data: s.xml }));
  return { bytes: zipStore(files), notes, sheets: sheets.length };
}

/* ---------- CSV：UTF-8 带 BOM，只导第 1 个表 ---------- */
function csvField(v) {
  v = String(v == null ? "" : v);
  if (/^[=@]/.test(v) || /^[+-](?![\d.])/.test(v)) v = "'" + v;          // 防 Excel 公式注入
  return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
}
function buildCsv(md) {
  const { tabs, notes } = planTables(md), t = tabs[0];
  if (tabs.length > 1) notes.push("CSV 仅支持单表，如需全部表格请下载 .xlsx");
  const n = Math.max(t.head.length, ...t.rows.map((r) => r.length), 1);
  const line = (r) => { const c = r.slice(); while (c.length < n) c.push(""); return c.map(csvField).join(","); };
  return { text: "﻿" + [line(t.head), ...t.rows.map(line)].join("\r\n") + "\r\n", notes };
}

/* ---------- HTML：按白名单从解析结果生成（不是字符串删标签），样式由系统模板提供 ---------- */
const he = (s) => String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function htmlInline(text, st) {
  return parseInline(dropDanger(text)).map((r) => {
    if (r.br) return "<br>";
    let h = he(r.t);
    if (r.img) { st.img = true; const u = SAFE_URL(r.img); return u ? '<a href="' + he(u) + '" target="_blank" rel="noopener noreferrer nofollow">' + h + "</a>" : h; }   // 图片不自动加载，只给链接
    if (r.code) h = "<code>" + h + "</code>";
    if (r.b) h = "<strong>" + h + "</strong>";
    if (r.i) h = "<em>" + h + "</em>";
    if (r.href) h = '<a href="' + he(r.href) + '" target="_blank" rel="noopener noreferrer nofollow">' + h + "</a>";
    return h;
  }).join("");
}
const HTML_CSS = "body{margin:0;background:#f5f7f6;color:#1f2a24;font:16px/1.75 'Microsoft YaHei','PingFang SC','Noto Sans CJK SC','Noto Sans SC',system-ui,sans-serif}article{max-width:860px;margin:0 auto;padding:32px 28px 64px;background:#fff;min-height:100vh;box-sizing:border-box}h1,h2,h3,h4,h5,h6{line-height:1.35;margin:1.6em 0 .6em;color:#14301f}h1{font-size:1.9em;border-bottom:2px solid #e8f3ee;padding-bottom:.3em}h2{font-size:1.5em}h3{font-size:1.25em}p{margin:.7em 0}ul,ol{padding-left:1.6em}li{margin:.25em 0}blockquote{margin:1em 0;padding:.4em 1em;border-left:4px solid #9bbfae;background:#f4f9f6;color:#455}hr{border:0;border-top:1px solid #ccd}table{border-collapse:collapse;width:100%;margin:1em 0;font-size:.95em}th,td{border:1px solid #c8d3cd;padding:8px 10px;text-align:left;vertical-align:top}th{background:#e8f3ee;font-weight:700}pre{background:#f2f2f2;padding:12px 14px;border-radius:6px;overflow:auto;line-height:1.5}code{font-family:Consolas,'SFMono-Regular','Noto Sans Mono CJK SC',monospace;font-size:.92em}:not(pre)>code{background:#f2f2f2;padding:1px 5px;border-radius:4px}a{color:#0b6b4a;word-break:break-all}@media print{body{background:#fff}article{max-width:none;padding:0}pre,blockquote,table{break-inside:avoid}}";
function buildHtml(md, title) {
  const st = {};
  const body = parseMd(md).map((b) => {
    if (b.t === "h") return "<h" + b.lv + ">" + htmlInline(b.text, st) + "</h" + b.lv + ">";
    if (b.t === "p") { if (!htmlInline(b.text, st).replace(/<br>/g, "").trim()) return ""; const bq = /^<blockquote[^>]*>([\s\S]*)<\/blockquote>$/i.exec(b.text.trim()); return bq ? "<blockquote><p>" + htmlInline(bq[1], st) + "</p></blockquote>" : "<p>" + htmlInline(b.text, st) + "</p>"; }
    if (b.t === "quote") return "<blockquote><p>" + htmlInline(b.text, st) + "</p></blockquote>";
    if (b.t === "hr") return "<hr>";
    if (b.t === "code") return "<pre><code>" + he(b.text) + "</code></pre>";
    if (b.t === "table") return "<table><thead><tr>" + b.head.map((c) => "<th>" + htmlInline(c, st) + "</th>").join("") + "</tr></thead><tbody>" + b.rows.map((r) => "<tr>" + r.map((c) => "<td>" + htmlInline(c, st) + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
    if (b.t === "list") {
      let out = "", stack = [];
      b.items.forEach((it) => {
        const tag = it.ord ? "ol" : "ul";
        if (!stack.length) { out += "<" + tag + ">"; stack.push(tag); }
        else if (it.lv > stack.length - 1) { out += "<" + tag + ">"; stack.push(tag); }
        else { while (stack.length - 1 > it.lv) out += "</li></" + stack.pop() + ">"; out += "</li>"; }
        out += "<li>" + htmlInline(it.text, st);
      });
      while (stack.length) out += "</li></" + stack.pop() + ">";
      return out;
    }
    return "";
  }).join("\n");
  const html = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:"><title>' + he(title || "文档") + "</title><style>" + HTML_CSS + "</style></head><body><article>\n" + body + "\n</article></body></html>\n";
  return { html, notes: st.img ? ["图片没有自动加载，已转成 [图片：地址] 链接，点开才会访问"] : [] };
}

/* ---------- 入口 ---------- */
const EXP_MIME = { docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv; charset=utf-8", html: "text/html; charset=utf-8" };
const EXP_EXPOSE = "Content-Disposition,X-Filename,part,totalParts,X-Export-Notes,X-Export-Format";
async function handleExport(request, fmt) {
  const err = (status, msg) => json({ ok: false, msg }, status);
  if (!EXP_MIME[fmt]) return err(404, "不支持的导出格式：" + fmt);
  const raw = await request.text().catch(() => "");
  if (raw.length > 700000) return err(413, "请求太大（超过 700KB），请缩短内容后再导出");
  let b; try { b = JSON.parse(raw); } catch { return err(400, "请求不是有效的 JSON"); }
  const md = expNorm(b.markdown), title = String(b.title || "").trim().slice(0, 200);
  const sp = splitParts(md);
  if (!sp.ok) return err(sp.total > EXP_MAX_CP ? 413 : 400, sp.msg);
  const part = b.part == null || b.part === "" ? 1 : Number(b.part);
  if (!Number.isInteger(part) || part < 1 || part > sp.parts.length) return json({ ok: false, msg: "part 越界：共 " + sp.parts.length + " 部分，收到 part=" + b.part, totalParts: sp.parts.length }, 400);
  const total = sp.parts.length, pmd = sp.parts[part - 1];
  let base = expFileBase(title, b.filename); if (total > 1) base += "-第" + part + "部分";
  let body, notes = [];
  try {
    if (fmt === "docx") body = buildDocx(pmd, title);
    else if (fmt === "pptx") { const r = buildPptx(pmd, title); body = r.bytes; if (r.slides < 1) notes.push("没有可放进幻灯片的正文，只生成了封面"); }
    else if (fmt === "xlsx") { const r = buildXlsx(pmd, title); body = r.bytes; notes = r.notes; }
    else if (fmt === "csv") { const r = buildCsv(pmd); body = r.text; notes = r.notes; }
    else { const r = buildHtml(pmd, title); body = r.html; notes = r.notes; }
  } catch (e) { return err(500, "生成失败（" + fmt + "）：" + String((e && e.message) || "内部错误").slice(0, 120)); }
  const fname = base + "." + fmt;
  return new Response(body, { status: 200, headers: { ...CORS, "Content-Type": EXP_MIME[fmt], "Content-Disposition": 'attachment; filename="export.' + fmt + "\"; filename*=UTF-8''" + encodeURIComponent(fname), "X-Filename": encodeURIComponent(fname), "part": String(part), "totalParts": String(total), "X-Export-Notes": encodeURIComponent(notes.join("\n")), "X-Export-Format": fmt, "Access-Control-Expose-Headers": EXP_EXPOSE, "Cache-Control": "no-store" } });
}
/* ===== /EXP_SERVER ===== */



// ---------- v49 读取链接正文：先直连；读到的是空壳 / 靠脚本渲染时，再走免费的 Jina Reader（会执行脚本）兜底 ----------
const RP_MAX = 12000;
const rpDecode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(+n); } catch { return ""; } }).replace(/&#x([0-9a-f]+);/gi, (_, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch { return ""; } });
function rpMeta(html, keys) {
  for (const k of keys) {
    const m = html.match(new RegExp("<meta[^>]+(?:property|name)=[\"']" + k + "[\"'][^>]*content=[\"']([^\"']*)[\"']", "i")) || html.match(new RegExp("<meta[^>]+content=[\"']([^\"']*)[\"'][^>]*(?:property|name)=[\"']" + k + "[\"']", "i"));
    if (m && m[1].trim()) return rpDecode(m[1]).trim();
  }
  return "";
}
function rpHtml(html) {
  const title = rpMeta(html, ["og:title", "twitter:title"]) || rpDecode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1]).replace(/\s+/g, " ").trim();
  const desc = rpMeta(html, ["og:description", "description", "twitter:description"]);
  const body = rpDecode(html.replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?(p|div|li|ul|ol|br|tr|h[1-6]|section|article|blockquote|pre)\b[^>]*>/gi, "\n").replace(/<[^>]+>/g, " ")).replace(/[ \t ]+/g, " ").replace(/\n\s*/g, "\n").trim();
  return { title: title.slice(0, 120), desc: desc.slice(0, 600), body };
}
const RP_LOGIN = /请登录|登录后|扫码登录|登录查看|sign in to|log in to continue|please (log|sign) in/i;
const rpPrivate = (h) => /^(localhost|0\.0\.0\.0|\[?::1\]?)$/i.test(h) || /\.(local|internal|localhost)$/i.test(h) || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
async function readPage(target) {
  let u; try { u = new URL(target); } catch { return { ok: false, status: 400, msg: "链接格式不对" }; }
  if (!/^https?:$/.test(u.protocol) || rpPrivate(u.hostname)) return { ok: false, status: 400, msg: "这个地址不能读取" };
  const fail = (extra) => ({ ok: true, read_ok: false, url: target, user_msg: "这个页面要登录或只能在 App 里打开，读不到正文。可以把正文复制进「我的资料」，再来问我" + (extra ? "（" + extra + "）" : ""), content: "" });
  let direct = null, why = "";
  try {
    const r = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36", "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5", "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.5" }, signal: T(10000), redirect: "follow" });
    if (!r.ok) why = "状态 " + r.status;
    else {
      const ct = String(r.headers.get("content-type") || "");
      const raw = (await r.text()).slice(0, 1500000);
      if (/text\/plain|json|markdown/i.test(ct) && !/<html/i.test(raw.slice(0, 500))) direct = { title: "", desc: "", body: raw.replace(/\s+\n/g, "\n").trim() };
      else direct = rpHtml(raw);
      if (/\/login|passport|signin/i.test(r.url || "") ) { direct.body = ""; why = "被跳转到登录页"; }
    }
  } catch (e) { why = e.message || "直连失败"; }
  const good = (d) => d && (d.body.length >= 300 || (d.desc.length >= 60 && d.body.length >= 80)) && !(d.body.length < 800 && RP_LOGIN.test(d.body));
  if (good(direct)) {
    const content = (direct.desc && !direct.body.includes(direct.desc.slice(0, 30)) ? "摘要：" + direct.desc + "\n" : "") + direct.body;
    return { ok: true, read_ok: true, url: target, title: direct.title, content: content.slice(0, RP_MAX), source: "direct" };
  }
  // 兜底：Jina Reader（第三方，免费，会执行页面脚本）。带 ticket / token / 密钥 这类参数的链接不外发
  if (/[?&#](ticket|token|key|sig|signature|auth|session|sid|password|pwd|code)=/i.test(target)) return fail("链接里带登录凭证，没有外发给第三方读取");
  try {
    const r = await fetch("https://r.jina.ai/" + target, { headers: { "Accept": "text/plain", "X-Return-Format": "markdown" }, signal: T(18000) });
    const t = (await r.text()).trim();
    if (r.ok && t && !/Target URL returned error|Warning: .*(login|captcha)/i.test(t.slice(0, 300))) {
      const tm = t.match(/^Title:\s*(.*)$/m), cm = t.indexOf("Markdown Content:");
      const body = (cm >= 0 ? t.slice(cm + 17) : t).trim();
      if (body.length >= 200 && !(body.length < 800 && RP_LOGIN.test(body))) return { ok: true, read_ok: true, url: target, title: (tm ? tm[1] : (direct && direct.title) || "").slice(0, 120), content: body.slice(0, RP_MAX), source: "jina" };
    }
  } catch (e) { why = why || e.message; }
  return fail(why);
}

// ---------- v61：地点选择 + 路线规划（前端「地点与路线」窗口用）：输入地名 → 列出各城市的同名地点 → 点选 → 出路线（公交带首末班）----------
const gcjToBd = (lat, lng) => { const X = (Math.PI * 3000) / 180, z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X), th = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X); return { lat: z * Math.sin(th) + 0.006, lng: z * Math.cos(th) + 0.0065 }; };
const ptToBd = (p) => { const lat = Number(p && p.lat), lng = Number(p && p.lng); if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new ConnErr("坐标不对", 400); const cs = String((p && p.cs) || "bd09ll"); return cs === "gcj02" ? gcjToBd(lat, lng) : cs === "wgs84" ? wgsToBd(lat, lng) : { lat, lng }; };
// ---------- v66：一步出结果的辅助 ----------
// 同名地点（如“人民广场”）：用户说了城市 > 离定位最近 > 排在前面（不再写死默认城市）
const bothCs = (lat, lng, cs) => cs === "gcj02" ? { gcj: { lat, lng }, bd: gcjToBd(lat, lng) } : cs === "wgs84" ? (() => { const d = gcjDelta(lat, lng); return { gcj: { lat: lat + d.dLat, lng: lng + d.dLng }, bd: wgsToBd(lat, lng) }; })() : { bd: { lat, lng }, gcj: bdToGcj(lat, lng) };
const LINE_RE = /^(?:[A-Za-z]{0,3}\d+[A-Za-z]?(?:路|线|号线)?(?:区间|快线|内环|外环|夜班)?|.{1,8}(?:号线|线)|地铁.{1,8}|轨道交通.{1,8})$/;
const lineList = (addr, extra) => {
  const raw = [...(Array.isArray(extra) ? extra.map((x) => (typeof x === "string" ? x : (x && x.name) || "")) : []), ...String(addr || "").split(/[;；]/)];
  const a = raw.map((x) => String(x).replace(/\(.*?\)|（.*?）/g, "").trim()).filter((x) => x && x.length <= 14 && LINE_RE.test(x));
  return [...new Set(a)].slice(0, 12);
};
// 同名地点自动挑最合适的 1 个，其余给“不是这个？”用：用户说了城市 > 定位所在城市 > 默认城市 > 名字完全一致 > 排在前面
function pickBestPlace(list, q, ctx) {
  const L = (list || []).filter((x) => x && x.name && Number.isFinite(Number(x.lat)) && Number.isFinite(Number(x.lng)));
  if (!L.length) return null;
  const qq = String(q || "").trim(), hay = (x) => [x.city, x.district, x.address].filter(Boolean).join(" ");
  const rel = L.filter((x) => x.name === qq || x.name.includes(qq) || qq.includes(x.name)), pool = rel.length ? rel : L;
  const ctxCity = String((ctx && ctx.city) || "");
  const score = (x, i) => {
    const h = hay(x), m = /([^\s·市省]{2,4})市/.exec(h), city = (m && m[1]) || String(x.city || "").replace(/市$/, "");
    let s = -i;
    if (x.name === qq) s += 30; else if (qq.includes(x.name)) s += 15;
    if (city && qq.includes(city)) s += 300;
    if (ctxCity && city && ctxCity.includes(city)) s += 40;
    if (ctx && Number.isFinite(Number(ctx.lat))) { const R = 6371, rd = (a) => (a * Math.PI) / 180, dl = rd(x.lat - ctx.lat), dn = rd(x.lng - ctx.lng), km = 2 * R * Math.asin(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(rd(ctx.lat)) * Math.cos(rd(x.lat)) * Math.sin(dn / 2) ** 2)); s += 120 - Math.min(120, km / 10); }
    return s;
  };
  const ranked = pool.map((x, i) => ({ x, s: score(x, i) })).sort((a, b) => b.s - a.s).map((o) => o.x);
  const best = ranked[0], seen = new Set([best.name + "|" + (best.city || "") + (best.district || "")]);
  const alts = [];
  for (const x of ranked.slice(1)) { const k = x.name + "|" + (x.city || "") + (x.district || ""); if (seen.has(k)) continue; seen.add(k); alts.push(x); if (alts.length >= 4) break; }
  return { best, alts };
}
async function placeSuggest(env, q) {
  const kv = env.KV, ck = "plsug:" + q;
  if (kv) { try { const c = await kv.get(ck, "json"); if (c && c.length) return { list: c, cached: true }; } catch {} }
  const out = [], notes = [], seen = new Set();
  const push = (x) => { if (!x.name || !Number.isFinite(x.lat) || !Number.isFinite(x.lng)) return; const k = x.name + "|" + x.city + "|" + x.lat.toFixed(3) + "," + x.lng.toFixed(3); if (seen.has(k)) return; seen.add(k); out.push(x); };
  const am = cAmapKit(env), tx = cTencentKit(env), bd = cBaiduKit(env);
  if (am) { try { const j = await am.suggest(q, ""); for (const t of j.tips || []) { const [lng, lat] = String(t.location || "").split(",").map(Number); push({ name: t.name, city: "", district: Array.isArray(t.district) ? "" : String(t.district || ""), address: Array.isArray(t.address) ? "" : String(t.address || ""), lat, lng, cs: "gcj02", src: "高德地图" }); } } catch (e) { notes.push("高德：" + cCl(e.message, 60)); } }
  if (tx) { try { const j = await tx.suggest(q, "全国"); for (const t of j.data || []) push({ name: t.title, city: t.city || t.province || "", district: t.district || "", address: t.address || "", lat: t.location && t.location.lat, lng: t.location && t.location.lng, cs: "gcj02", src: "腾讯地图" }); } catch (e) { notes.push("腾讯：" + cCl(e.message, 60)); } }
  if (bd && bdPlaceOn(env) && out.length < 3) { try { const j = await bd.call("place/v2/suggestion", `query=${cEu(q)}&region=${cEu("全国")}&city_limit=false&output=json&ret_coordtype=bd09ll`); for (const t of j.result || []) push({ name: t.name, city: t.city || "", district: t.district || "", address: t.address || "", lat: t.location && t.location.lat, lng: t.location && t.location.lng, cs: "bd09ll", src: "百度地图" }); } catch (e) { notes.push("百度：" + cCl(String(e.message).split(String(env.BAIDU_MAP_AK)).join("***"), 80)); } }
  // 高德 tips 没带城市时，用逆地理补不了（太费额度），这里留空，前端显示区县 / 地址
  const list = out.slice(0, 20);
  if (kv && list.length) { try { await kv.put(ck, JSON.stringify(list), { expirationTtl: 21600 }); } catch {} }
  return { list, notes };
}
// ---------- v78：附近查询按“真分类”搜 + 返回后二次校验 ----------
// amap：高德类型码（6 位，xx0000=大类、xxyy00=中类，写中类会带出下面的小类）；bd：百度 tag；tx：腾讯 category
// pre：返回点的 typecode 前缀白名单；typeRe：返回点的类型文字（高德 type / 百度 tag / 腾讯 category）必须匹配；
// nameRe：只在上游完全没给类型信息时才按名字判断（名字带“银行”但类型是停车场的一律丢掉）；bad：一律丢掉
const NEAR_CATS = {
  bank: { label: "银行", amap: ["160100", "160300"], pre: ["1601", "1603"], bd: "银行", bdTag: "银行,ATM", tx: "银行", typeRe: /银行|自动提款|ATM|信用社/i, nameRe: /银行|ATM|取款机|提款机|信用社|农商/i },
  subway: { label: "地铁站", amap: ["150500"], pre: ["1505"], bd: "地铁站", bdTag: "地铁站", tx: "地铁站", typeRe: /地铁/, nameRe: /地铁|轨道交通/, bad: /地铁线路|地铁\/轻轨|公交线路/ },
  bus: { label: "公交站", amap: ["150700"], pre: ["1507"], bd: "公交车站", bdTag: "公交车站", tx: "公交车站", typeRe: /公交|巴士/, nameRe: /公交|巴士|首末站|枢纽站/, bad: /公交线路/ },
  hospital: { label: "医院", amap: ["090100", "090200"], pre: ["0901", "0902"], bd: "医院", bdTag: "综合医院,专科医院", tx: "医院", typeRe: /医院|卫生院|社区卫生服务|医疗中心/, nameRe: /医院|卫生院|社区卫生服务中心|医疗中心/, bad: /宠物|动物|兽医|药店|药房|方舱|发热门诊|核酸/ },
  gas: { label: "加油站", amap: ["010100"], pre: ["0101"], bd: "加油站", bdTag: "加油加气站", tx: "加油站", typeRe: /加油|加气/, nameRe: /加油站|加气站|中石化|中石油|中国石化|中国石油|壳牌/, bad: /充电/ },
  charging: { label: "充电桩", amap: ["011100", "073000"], pre: ["011100", "011102", "011103", "0730"], bd: "充电站", bdTag: "充电站,电动自行车充电站", tx: "充电站", typeRe: /充电/, nameRe: /充电/ },
  parking: { label: "停车场", amap: ["150900"], pre: ["1509"], bd: "停车场", bdTag: "停车场", tx: "停车场", typeRe: /停车/, nameRe: /停车/ },
  bike: { label: "公共自行车站", amap: [], pre: [], kw: "公共自行车", bd: "公共自行车", tx: "公共自行车", typeRe: /自行车|单车/, nameRe: /自行车|单车/, nameOk: true },
  pharmacy: { label: "药店", amap: ["090601"], pre: ["090601"], bd: "药店", bdTag: "药店", tx: "药店", typeRe: /药店|药房/, nameRe: /药房|药店|大药房|药局/, bad: /保健品|医疗器械|眼镜/ },
  supermarket: { label: "超市", amap: ["060400"], pre: ["0604"], bd: "超市", bdTag: "超市", tx: "超市", typeRe: /超级市场|超市/, nameRe: /超市|超级市场|联华|华联|物美|大润发|家乐福|沃尔玛|永辉|盒马/ },
  toilet: { label: "公共厕所", amap: ["200300"], pre: ["2003"], bd: "公共厕所", bdTag: "公共厕所", tx: "公共厕所", typeRe: /厕所|洗手间|卫生间/, nameRe: /厕所|洗手间|公厕|卫生间/ },
  restaurant: { label: "餐厅", amap: ["050100", "050200", "050300"], pre: ["0501", "0502", "0503"], bd: "餐厅", bdTag: "中餐厅,外国餐厅,小吃快餐店", tx: "餐厅", typeRe: /中餐厅|外国餐厅|快餐厅|小吃快餐|餐厅|餐馆|饭店/, nameRe: /餐厅|餐馆|饭店|酒楼|农家乐|小吃|面馆|食府|火锅/ },
  hotel: { label: "酒店", amap: ["100100"], pre: ["1001"], bd: "酒店", bdTag: "酒店", tx: "酒店", typeRe: /宾馆|酒店|旅馆|招待所/, nameRe: /酒店|宾馆|旅馆|旅社|招待所|客栈/ },
};
for (const [k, v] of Object.entries(NEAR_CATS)) v.key = k;
const NEAR_KW = [[/银行|ATM|取款机|自动取款|提款机/i, "bank"], [/地铁/, "subway"], [/公交|巴士/, "bus"], [/医院/, "hospital"], [/加油/, "gas"], [/充电/, "charging"], [/停车/, "parking"], [/自行车|单车/, "bike"], [/药店|药房/, "pharmacy"], [/超市/, "supermarket"], [/厕所|洗手间|公厕/, "toilet"], [/餐厅|餐馆|饭店|农家乐/, "restaurant"], [/酒店|宾馆/, "hotel"]];
const nearCatOf = (key, kw) => { if (key && NEAR_CATS[key]) return NEAR_CATS[key]; const m = NEAR_KW.find(([re]) => re.test(String(kw || ""))); return m ? NEAR_CATS[m[1]] : null; };
const fmtRadius = (m) => { m = Math.round(Number(m) || 0); return m >= 1000 ? String(+(m / 1000).toFixed(1)) + " 公里" : m + " 米"; };
// 二次校验：这个点到底是不是用户要的类别（不是就丢，不凑数）
function nearCatOk(x, cat) {
  const name = String(x.name || ""), t = String(x.typeText || ""), code = String(x.typeCode || "");
  if (cat.bad && cat.bad.test(name + " " + t)) return false;
  if (code && cat.pre && cat.pre.length && code.split("|").some((c) => cat.pre.some((p) => c.startsWith(p)))) return true;
  if (cat.nameOk && cat.nameRe.test(name)) return true;
  if (t) return cat.typeRe.test(t);
  return cat.nameRe.test(name);
}
const NEAR_MEM = new Map();
async function nearCacheGet(env, key) {
  const m = NEAR_MEM.get(key); if (m) { if (m.exp > Date.now()) return m.v; NEAR_MEM.delete(key); }
  if (env.KV) { try { const v = await env.KV.get(key, "json"); if (Array.isArray(v)) return v; } catch {} }
  return null;
}
async function nearCachePut(env, key, v) {
  if (!Array.isArray(v)) return;
  if (NEAR_MEM.size > 300) NEAR_MEM.clear();
  NEAR_MEM.set(key, { v, exp: Date.now() + 600000 });
  if (env.KV) { try { await env.KV.put(key, JSON.stringify(v), { expirationTtl: 600 }); } catch {} }
}
async function placeNearby(env, keyword, center, radius, catKey, limit) {
  const kw = String(keyword || "").trim().slice(0, 40);
  const cat = nearCatOf(catKey, kw);
  if (!kw && !cat) throw new ConnErr("缺少周边查询关键词", 400);
  const r = Math.max(1, Math.min(5000, Math.round(Number(radius) || 500))), lim = Math.max(1, Math.min(10, Math.round(Number(limit) || 5)));
  const original = center && typeof center === "object" ? center : {};
  const lat = Number(original.lat), lng = Number(original.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new ConnErr("查询中心坐标不完整", 400);
  const cs = String(original.cs || "bd09ll");
  const bdLoc = ptToBd(original);
  const wgs = cs === "bd09ll" ? bdToWgs(lat, lng) : cs === "wgs84" ? { lat, lng } : { lat, lng };
  const gcjLoc = cs === "gcj02" ? { lat, lng } : (() => { const d = gcjDelta(wgs.lat, wgs.lng); return { lat: wgs.lat + d.dLat, lng: wgs.lng + d.dLng }; })();
  // v85：高德为主 → 腾讯为辅；百度默认没有 poi/around（BAIDU_PLACE=1 才有，排在高德后面）；腾讯额度用完（121）时 cTencentKit 返回 null，自动跳过
  const attempts = [["高德地图", cAmapKit(env), gcjLoc, "gcj02"], ["百度地图", cBaiduKit(env), bdLoc, "bd09ll"], ["腾讯地图", cTencentKit(env), gcjLoc, "gcj02"]];
  const hav = (a, b) => { const R = 6371000, rad = (v) => (v * Math.PI) / 180, dLa = rad(b.lat - a.lat), dLo = rad(b.lng - a.lng), h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
  const tried = [], notes = []; let hit = false;
  let result = null, provider = "", provCs = "", ctr = gcjLoc, answered = 0, rawTotal = 0, dropped = 0;
  for (const [name, kit, loc, pcs] of attempts) {
    if (!kit) continue;
    try {
      if (cat ? typeof kit.around !== "function" : typeof kit.poi !== "function") continue;   // v85：百度默认没有 poi / around，直接跳过
      // v85：上游结果缓存 10 分钟（键 = 服务商 + 类别/关键词 + 中心点取 3 位小数(约 110 米) + 半径）；命中后距离仍按本次真实中心重新算
      const ck = "near10:" + [name, cat ? cat.key : kw, loc.lat.toFixed(3), loc.lng.toFixed(3), r, cat ? "" : (original.city || original.region || "")].join("|");
      let arr = await nearCacheGet(env, ck);
      if (arr) hit = true;
      else {
        if (cat) arr = await kit.around(cat, { loc, radius: r });
        else { const x = await kit.poi(kw, { loc, radius: r, region: original.city || original.region || "" }); arr = (x && x.list) || []; }
        await nearCachePut(env, ck, arr);
      }
      answered++; tried.push(name); provider = name; provCs = pcs; ctr = loc; rawTotal += arr.length;
      const seen = [], kept = [];
      for (const x of arr) {
        const itemLat = Number(x.location && x.location.lat), itemLng = Number(x.location && x.location.lng);
        if (!Number.isFinite(itemLat) || !Number.isFinite(itemLng)) continue;
        if (cat && !nearCatOk(x, cat)) { dropped++; continue; }
        let distance = hav(loc, { lat: itemLat, lng: itemLng }); if (!Number.isFinite(distance)) distance = Number(x.detail_info && x.detail_info.distance);
        if (!(distance <= r)) { dropped++; continue; }   // 只留半径内的
        if (seen.some((s) => s.n === x.name && Math.abs(s.d - distance) < 20)) continue; seen.push({ n: x.name, d: distance });
        kept.push({ x, distance, itemLat, itemLng });
      }
      if (kept.length) { result = { kept, via: cat ? name + "分类检索（类型码）" : name + "周边检索" }; break; }
      notes.push(name + "：返回 " + arr.length + " 个，校验后 0 个");
    } catch (e) { tried.push(name); notes.push(name + "：" + cCl(String(e.message || e), 100)); }
  }
  if (notes.length) console.log("NEARBY_NOTES", cat ? cat.key : kw, notes.join(" | "));   // 上游原始报错只进日志，不给用户
  if (!result && !answered) throw new ConnErr("地图服务暂时没有响应（已试 " + (tried.join("、") || "无可用地图") + "），请稍后再试。", 502);
  const kept = result ? result.kept.sort((a, b) => a.distance - b.distance).slice(0, lim) : [];
  const list = kept.map(({ x, distance, itemLat, itemLng }) => {
    const title = String(x.name || "地点"), address = String(x.address || "");
    const both = bothCs(itemLat, itemLng, provCs);
    const lines = lineList(address, x.mapDetail && x.mapDetail.lines);
    const url = `https://api.map.baidu.com/marker?location=${both.bd.lat},${both.bd.lng}&title=${cEu(title)}&content=${cEu(address)}&output=html&src=webapp.openmanus.gateway`;
    return { name: title, address: lines.length ? "" : address, lines, distance, url, lat: itemLat, lng: itemLng, cs: provCs, bd: both.bd, gcj: both.gcj, location: { lat: itemLat, lng: itemLng }, type: String(x.typeText || ""), provider };
  });
  // v72：公交 / 地铁站每条线补首班末班（高德公交线路查询，只取真正经过这个站的线路；没配 AMAP_KEY 或没查到就写原因，不编时间）
  if (/公交|地铁|巴士/.test(kw + (cat ? cat.label : "")) && !/自行车|单车/.test(kw) && list.some((x) => x.lines.length)) {
    let city = String(original.city || original.region || "").replace(/市$/, "");
    if (!city) { const kit = cBaiduKit(env); if (kit) { try { const g = await kit.call("reverse_geocoding/v3/", `location=${bdLoc.lat.toFixed(6)},${bdLoc.lng.toFixed(6)}&output=json&extensions_poi=0`); city = String((g.result && g.result.addressComponent && g.result.addressComponent.city) || "").replace(/市$/, ""); } catch {} } }
    city = city || "上海";
    const names = [...new Set(list.flatMap((x) => x.lines.slice(0, 3)))].slice(0, 8);
    const got = new Map(await Promise.all(names.map(async (n) => [n, await amapBusLines(env, n, city)])));
    for (const x of list) x.times = x.lines.slice(0, 3).map((n) => { const ls = got.get(n); if (ls === null) return { name: n, note: "Worker 没配 AMAP_KEY" }; if (!ls || !ls.length) return { name: n, note: "高德没查到这条线" }; const t = pickLineTimes(ls, x.gcj); return t ? { name: n, first: t.first, last: t.last } : { name: n, note: "没对上经过这个站的线路" }; });
  }
  const label = cat ? cat.label : kw, radiusText = fmtRadius(r);
  let walkN = 0; try { walkN = list.length ? await walkRealAll(env, bothCs(lat, lng, cs), list) : 0; } catch {}
  return {
    walk_real: walkN, center: { name: original.name || "查询位置", city: original.city || original.region || "", address: original.address || "", lat, lng, cs, ...bothCs(lat, lng, cs) },
    cached: hit, keyword: label, cat: cat ? cat.key : "", classified: !!cat, radius: r, radiusText, count: list.length, list, provider: provider || "", tried, rawCount: rawTotal, dropped,
    headline: list.length ? `附近 ${radiusText}${label}（${list.length} 个）` : `附近 ${radiusText}没有找到${label}`,
    via: (result ? result.via : (tried.join("、") + "都查了，没有符合分类的")) + (hit ? "（10 分钟缓存，没耗额度）" : "")
  };
}
// v66：小地图（服务端带 AK 取图再转给前端，AK 不出现在浏览器里）：高德静态图 → 百度静态图；都不行前端会画示意图
async function placeStaticMap(env, c, pts) {
  const ok = (p) => p && p.bd && p.gcj && Number.isFinite(Number(p.bd.lat)) && Number.isFinite(Number(p.gcj.lng));
  if (!ok(c)) throw new ConnErr("缺少中心坐标", 400);
  const P = (Array.isArray(pts) ? pts : []).filter(ok).slice(0, 6);
  const amKey = String(env.AMAP_KEY || "").trim(), bdAk = String(env.BAIDU_MAP_AK || "").trim(), tries = [], errs = [];
  if (amKey) {
    const f = (p) => Number(p.gcj.lng).toFixed(6) + "," + Number(p.gcj.lat).toFixed(6);
    const mk = ["large,0x2d6a3f,0:" + f(c), ...P.map((p, i) => "mid,0xff7a00," + (i + 1) + ":" + f(p))].join("|");
    tries.push(["高德", `https://restapi.amap.com/v3/staticmap?size=750*400&scale=2&markers=${encodeURIComponent(mk)}&key=${amKey}`, [amKey]]);
  }
  if (bdAk) {
    const f = (p) => Number(p.bd.lng).toFixed(6) + "," + Number(p.bd.lat).toFixed(6);
    const st = ["l,0,0x2d6a3f", ...P.map((_, i) => "m," + (i + 1) + ",0xff7a00")].join("|");
    tries.push(["百度", `https://api.map.baidu.com/staticimage/v2?ak=${bdAk}&width=750&height=400&dpiType=ph&copyright=1&markers=${encodeURIComponent([c, ...P].map(f).join("|"))}&markerStyles=${encodeURIComponent(st)}`, [bdAk]]);
  }
  if (!tries.length) throw new ConnErr("没有配置地图 Key", 500);
  for (const [name, u, secrets] of tries) {
    try {
      mapLog("STATICMAP_REQ", name + " " + u, ...secrets);
      const r = await fetch(u, { signal: T(8000) }), type = r.headers.get("content-type") || "";
      if (r.ok && /^image\//i.test(type)) { const buf = await r.arrayBuffer(); if (buf.byteLength > 500) return { buf, type, via: name }; }
      errs.push(name + "：" + (r.ok ? "返回的不是图片" : "HTTP " + r.status));
    } catch (e) { errs.push(name + "：" + mapMask(e.message, ...secrets)); }
  }
  throw new ConnErr("静态地图取图失败｜" + errs.join("｜"), 502);
}
// ---------- v65：全局 location_context（聊天和地点面板共用 1 个，存 KV loc:{用户}） ----------
const LOC_TTL = 86400, LOC_PICK_KEEP_MS = 12 * 3600 * 1000;
function normLoc(x) {
  if (!x || typeof x !== "object") return null;
  const lat = Number(x.lat), lng = Number(x.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const source = x.source === "gps_auto" ? "gps_auto" : "picked";
  const cs = ["wgs84", "gcj02", "bd09ll"].includes(String(x.cs)) ? String(x.cs) : (/gps/.test(String(x.source || "")) || x.name === "我的位置" ? "wgs84" : "bd09ll");
  return { name: String(x.name || "我的位置").slice(0, 60), city: String(x.city || x.region || "").slice(0, 30), district: String(x.district || "").slice(0, 30), address: String(x.address || "").slice(0, 120), lat, lng, cs, source, at: Number(x.at) || Date.now() };
}
async function locLoad(env, user) {
  if (!env.KV || !user) return null;
  try { return normLoc(await env.KV.get("loc:" + user, "json")); } catch { return null; }
}
// 自动 GPS（gps_auto）不覆盖 12 小时内用户亲自选的地点；返回最终生效的那个
async function locSave(env, user, loc) {
  if (!env.KV || !user || !loc) return loc;
  try {
    const old = await locLoad(env, user);
    if (old && loc.source === "gps_auto" && old.source === "picked" && Date.now() - old.at < LOC_PICK_KEEP_MS) return old;
    if (old && old.lat === loc.lat && old.lng === loc.lng && old.name === loc.name && old.source === loc.source) return old;
    await env.KV.put("loc:" + user, JSON.stringify(loc), { expirationTtl: LOC_TTL });
  } catch {}
  return loc;
}
const NEAR_SELF = /^(?:我|现在我?|当前位置?|当前|这里|这儿|这|那里|我这里?|我现在|本地|此处|此地|我的位置|定位)$/;
function parseChatNearby(t) {
  const text = String(t || "").trim();
  if (!/(附近|周边|周围)/.test(text)) return null;
  const m = text.match(/^(.*?)(?:附近|周边|周围)(?:的)?\s*(.*)$/);
  let center = (m ? m[1] : "").replace(/^(?:请问|请|帮我|麻烦|我想知道|我想找|查一下|查查|查|看看|在|离)+/, "").trim();
  if (NEAR_SELF.test(center)) center = "";
  const cat = /(公共自行车|共享单车|自行车站|公交车站|公交站|公交|巴士站|地铁站|充电桩|充电站|停车场|停车位|银行|ATM|取款机|自动取款|医院|加油站|药店|药房|超市|公共厕所|厕所|公厕|餐厅|餐馆|饭店|酒店|宾馆|景点)/i.exec(text);
  if (center && !cat) return null;   // “某地附近好吃的”这类仍交给原来的检索
  const radiusMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(米|公里|km|m)/i);
  const radius = radiusMatch ? (/公里|km/i.test(radiusMatch[2]) ? Math.round(Number(radiusMatch[1]) * 1000) : Math.round(Number(radiusMatch[1]))) : 500;
  let keyword = (m ? m[2] : "").replace(/[？?。！!，,].*$/, "").replace(/[0-9]+(?:\.[0-9]+)?\s*(?:米|公里|km|m)(?:内|以内)?/gi, " ").replace(/(?:有几个|有多少个?|有哪些|哪里有|有没有|有什么|有|几个|多少|吗|呢|请问)/g, " ").replace(/^的+|的+$/g, "").replace(/\s+/g, " ").trim();
  if (cat) {
    const c = cat[1];
    if (!keyword || /^(?:的|我|这|附近|周边|周围)$/.test(keyword)) keyword = /充电/.test(c) ? "充电桩" : /停车/.test(c) ? "停车场" : /银行|ATM|取款机|自动取款/i.test(c) ? "银行" : /地铁/.test(c) ? "地铁站" : /公交|巴士/.test(c) ? "公交站" : /自行车|单车/.test(c) ? "公共自行车站" : c;
  }
  return { center, keyword, radius };
}
function nearbyReply(r) {
  const c = r.center || {}, self = c.source === "gps_auto" || /^(?:我的位置|当前位置|查询位置)$/.test(String(c.name || ""));
  const who = self ? "你的位置" : (c.name || "该地点");
  const head = `${who} · 附近 ${fmtRadius(r.radius)}${r.keyword}`;
  if (!r.list || !r.list.length) return `📍 ${who} · 附近 ${fmtRadius(r.radius)}没有找到${r.keyword}`;
  const sp = (u) => u.replace(/\(/g, "%28").replace(/\)/g, "%29");
  const o = c.bd, bdNav = (x) => sp( `https://api.map.baidu.com/direction?${o ? "origin=" + cEu("latlng:" + o.lat.toFixed(6) + "," + o.lng.toFixed(6) + "|name:" + (c.name || "起点")) + "&" : ""}destination=${cEu("latlng:" + x.bd.lat.toFixed(6) + "," + x.bd.lng.toFixed(6) + "|name:" + x.name)}&mode=walking&coord_type=bd09ll&output=html&src=webapp.openmanus.gateway`);
  const amNav = (x) => sp(`https://uri.amap.com/navigation?${c.gcj ? `from=${c.gcj.lng.toFixed(6)},${c.gcj.lat.toFixed(6)},${cEu(c.name || "起点")}&` : ""}to=${x.gcj.lng.toFixed(6)},${x.gcj.lat.toFixed(6)},${cEu(x.name)}&mode=walk&policy=1&src=openmanus&coordinate=gaode&callnative=1`);
  return `📍 ${head}（${r.count} 个）\n\n` + r.list.map((x, i) => `${i + 1}. ${x.name}　约 ${x.distance} 米` + (x.lines && x.lines.length ? "　" + x.lines.slice(0, 4).join("、") + (x.lines.length > 4 ? ` 等${x.lines.length}条` : "") : x.address ? "　" + x.address : "") + `　[百度导航](${bdNav(x)}) [高德导航](${amNav(x)})`).join("\n");
}
const BD_TACTICS = { rec: 0, fewtransfer: 1, fewwalk: 2, nosubway: 3, fast: 4, subway: 5 };   // 百度 directionlite 公交 tactics_incity：0推荐 1少换乘 2少步行 3不坐地铁 4时间短 5地铁优先
const hmToMin = (t) => { const m = /(\d{1,2}):(\d{2})/.exec(String(t || "")); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
// 首班/末班判断：只有“首班≠末班”两个时刻都给了才判断；只给一个时刻（最近班次预计发车）时返回 null，不乱判
function bdOpenState(a, z) {
  const A = hmToMin(a), Z = hmToMin(z); if (A == null || Z == null || A === Z) return null;
  const bj = new Date(Date.now() + 8 * 3600000), now = bj.getUTCHours() * 60 + bj.getUTCMinutes();
  return A < Z ? now >= A && now <= Z : now >= A || now <= Z;
}
const bjHM = (ms) => { const d = new Date(ms + 8 * 3600000); return String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0"); };
function bdPathPts(groups, max = 160) {
  const pts = [];
  for (const g of groups) for (const seg of String((g && g.path) || "").split(";")) {
    const [lng, lat] = seg.split(",").map(Number); if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const last = pts[pts.length - 1]; if (last && last[0] === lat && last[1] === lng) continue; pts.push([lat, lng]);
  }
  if (pts.length <= max) return pts;
  const step = (pts.length - 1) / (max - 1); return Array.from({ length: max }, (_, k) => pts[Math.round(k * step)]);
}
// v81：附近结果的“步行距离 / 时间”改用真实步行路线（百度 directionlite 步行 → 高德路径规划 2.0 v5 步行），不再只靠直线距离 ÷ 80。
// 每个地点单独算、最多 4 个并发、整体 7 秒封顶；哪个没拿到就不给 walk 字段，前端会写“直线估算”，不编数字。
async function walkRealOne(env, from, to) {
  const kit = cBaiduKit(env), amKey = String(env.AMAP_KEY || "").trim();
  if (kit && from.bd && to.bd) {
    try {
      const j = await kit.call("directionlite/v1/walking", `origin=${Number(from.bd.lat).toFixed(6)},${Number(from.bd.lng).toFixed(6)}&destination=${Number(to.bd.lat).toFixed(6)},${Number(to.bd.lng).toFixed(6)}`);
      const rt = j && j.result && j.result.routes && j.result.routes[0];
      if (rt && Number(rt.distance) > 0) return { distance: Math.round(Number(rt.distance)), duration: Math.round(Number(rt.duration) || Number(rt.distance) / 1.2), via: "百度步行路线" };
    } catch {}
  }
  if (amKey && from.gcj && to.gcj) {
    try {
      const u = `https://restapi.amap.com/v5/direction/walking?origin=${Number(from.gcj.lng).toFixed(6)},${Number(from.gcj.lat).toFixed(6)}&destination=${Number(to.gcj.lng).toFixed(6)},${Number(to.gcj.lat).toFixed(6)}&show_fields=cost&key=${amKey}`;
      const r = await fetch(u, { signal: T(5000) }), j = await r.json().catch(() => ({}));
      const pth = j && j.status === "1" && j.route && j.route.paths && j.route.paths[0];
      if (pth && Number(pth.distance) > 0) return { distance: Math.round(Number(pth.distance)), duration: Math.round(Number(pth.cost && pth.cost.duration) || Number(pth.distance) / 1.2), via: "高德步行路线" };
    } catch {}
  }
  return null;
}
async function walkRealAll(env, from, list) {
  const todo = list.slice(0, 10).filter((x) => x.bd && x.gcj); let k = 0;
  const worker = async () => { while (k < todo.length) { const x = todo[k++]; const w = await walkRealOne(env, from, x); if (w) x.walk = w; } };
  await Promise.race([Promise.all(Array.from({ length: Math.min(4, todo.length) }, worker)), new Promise((ok) => setTimeout(ok, 7000))]);
  return list.filter((x) => x.walk).length;
}
async function placeRoute(env, mode, a, b, tactics) {
  const kit = cBaiduKit(env); if (!kit) throw new ConnErr("没有配置 BAIDU_MAP_AK", 500);
  const A = ptToBd(a), B = ptToBd(b), path = { transit: "transit", walking: "walking", riding: "riding", driving: "driving" }[mode];
  if (!path) throw new ConnErr("不支持的出行方式", 400);
  const tac = mode === "transit" && Object.prototype.hasOwnProperty.call(BD_TACTICS, tactics) ? `&tactics_incity=${BD_TACTICS[tactics]}` : "";
  const j = await kit.call("directionlite/v1/" + path, `origin=${A.lat.toFixed(6)},${A.lng.toFixed(6)}&destination=${B.lat.toFixed(6)},${B.lng.toFixed(6)}${mode === "transit" ? "&steps_info=1" : ""}${tac}`);
  const routes = ((j.result && j.result.routes) || []).slice(0, 3).map((rt) => {
    const steps = (rt.steps || []).flat().filter(Boolean), groups = (rt.steps || []).map((g) => (Array.isArray(g) ? g[0] : g)).filter(Boolean);
    const vehicles = groups.filter(bdBus).map((s) => ({ name: s.vehicle.name || "", start_time: s.vehicle.start_time || "", end_time: s.vehicle.end_time || "", open: bdOpenState(s.vehicle.start_time, s.vehicle.end_time), start_name: s.vehicle.start_name || "", end_name: s.vehicle.end_name || "", stop_num: s.vehicle.stop_num || 0, line_type: s.vehicle.type, path: bdPathPts([s], 120) }));
    const walk = mode === "transit" ? groups.filter((g) => !bdBus(g)).reduce((n, g) => n + (Number(g.distance) || 0), 0) : 0;
    // v71：按顺序列出“步行 → 乘车 → 步行 …”，每段步行带距离、时间和要走到哪个站（下一段乘车的上车站，最后一段走到终点）
    const legs = []; let prevEnd = "", vi = 0;
    if (mode === "transit") groups.forEach((g, gi) => {
      if (bdBus(g)) { legs.push({ kind: "bus", vi: vi++ }); prevEnd = String(g.vehicle.end_name || ""); return; }
      const dist = Number(g.distance) || 0, dur = Number(g.duration) || 0; if (dist <= 0 && dur <= 0) return;
      const nx = groups.slice(gi + 1).find(bdBus);
      legs.push({ kind: "walk", distance: dist, duration: dur, from: prevEnd || String((a && a.name) || "起点"), to: nx ? String(nx.vehicle.start_name || "") : String((b && b.name) || "终点"), to_kind: nx ? "stop" : "dest", first: !legs.length });
    });
    return {
      legs, distance: rt.distance || 0, duration: rt.duration || 0, price: rt.price || 0, walk, eta: bjHM(Date.now() + (rt.duration || 0) * 1000),
      closed: vehicles.some((v) => v.open === false),
      steps: steps.map((s) => cStrip(String(s.instruction || s.instructions || ""), 90)).filter(Boolean).slice(0, 12),
      path: bdPathPts(groups), vehicles,
    };
  });
  // v69：导航链接只用坐标（起终点都先转成百度 bd09ll），不再传地名，避免百度按地名去搜到外地同名地点（如福州同名医院）
  const f6 = (p) => p.lat.toFixed(6) + "," + p.lng.toFixed(6);
  const region = String((b && b.city) || (a && a.city) || "").replace(/市$/, "") || "上海";
  const link = `https://api.map.baidu.com/direction?origin=latlng:${f6(A)}|name:${cEu(String((a && a.name) || "起点"))}&destination=latlng:${f6(B)}|name:${cEu(String((b && b.name) || "终点"))}&mode=${mode}&region=${cEu(region)}&coord_type=bd09ll&output=html&src=webapp.openmanus.gateway`;
  const appLink = `baidumap://map/direction?origin=latlng:${f6(A)}|name:${cEu(String((a && a.name) || "起点"))}&destination=latlng:${f6(B)}|name:${cEu(String((b && b.name) || "终点"))}&mode=${mode}&region=${cEu(region)}&coord_type=bd09ll&src=webapp.openmanus.gateway`;
  // v71：① 公交线路补首班/末班（百度公交只给一个“最近班次”时，用高德公交线路查询的 start_time / end_time，查不到就写未提供）；② 起点没有地址时用百度逆地理编码补地址（“我的位置 · 上海市奉贤区…”）
  const rcity = String((b && b.city) || (a && a.city) || "").replace(/市$/, "") || "上海", need = new Map();
  for (const rt of routes) for (const v of rt.vehicles) {
    if (v.start_time && v.end_time && v.start_time !== v.end_time) { v.first_time = v.start_time; v.last_time = v.end_time; v.time_src = "百度"; continue; }
    if (v.start_time && v.start_time === v.end_time) v.recent = v.start_time;
    v._k = [v.name, v.start_name, v.end_name].join("|"); if (!need.has(v._k)) need.set(v._k, amapLineFind(env, v.name, rcity, v.start_name, v.end_name));
  }
  const addrP = (a && a.address) ? Promise.resolve(String(a.address)) : kit.call("reverse_geocoding/v3/", `location=${A.lat.toFixed(6)},${A.lng.toFixed(6)}&output=json&extensions_poi=0`).then((g) => String((g.result && g.result.formatted_address) || "")).catch(() => "");
  const [found, fromAddr] = await Promise.all([Promise.all([...need].map(async ([k, p]) => [k, await p])), addrP]), foundMap = new Map(found);
  for (const rt of routes) {
    for (const v of rt.vehicles) {
      if (v._k) { const f = foundMap.get(v._k), l = f && f.best && f.best.l; if (l) { v.first_time = hhmm(l.start_time); v.last_time = hhmm(l.end_time); v.time_src = "高德"; } else v.time_note = (f && f.err) || ""; delete v._k; }
      v.open = v.first_time && v.last_time ? bdOpenState(v.first_time, v.last_time) : null;
    }
    rt.closed = rt.vehicles.some((v) => v.open === false);
  }
  return { routes, tactics: tac ? tactics : "", link, appLink, mode, city: region, from: { lat: Number(A.lat.toFixed(6)), lng: Number(A.lng.toFixed(6)), name: String((a && a.name) || "起点"), address: fromAddr }, to: { lat: Number(B.lat.toFixed(6)), lng: Number(B.lng.toFixed(6)), name: String((b && b.name) || "终点"), address: String((b && b.address) || "") } };   // v70：每个方案的导航起终点（百度经纬度 bd09ll），名字只用来显示
}
// v70：点一条线（奉贤17路、地铁5号线）→ 这条线的整条走向 + 全部站点。站点来自高德「公交线路查询」(v3/bus/linename，需要 AMAP_KEY)，坐标转成百度坐标；
// 没配 AMAP_KEY 或没匹配到时，退回百度路线规划里这一段的走法（path）+ 上下车站，并在 note 里写明原因，不编站点。
const lineNorm = (s) => String(s || "").replace(/[（(][^）)]*[）)]/g, "").replace(/\[[^\]]*\]/g, "").replace(/(地铁|公交|汽车)?站$/, "").replace(/\s/g, "");
const hhmm = (t) => { const m = /^(\d{1,2}):?(\d{2})$/.exec(String(t || "").trim()); return m ? m[1].padStart(2, "0") + ":" + m[2] : ""; };
// 高德「公交线路查询」v3/bus/linename：按线路名取整条线（站点 + 走向 + 首末班），再用上下车站名挑对方向；返回 { best:{l,ia,ib} } 或 { err }
async function amapLineFind(env, name, city, startName, endName) {
  const key = String(env.AMAP_KEY || "").trim(); if (!key) return { err: "没配置 AMAP_KEY" };
  const sN = lineNorm(startName), eN = lineNorm(endName);
  try {
    const u = "https://restapi.amap.com/v3/bus/linename?" + new URLSearchParams({ keywords: name, city, extensions: "all", offset: "10", output: "json", key });
    const r = await fetch(u, { signal: T(9000) }), j = await r.json();
    if (String(j.status) !== "1") return { err: "高德没返回线路（" + String(j.info || j.infocode || "未知原因").split(key).join("***") + "）" };
    let best = null, bestScore = -1;
    for (const l of j.buslines || []) {
      const names = (l.busstops || []).map((s) => lineNorm(s.name)), hit = (x) => x ? names.findIndex((n) => n === x || n.includes(x) || x.includes(n)) : -1;
      const ia = hit(sN), ib = hit(eN), score = (ia >= 0 ? 2 : 0) + (ib >= 0 ? 2 : 0) + (ia >= 0 && ib > ia ? 3 : 0);
      if (score > bestScore) { bestScore = score; best = { l, ia, ib }; }
    }
    if (!best || bestScore < 4) return { err: "高德里没有对上这条线的上下车站（" + (startName || "?") + " → " + (endName || "?") + "）" };
    return { best };
  } catch (e) { return { err: "取线路失败（" + String(e.message || e).split(key).join("***") + "）" }; }
}
// v70：点一条线 → 整条走向 + 全部站点；站点来自高德（需要 AMAP_KEY），转成百度坐标；没配或没匹配到时退回这一段的走法，note 写明原因，不编站点
async function placeLine(env, b) {
  const name = String((b && b.name) || "").trim().slice(0, 30); if (!name) throw new ConnErr("缺少线路名", 400);
  const city = String((b && b.city) || "").replace(/市$/, "") || "上海";
  const okPt = (p) => Array.isArray(p) && Number.isFinite(Number(p[0])) && Number.isFinite(Number(p[1]));
  const own = (Array.isArray(b.path) ? b.path : []).filter(okPt).slice(0, 300).map((p) => [Number(p[0]), Number(p[1])]);
  const out = { name, cs: "bd09ll", stops: [], path: own, from_idx: null, to_idx: null, complete: false, source: "百度地图路线规划（只有这一段的走法）", note: "" };
  const f = await amapLineFind(env, name, city, b.start_name, b.end_name);
  if (!f.best) { out.note = f.err + "；下面只画这一段的走法，并标出上车站和下车站。"; return out; }
  const { l, ia, ib } = f.best;
  const stops = (l.busstops || []).map((s, i) => { const [lng, lat] = String(s.location || "").split(",").map(Number); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; const p = gcjToBd(lat, lng); return { seq: i + 1, name: String(s.name || ""), lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) }; }).filter(Boolean);
  const pts = [];
  for (const seg of String(l.polyline || "").split(";")) { const [lng, lat] = seg.split(",").map(Number); if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue; const p = gcjToBd(lat, lng); pts.push([Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]); }
  const max = 300, path = pts.length <= max ? pts : Array.from({ length: max }, (_, k) => pts[Math.round(k * (pts.length - 1) / (max - 1))]);
  return { ...out, stops, path: path.length > 1 ? path : own, from_idx: ia, to_idx: ib, complete: true, line_name: String(l.name || name), start_time: hhmm(l.start_time), end_time: hhmm(l.end_time), source: "高德地图 公交线路查询（站点、首末班）+ 百度坐标", note: "" };
}
// v72：线路首末班（附近的公交 / 地铁站用）：按线路名取高德线路（缓存 3 天），再按“线路经过这个站”挑出对的那几条，首班取最早、末班取最晚
async function amapBusLines(env, name, city) {
  const key = String(env.AMAP_KEY || "").trim(); if (!key) return null;
  const ck = "lnt:" + city + ":" + name;
  if (env.KV) { try { const c = await env.KV.get(ck, "json"); if (c) return c; } catch {} }
  try {
    const u = "https://restapi.amap.com/v3/bus/linename?" + new URLSearchParams({ keywords: name, city, extensions: "all", offset: "20", output: "json", key });
    const j = await (await fetch(u, { signal: T(9000) })).json();
    if (String(j.status) !== "1") return [];
    const base = lineNorm(name), out = [];
    for (const l of j.buslines || []) {
      if (!lineNorm(l.name).startsWith(base)) continue;
      const pts = (l.busstops || []).map((s) => { const [lng, lat] = String(s.location || "").split(",").map(Number); return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null; }).filter(Boolean);
      out.push({ n: String(l.name || ""), s: hhmm(l.start_time), e: hhmm(l.end_time), pts });
    }
    if (env.KV && out.length) { try { await env.KV.put(ck, JSON.stringify(out), { expirationTtl: 259200 }); } catch {} }
    return out;
  } catch { return []; }
}
function pickLineTimes(lines, near) {
  if (!near || !Number.isFinite(Number(near.lat))) return null;
  const cand = lines.filter((l) => l.pts.some((p) => geoHav({ lat: p[0], lng: p[1] }, near) <= 150) && l.s && l.e);
  if (!cand.length) return null;
  const mm = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const first = cand.reduce((a, l) => (mm(l.s) < mm(a) ? l.s : a), cand[0].s);
  const last = cand.reduce((a, l) => { const v = mm(l.e) < mm(l.s) ? mm(l.e) + 1440 : mm(l.e), b = mm(a.e) < mm(a.s) ? mm(a.e) + 1440 : mm(a.e); return v > b ? l : a; }, cand[0]).e;
  return { first, last };
}
// v72：“我的位置”显示现在在哪条路：百度逆地理编码（坐标先转百度坐标）
async function placeWhere(env, b) {
  const kit = cBaiduKit(env); if (!kit) throw new ConnErr("没有配置 BAIDU_MAP_AK", 500);
  const p = ptToBd({ lat: b && b.lat, lng: b && b.lng, cs: (b && b.cs) || "wgs84" });
  const g = await kit.call("reverse_geocoding/v3/", `location=${p.lat.toFixed(6)},${p.lng.toFixed(6)}&output=json&extensions_poi=1&radius=300`);
  const r = g.result || {}, ac = r.addressComponent || {}, roads = Array.isArray(r.roads) ? r.roads : [];
  const road = String(ac.street || "").trim() ? String(ac.street).trim() + String(ac.street_number || "") : (roads[0] && roads[0].name ? String(roads[0].name) : "");
  return { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)), address: String(r.formatted_address || ""), road, city: String(ac.city || ""), district: String(ac.district || ""), province: String(ac.province || ""), desc: String(r.sematic_description || ""), near_road_m: roads[0] && Number.isFinite(Number(roads[0].distance)) ? Number(roads[0].distance) : null };
}
// v73：导航结果下面的附加信息——天气（Open-Meteo，不用 Key）、路况（优先高德，退到百度，用你已有的 Key）、终点 500 米内停车场 / 充电桩（沿用周边检索）、OSRM 免费路线（OSM 数据，出国也能用，不用 Key）。每一项独立，哪项失败只影响哪项，并写明原因。
const WMO = { 0: "晴", 1: "大部晴朗", 2: "多云", 3: "阴", 45: "雾", 48: "雾凇", 51: "小毛毛雨", 53: "毛毛雨", 55: "大毛毛雨", 56: "冻毛毛雨", 57: "冻毛毛雨", 61: "小雨", 63: "中雨", 65: "大雨", 66: "冻雨", 67: "冻雨", 71: "小雪", 73: "中雪", 75: "大雪", 77: "雪粒", 80: "小阵雨", 81: "阵雨", 82: "强阵雨", 85: "阵雪", 86: "强阵雪", 95: "雷暴", 96: "雷暴伴冰雹", 99: "强雷暴伴冰雹" };
const inChina = (lat, lng) => lat > 17.5 && lat < 54 && lng > 73 && lng < 135.5;
function toWgs(p) {
  const lat = Number(p && p.lat), lng = Number(p && p.lng); if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new ConnErr("坐标不对", 400);
  const cs = String((p && p.cs) || "bd09ll");
  if (cs === "wgs84" || !inChina(lat, lng)) return { lat, lng };
  if (cs === "gcj02") { const d = gcjDelta(lat, lng); return { lat: lat - d.dLat, lng: lng - d.dLng }; }
  return bdToWgs(lat, lng);
}
async function exWeather(pt, name) {
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${pt.lat.toFixed(4)}&longitude=${pt.lng.toFixed(4)}&current=temperature_2m,apparent_temperature,weather_code,precipitation,wind_speed_10m&timezone=auto`;
  const j = await (await fetch(u, { signal: T(7000) })).json(), c = j && j.current; if (!c) throw new Error(String((j && j.reason) || "没有数据"));
  return { name, temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), desc: WMO[c.weather_code] || "未知天气", wind: Math.round(c.wind_speed_10m), rain: Number(c.precipitation) || 0, time: String(c.time || "") };
}
async function exTraffic(env, A, B) {
  const lv = (s) => /严重|非常/.test(s) ? 4 : /拥堵/.test(s) ? 3 : /缓/.test(s) ? 2 : /畅/.test(s) ? 1 : 0, nm = ["未知", "畅通", "缓行", "拥堵", "严重拥堵"];
  const amKey = String(env.AMAP_KEY || "").trim(), errs = [];
  if (amKey) {
    try {
      const g1 = bdToGcj(A.lat, A.lng), g2 = bdToGcj(B.lat, B.lng);
      const u = "https://restapi.amap.com/v3/direction/driving?" + new URLSearchParams({ origin: g1.lng.toFixed(6) + "," + g1.lat.toFixed(6), destination: g2.lng.toFixed(6) + "," + g2.lat.toFixed(6), extensions: "all", strategy: "0", output: "json", key: amKey });
      const j = await (await fetch(u, { signal: T(8000) })).json();
      if (String(j.status) !== "1") throw new Error(String(j.info || "高德无结果").split(amKey).join("***"));
      const p = j.route && j.route.paths && j.route.paths[0]; if (!p) throw new Error("高德没给出驾车路线");
      const tot = { 1: 0, 2: 0, 3: 0, 4: 0, 0: 0 };
      for (const s of p.steps || []) for (const t of s.tmcs || []) tot[lv(String(t.tmc_status || ""))] += Number(t.tmc_distance) || 0;
      const sum = Object.values(tot).reduce((a, b) => a + b, 0) || 1, jam = Math.round(((tot[3] + tot[4]) / sum) * 100), slow = Math.round((tot[2] / sum) * 100);
      const level = tot[4] / sum > 0.05 || jam >= 20 ? (tot[4] / sum > 0.05 ? 4 : 3) : slow >= 25 || jam > 0 ? 2 : (sum > 1 && tot[0] / sum > 0.8 ? 0 : 1);
      return { level: nm[level], jam_pct: jam, slow_pct: slow, duration_min: Math.round((Number(p.duration) || 0) / 60), distance_km: Number(((Number(p.distance) || 0) / 1000).toFixed(1)), src: "高德地图 驾车路线路况（按路段长度统计）" };
    } catch (e) { errs.push("高德：" + String(e.message || e).slice(0, 60)); }
  }
  const kit = cBaiduKit(env);
  if (kit) {
    try {
      const j = await kit.call("directionlite/v1/driving", `origin=${A.lat.toFixed(6)},${A.lng.toFixed(6)}&destination=${B.lat.toFixed(6)},${B.lng.toFixed(6)}`);
      const r = j.result && j.result.routes && j.result.routes[0]; if (!r) throw new Error("百度没给出驾车路线");
      const tc = Number(r.traffic_condition);
      return { level: Number.isFinite(tc) && tc >= 1 && tc <= 4 ? nm[tc] : "未知", jam_pct: null, slow_pct: null, duration_min: Math.round((Number(r.duration) || 0) / 60), distance_km: Number(((Number(r.distance) || 0) / 1000).toFixed(1)), src: "百度地图 驾车路线路况" };
    } catch (e) { errs.push("百度：" + String(e.message || e).split(String(env.BAIDU_MAP_AK || "~~")).join("***").slice(0, 80)); }
  } else errs.push("百度未配置");
  throw new Error(errs.join("；") || "没有可用的地图 Key");
}
async function exNearby(env, kw, B) {
  try { const r = await placeNearby(env, kw, { lat: B.lat, lng: B.lng, cs: "bd09ll" }, 500); return { list: (r.list || []).slice(0, 3).map((x) => ({ name: x.name, distance: x.distance })), provider: r.provider }; }
  catch (e) { return { list: [], err: String(e.message || e).split("｜").slice(-1)[0].slice(0, 60) }; }
}
// OSRM：FOSSGIS 公共服务（OSM 数据，WGS84 坐标，免费不用 Key；公共服务有限流，只适合少量查询）
async function exOsrm(mode, a, b) {
  const prof = mode === "walking" ? "foot" : mode === "riding" ? "bike" : "car", coord = `${a.lng.toFixed(6)},${a.lat.toFixed(6)};${b.lng.toFixed(6)},${b.lat.toFixed(6)}`, q = "?overview=full&geometries=geojson&alternatives=false";
  const urls = [`https://routing.openstreetmap.de/routed-${prof}/route/v1/driving/${coord}${q}`]; if (prof === "car") urls.push(`https://router.project-osrm.org/route/v1/driving/${coord}${q}`);
  let err = "";
  for (const u of urls) {
    try {
      const j = await (await fetch(u, { signal: T(9000), headers: { "User-Agent": "openmanus-gateway/1.0" } })).json();
      const r = j && j.routes && j.routes[0]; if (!r) { err = String((j && (j.message || j.code)) || "没有路线"); continue; }
      const pts = ((r.geometry && r.geometry.coordinates) || []).map((c) => [Number(c[1]), Number(c[0])]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])), max = 160;
      const path = pts.length <= max ? pts : Array.from({ length: max }, (_, k) => pts[Math.round(k * (pts.length - 1) / (max - 1))]);
      const f = (p) => p.lat.toFixed(6) + "," + p.lng.toFixed(6);
      return { profile: prof, mode_used: prof === "foot" ? "walking" : prof === "bike" ? "riding" : "driving", distance: Math.round(r.distance || 0), duration: Math.round(r.duration || 0), path, links: { osm: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_${prof}&route=${f(a)};${f(b)}`, google: `https://www.google.com/maps/dir/?api=1&origin=${f(a)}&destination=${f(b)}&travelmode=${prof === "foot" ? "walking" : prof === "bike" ? "bicycling" : "driving"}` } };
    } catch (e) { err = String(e.message || e).slice(0, 60); }
  }
  throw new Error(err || "OSRM 没有返回路线");
}
async function placeExtras(env, b) {
  const a = b && b.from, z = b && b.to, mode = String((b && b.mode) || "transit");
  const wa = toWgs(a), wz = toWgs(z), cn = inChina(wa.lat, wa.lng) && inChina(wz.lat, wz.lng);
  const bdA = cn ? ptToBd(a) : null, bdZ = cn ? ptToBd(z) : null;
  const S = (p) => p.then((v) => ({ ok: true, v }), (e) => ({ ok: false, e: String((e && e.message) || e).slice(0, 100) }));
  const [w1, w2, tr, pk, ch, os] = await Promise.all([
    S(exWeather(wa, String((a && a.name) || "起点"))), S(exWeather(wz, String((z && z.name) || "终点"))),
    cn ? S(exTraffic(env, bdA, bdZ)) : Promise.resolve({ ok: false, e: "起终点不在中国大陆，高德 / 百度没有路况" }),
    cn ? S(exNearby(env, "停车场", bdZ)) : Promise.resolve({ ok: false, e: "不在中国大陆，停车场 / 充电桩检索不可用" }),
    cn ? S(exNearby(env, "充电桩", bdZ)) : Promise.resolve({ ok: false, e: "" }),
    S(exOsrm(mode, wa, wz)),
  ]);
  return {
    mode, in_china: cn,
    weather: { from: w1.ok ? w1.v : null, to: w2.ok ? w2.v : null, err: [w1.ok ? "" : "起点：" + w1.e, w2.ok ? "" : "终点：" + w2.e].filter(Boolean).join("；"), src: "Open-Meteo" },
    traffic: tr.ok ? { ...tr.v, ref: mode !== "driving" } : null, traffic_err: tr.ok ? "" : tr.e,
    parking: pk.ok ? pk.v : null, parking_err: pk.ok ? "" : pk.e, charging: ch.ok ? ch.v : null, charging_err: ch.ok ? "" : ch.e,
    osrm: os.ok ? { ...os.v, note: mode === "transit" ? "OSRM 没有公交路线，这里给的是驾车参考" : "" } : null, osrm_err: os.ok ? "" : os.e,
    coords: { from_wgs84: { lat: Number(wa.lat.toFixed(6)), lng: Number(wa.lng.toFixed(6)) }, to_wgs84: { lat: Number(wz.lat.toFixed(6)), lng: Number(wz.lng.toFixed(6)) } },
  };
}
// v68：搜地点按距离排序（loc 是用户当前坐标；两边都转成百度坐标再算球面距离，米）
const geoHav = (a, b) => { const R = 6371000, rad = (v) => (v * Math.PI) / 180, dLa = rad(b.lat - a.lat), dLo = rad(b.lng - a.lng), h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
function placeSortByDistance(list, loc) {
  let from; try { from = ptToBd(loc); } catch { return list; }
  return list.map((x) => { let d = null; try { d = geoHav(from, ptToBd(x)); } catch {} return { ...x, distance: d }; }).sort((p, q) => (p.distance == null) - (q.distance == null) || p.distance - q.distance);
}

// ---------- v62：百度地图完整 Web 服务直通：POST /api/baidu {api 或 path, params}；GET /api/baidu 返回接口清单 ----------
// 你的 AK 已勾选全部服务（地点检索 / 路线规划 / 轻量路线 / 批量算路 / 实时路况 / 逆地理 / 坐标转换 / 时区 / 天气 / IP 定位 / 行政区划 / 沿途搜 …），这里不再逐个写死：api 用下面的名字，或者直接给 path（百度文档里 api.map.baidu.com 后面那一段）。
const BAIDU_APIS = {
  geocode: "geocoding/v3/", regeo: "reverse_geocoding/v3/",
  place_search: "place/v2/search", place_detail: "place/v2/detail", place_suggestion: "place/v2/suggestion", place_around: "place/v3/around", place_region: "place/v3/region", place_pro: "api_place_pro/v1/region", place_deepsearch: "api_place_agent/v1/deepsearch",
  transit: "directionlite/v1/transit", driving: "directionlite/v1/driving", walking: "directionlite/v1/walking", riding: "directionlite/v1/riding",
  transit_v2: "direction/v2/transit", driving_v2: "direction/v2/driving", walking_v2: "direction/v2/walking", riding_v2: "direction/v2/riding",
  matrix_driving: "routematrix/v2/driving", matrix_walking: "routematrix/v2/walking", matrix_riding: "routematrix/v2/riding",
  traffic_road: "traffic/v1/road", traffic_around: "traffic/v1/around", traffic_bound: "traffic/v1/bound",
  ip: "location/ip", geoconv: "geoconv/v1/", timezone: "timezone/v1", weather: "weather/v1/", district: "api_region_search/v1/",
};
const BAIDU_VERIFIED = ["geocode", "regeo", "place_search", "place_around", "place_region", "place_pro", "transit", "driving", "walking", "riding"];   // 这些路径来自你发的百度文档页或自检探针；其余按百度公开文档的写法，没在你的账号上实测
async function baiduRaw(env, path, params) {
  const ak = String(env.BAIDU_MAP_AK || "").trim(); if (!ak) throw new ConnErr("没有配置 BAIDU_MAP_AK", 500);
  path = String(path || "").replace(/^\/+/, "");
  if (!/^[A-Za-z0-9_\/.-]{3,80}$/.test(path) || path.includes("..") || path.includes("//")) throw new ConnErr("接口路径不合法", 400);
  const query = new URLSearchParams(); for (const [k, v] of Object.entries(params || {})) if (k !== "ak" && v != null && v !== "") query.set(k, String(v)); query.set("ak", ak);
  if (/^place\//.test(path)) { if (Date.now() < BD_DOWN_UNTIL) throw new ConnErr("百度返回 302：地点检索今天的额度用完了（免费档每天 100 次，北京时间 0 点恢复）", 429); await bdPlaceGate(); }
  const r = await fetch(`https://api.map.baidu.com/${path}?${query.toString()}`, { signal: T(12000), headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "application/json, text/plain, */*", "Accept-Language": "zh-CN,zh;q=0.9" } });
  const ct = r.headers.get("content-type") || "";
  if (/^image\//i.test(ct)) return { image: true, r };
  const raw = (await r.text()).replace(/^﻿/, "").trim(); let data = null; try { data = JSON.parse(raw); } catch {}
  if (data && /^place\//.test(path) && (data.status === 302 || data.status === 4)) BD_DOWN_UNTIL = Date.now() + 600000;
  return { http: r.status, data: data || { raw: raw.split(ak).join("***").slice(0, 2000) } };
}

// ---------- v80：上海公共数据开放平台「周边公交实时信息」（token 只放在 Worker 环境变量 SH_BUS_TOKEN，不进前端）----------
// 文档：GET/POST，入参 cityCode / lon / lat / nearRadiusDistance(米) / coordinateType(1=WGS-84, 2=GCJ-02) / isGetStopArrive(=1 才返回到站信息)；请求头 token；出参 retCode=0 成功，nearByTrafficLineStop[]
const SH_BUS_DEFAULT_URL = "https://data.sh.gov.cn/interface/idmp-api/gateway/portal/society-dataset/v1/sod-p4pm95e968tfxhil41cotzxyn";
const shBusMem = new Map();
async function placeBusRealtime(env, center, radius) {
  const token = String(env.SH_BUS_TOKEN || "").trim();
  if (!token) throw new ConnErr("Worker 没配 SH_BUS_TOKEN（上海公共数据开放平台的 token），实时到站暂不可用", 503);
  const lat0 = Number(center && center.lat), lng0 = Number(center && center.lng);
  if (!Number.isFinite(lat0) || !Number.isFinite(lng0) || Math.abs(lat0) > 90 || Math.abs(lng0) > 180) throw new ConnErr("查询中心坐标不对", 400);
  const cs = String((center && center.cs) || "bd09ll");
  const ct = cs === "wgs84" ? "1" : "2", pt = cs === "wgs84" || cs === "gcj02" ? { lat: lat0, lng: lng0 } : bdToGcj(lat0, lng0);
  const r = Math.max(100, Math.min(2000, Math.round(Number(radius) || 500)));
  const key = ct + "|" + pt.lat.toFixed(4) + "|" + pt.lng.toFixed(4) + "|" + r, now = Date.now();
  const hit = shBusMem.get(key); if (hit && now - hit.t < 8000) return { ...hit.v, cached: true };
  const body = { cityCode: "310100", lon: pt.lng.toFixed(6), lat: pt.lat.toFixed(6), nearRadiusDistance: String(r), coordinateType: ct, isGetStopArrive: "1", limit: 100, offset: 0 };
  const ac = new AbortController(), tm = setTimeout(() => ac.abort(), 9000);
  let res, text;
  try {
    res = await fetch(String(env.SH_BUS_URL || SH_BUS_DEFAULT_URL), { method: "POST", headers: { "content-type": "application/json", "cache-control": "no-cache", token }, body: JSON.stringify(body), signal: ac.signal });
    text = await res.text();
  } catch (e) { throw new ConnErr(e && e.name === "AbortError" ? "上海公共数据平台超时（9 秒没回）" : "连不上上海公共数据平台：" + String((e && e.message) || e).split(token).join("***"), 502); }
  finally { clearTimeout(tm); }
  let j; try { j = JSON.parse(text); } catch { throw new ConnErr("上海公共数据平台返回的不是 JSON（HTTP " + res.status + "）：" + text.slice(0, 80).split(token).join("***"), 502); }
  if (!res.ok && j.retCode == null) throw new ConnErr("上海公共数据平台返回 HTTP " + res.status + "：" + String(j.message || j.msg || j.retMsg || "").slice(0, 80), res.status === 401 || res.status === 403 ? 502 : 502);
  const root = j && j.nearByTrafficLineStop === undefined && j.data && typeof j.data === "object" ? j.data : j;
  if (root.retCode != null && Number(root.retCode) !== 0) throw new ConnErr("上海公共数据平台：" + String(root.retMsg || "retCode " + root.retCode).slice(0, 100), 502);
  const num = (v) => { if (v === "" || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; };
  const hv = (a, b) => { const R = 6371000, rad = (v) => (v * Math.PI) / 180, dLa = rad(b.lat - a.lat), dLo = rad(b.lng - a.lng), h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.asin(Math.sqrt(h))); };
  const car = (a, b, c, d, e, f) => (a == null && b == null ? null : { arrive: a, stops: b, dist: c, comfort: d, plate: e || "", barrier: f === true || f === "true" });
  const rows = (Array.isArray(root.nearByTrafficLineStop) ? root.nearByTrafficLineStop : []).map((s) => {
    const sai = s.sai || {}, sc = s.dispatchCarSchedule || {}, p = s.point || {}, plat = num(p.lat), plng = num(p.lon);
    return {
      lineId: String(s.lineId || ""), lineName: String(s.lineName || ""), stopId: String(s.stopId || ""), stopName: String(s.stopName || ""), from: String(s.startStopName || ""), to: String(s.endStopName || ""),
      first: String(s.startEarlyLateTime || ""), last: String(s.endEarlyLateTime || ""), dir: String(s.upDown == null ? "" : s.upDown), type: String(s.type || "1"),
      dist: plat != null && plng != null ? hv(pt, { lat: plat, lng: plng }) : null,
      cur: car(num(sai.currentBusArriveTime), num(sai.currentBusStopCount), num(sai.currentBusDistance), num(sai.currentBusComfort), sai.currentLicensePlate, sai.currentBarrierFree),
      next: car(num(sai.nextBusArriveTime), num(sai.nextBusStopCount), num(sai.nextBusDistance), null, sai.nextLicensePlate, sai.nextBarrierFree),
      sch: s.dispatchCarSchedule ? { code: num(sc.scheduleCode), msg: String(sc.scheduleMsgDefault || ""), short: String(sc.scheduleMsgShort || ""), cars: (Array.isArray(sc.dispatchCars) ? sc.dispatchCars : []).slice(0, 4).map((x) => ({ vehicle: String(x.vehicle || ""), time: String(x.time || ""), countdown: String(x.countdown || "") })) } : null,
    };
  });
  const groups = new Map();
  for (const x of rows) { const k = x.stopName || "(未命名站)"; if (!groups.has(k)) groups.set(k, { stopName: k, dist: x.dist == null ? 99999 : x.dist, lines: [] }); const g = groups.get(k); if (x.dist != null && x.dist < g.dist) g.dist = x.dist; g.lines.push(x); }
  const stops = [...groups.values()].sort((a, b) => a.dist - b.dist).slice(0, 15);
  for (const g of stops) g.lines.sort((a, b) => a.lineName.localeCompare(b.lineName, "zh-Hans-CN", { numeric: true }) || a.dir.localeCompare(b.dir));
  const v = { stops, lineCount: rows.length, radius: r, coordinateType: ct, updated: now, provider: "上海公共数据开放平台·公交实时信息" };
  shBusMem.set(key, { t: now, v }); if (shBusMem.size > 60) shBusMem.delete(shBusMem.keys().next().value);
  return v;
}
export default {
  // 全局兜底：任何未捕获异常都返回带 CORS 的 JSON，而不是 Cloudflare 的 1101 页面（浏览器会把它当成跨域错误）
  async fetch(request, env, ctx) {
    try { return await handle(request, { ...env, KV: safeKV(env.KV) }, ctx); }
    catch (e) { return json({ ok: false, msg: "服务内部错误：" + (e && e.message || e) }, 500); }
  },
  async scheduled(event, env, ctx) {
    const e2 = { ...env, KV: safeKV(env.KV) };
    console.log("[cron] start", JSON.stringify({ scheduled: true, has_kv: !!env.KV, has_hot_key: !!String(env.TANG_HOT_KEY || env.TGMENG_KEY || "").trim(), at: new Date().toISOString() }));
    ctx.waitUntil((async () => {
      try { const r = await refreshHotList(e2); console.log("[cron] hot done", JSON.stringify({ ok: r.ok, skipped: !!r.skipped, error: r.error || "" })); }
      catch (e) { console.error("[cron] hot uncaught", e && e.stack || e); }
      try { const n = await runDueTasks(e2); console.log("[cron] tasks done", n); } catch (e) { console.error("[cron] tasks failed", e && e.stack || e); }
      try { const r = await refreshCandy(e2); console.log("[cron] candy done", JSON.stringify({ ok: r.ok, skipped: !!r.skipped })); } catch (e) { console.error("[cron] candy failed", e && e.stack || e); }
      console.log("[cron] finish", new Date().toISOString());
    })());
  }   // v89：Cron 先真实刷新热榜并记录每一步，再执行其他任务
};
async function handle(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") return new Response("", { headers: CORS });

    const stored = env.KV ? await env.KV.get("agg") : null;
    const AGG = (stored || env.AGG_URL || "").replace(/\/$/, "");
    const source = stored ? "kv" : (env.AGG_URL ? "env" : "none");

    // ---- Kaggle 自动登记隧道 ----
    if (path === "/register" && request.method === "POST") {
      const auth = request.headers.get("Authorization") || "";
      if (!env.REG_TOKEN || !sameStr(auth, "Bearer " + env.REG_TOKEN)) return json({ error: "unauthorized" }, 401);
      if (!env.KV) return json({ error: "KV 没有绑定,变量名必须是 KV" }, 500);
      const b = await request.json().catch(() => ({}));
      const u = String(b.url || "").replace(/\/$/, "");
      if (!/^https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com$/.test(u)) return json({ error: "链接格式不对" }, 400);
      await env.KV.put("agg", u);
      return json({ ok: true, agg: u });
    }
    if (path === "/agg") return json({ agg: AGG, source });

    // ---- 调试：Kaggle + 三家云端模型一起测（并行，各自有超时）----
    if (path === "/debug") {
      const dc = mcache.get("debug"); if (dc && !url.searchParams.get("feishu_doc") && Date.now() - dc.t < 60000) return json(dc.v);
      // v21：用户要求 /debug 不上锁，直接就能看，不用 REG_TOKEN
      // 注意：这里只返回每个模型通不通，不返回 Key 的值，不会泄露 Key
      const kaggle = probe("kaggle", async () => {
        if (!AGG) return { configured: false };
        try {
          const r = await fetch(AGG + "/api/tags", { signal: T(8000), headers: { "User-Agent": "Mozilla/5.0" } });
          return { configured: true, source, agg: AGG, status: r.status, online: r.ok };
        } catch (e) { return { configured: true, source, agg: AGG, online: false, error: e.name === "TimeoutError" ? "超时" : e.message }; }
      });
      const groq = probe("groq", async () => {
        const keys = getKeys(env.GROQ_KEYS); if (!keys.length) return { hasKey: false };
        const m = await getGroqModel(keys[0]);
        const r = await chatOpenAI("https://api.groq.com/openai/v1/chat/completions", keys[0], groqBody(m, [{ role: "user", content: "hi" }], { max_tokens: 64 }));
        const j = await r.json().catch(() => ({}));
        return { hasKey: true, model: m, status: r.status, reply: (j.choices?.[0]?.message?.content || "").slice(0, 80), finish: j.choices?.[0]?.finish_reason, ctokens: j.usage?.completion_tokens, error: j.error?.message };
      });
      const openrouter = probe("openrouter", async () => {
        const keys = getKeys(env.OPENROUTER_KEYS); if (!keys.length) return { hasKey: false };
        const m = await getOpenRouterModel(keys[0]);
        return await chatProbe("https://openrouter.ai/api/v1/chat/completions", keys[0], m);
      });
      const gemini = probe("gemini", async () => {
        const keys = getKeys(env.GEMINI_KEYS); if (!keys.length) return { hasKey: false };
        const t0 = Date.now(); let stage = "列模型";
        try {
          const { ver, model, all } = await getGeminiModel(keys[0]); stage = "生成(" + model + ")";
          const callG = (mdl) => fetch(`https://generativelanguage.googleapis.com/${ver}/models/${mdl}:generateContent`, {
            method: "POST", headers: { "x-goog-api-key": keys[0], "Content-Type": "application/json" }, signal: T(20000),
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "请只回复两个字：在线" }] }], generationConfig: { maxOutputTokens: 256 } })
          });
          let usedModel = model, r = await callG(model), fellBack = "";
          if ([429, 503].includes(r.status) && model !== "gemini-2.5-flash") { fellBack = "首选模型 " + model + " 返回 " + r.status + "（过载/限流），已改测 gemini-2.5-flash"; usedModel = "gemini-2.5-flash"; r = await callG(usedModel); }   // 聊天时也是这样自动降级的
          const j = await r.json().catch(() => ({}));
          const reply = String(j.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "").trim();
          return { hasKey: true, ver, model: usedModel, ...(fellBack ? { fallback: fellBack } : {}), status: r.status, ms: Date.now() - t0, reply: reply.slice(0, 80), verdict: r.ok ? (reply ? "正常" : "正文为空") : "接口报错", available_models: all, error: j.error?.message };
        } catch (e) { return { hasKey: true, error: "卡在【" + stage + "】：" + (e.name === "TimeoutError" ? "超时（" + (Date.now() - t0) + "ms）" : e.message), hint: "如果每次都超时，多半是 Gemini 在 Cloudflare 这个出口被限速/屏蔽，或 Key 无效；换 Key 或把 Gemini 排到最后" }; }
      });
      // v22：/debug 补上今天新加的 3 个：ZHIPU、NVIDIA、GITHUB_MODELS，不然 /debug 里看不到
      const zhipu = probe("zhipu", async () => {
        const keys = getKeys(env.ZHIPU_KEYS); if (!keys.length) return { hasKey: false };
        return await chatProbe("https://open.bigmodel.cn/api/paas/v4/chat/completions", keys[0], "glm-4.7-flash");
      });
      const nvidia = probe("nvidia", async () => {
        const keys = getKeys(env.NVIDIA_KEYS); if (!keys.length) return { hasKey: false };
        return await chatProbe("https://integrate.api.nvidia.com/v1/chat/completions", keys[0], "nvidia/nemotron-3-ultra-550b-a55b");
      });
      const githubModels = probe("github_models", async () => {
        const keys = getKeys(env.GITHUB_MODELS_TOKEN); if (!keys.length) return { hasKey: false };
        return await chatProbe("https://models.github.ai/inference/chat/completions", keys[0], "openai/gpt-4o-mini");
      });
      // v25：飞书探针——真换 token、真读文档。测试文档：?feishu_doc=<飞书文档链接或 doc_token>，或环境变量 FEISHU_TEST_DOC；两者都没有就只测 token。绝不返回 token 值和文档正文
      const feishu = probe("feishu", async () => {
        const out = { env: { FEISHU_APP_ID: !!String(env.FEISHU_APP_ID || "").trim(), FEISHU_APP_SECRET: !!String(env.FEISHU_APP_SECRET || "").trim() }, tenant_access_token: { ok: false }, raw_content: { ok: false, skipped: true } };
        if (!feishuHasEnv(env)) { out.tenant_access_token.error = "变量没配全，没法换 token"; return out; }
        const docIn = String(url.searchParams.get("feishu_doc") || env.FEISHU_TEST_DOC || "").trim();
        let f = docIn ? (feishuParse(docIn) || (/^[A-Za-z0-9_-]{10,}$/.test(docIn) ? { kind: "docx", token: docIn, base: "https://open.feishu.cn" } : null)) : null;
        const base = f ? f.base : "https://open.feishu.cn";
        const a = await feishuToken(env, base, true);   // 跳过缓存，真去换
        if (a.err) { out.tenant_access_token = { ok: false, error: a.err, feishu_code: a.feishuCode, http_status: a.status }; return out; }
        out.tenant_access_token = { ok: true, expire_seconds: a.expire };
        if (!docIn) { out.raw_content = { ok: false, skipped: true, hint: "没给测试文档：访问 /debug?feishu_doc=<文档链接>，或设置环境变量 FEISHU_TEST_DOC" }; return out; }
        if (!f) { out.raw_content = { ok: false, error: "feishu_doc 不是有效的飞书文档链接或 token" }; return out; }
        const res = await feishuRead(env, f);
        out.raw_content = res.err ? { ok: false, step: res.step, error: res.err, feishu_code: res.feishuCode } : { ok: true, title: res.title, chars: res.content.length };
        return out;
      });
      const [k, g, o, m, z, n, gm, fs] = await Promise.all([kaggle, groq, openrouter, gemini, zhipu, nvidia, githubModels, feishu]);
      const dv = { kaggle: k, groq: g, openrouter: o, gemini: m, zhipu: z, nvidia: n, github_models: gm, feishu: fs, cooling_down: [...DOWN].filter(([, t]) => t > Date.now()).map(([x, t]) => x.split("|").slice(0, 2).join(" ") + "（还剩 " + Math.ceil((t - Date.now()) / 1000) + " 秒）"), cached_for_seconds: 60 };
      if (!url.searchParams.get("feishu_doc")) mcache.set("debug", { t: Date.now(), v: dv });
      return json(dv, 200);
    }

    // ---- 账号（v23：加限速，防撞库/刷注册）----
    if ((path === "/api/register" || path === "/api/login") && request.method === "POST") {
      if (!env.KV) return json({ ok: false, msg: "KV 没有绑定" });
      const b = await request.json().catch(() => ({}));
      const user = String(b.user || "").trim();
      const pw = String(b.pw || "");
      if (!user || !pw) return json({ ok: false, msg: "手机号/邮箱和密码不能为空" });
      if (user.length > 64 || /\s/.test(user)) return json({ ok: false, msg: "账号不能含空格，且不超过 64 位" });
      if (pw.length < 6 || pw.length > 128) return json({ ok: false, msg: "密码需为 6-128 位" });
      const ip = request.headers.get("CF-Connecting-IP") || "0", isReg = path === "/api/register";
      const k1 = "login:" + ip + ":" + user, k2 = "loginip:" + ip, k3 = "reg:" + ip;
      const allowed = isReg ? await rlOk(env, k3, 5) : (await rlOk(env, k1, 8) && await rlOk(env, k2, 40));
      if (!allowed) return json({ ok: false, msg: "尝试次数过多，请稍后再试" }, 429);
      const rec = await env.KV.get("user:" + user, "json");
      if (isReg) {
        await rlHit(env, k3, 3600);
        if (rec) return json({ ok: false, msg: "账号已存在，去登录" });
        const salt = rand(16);
        await env.KV.put("user:" + user, JSON.stringify({ salt, hash: await pbkdf2(pw, salt), created: Date.now() }));
      } else {
        if (!rec) { await rlHit(env, k2, 600); return json({ ok: false, msg: "账号不存在，先注册" }); }
        if (!(await checkPw(pw, rec))) { await rlHit(env, k1, 600); await rlHit(env, k2, 600); return json({ ok: false, msg: "密码错" }); }
        await env.KV.delete("rl:" + k1);
        if (!rec.salt) { // 旧账号升级为随机盐
          const salt = rand(16);
          await env.KV.put("user:" + user, JSON.stringify({ salt, hash: await pbkdf2(pw, salt), created: rec.created || Date.now() }));
        }
      }
      return json({ ok: true, token: await newToken(env, user), user });
    }

    // ---- 云端历史 ----
    if (path === "/api/history" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const raw = await env.KV.get("history:" + user);
      return json({ ok: true, user, history: raw ? JSON.parse(raw) : [] });
    }
    if (path === "/api/history" && request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(b.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      if (!Array.isArray(b.history)) return json({ ok: false, msg: "history 必须是数组" }, 400);
      const s = JSON.stringify(b.history);
      const bytes = new TextEncoder().encode(s).length;
      if (bytes > 5 * 1024 * 1024) return json({ ok: false, msg: "历史太大(" + (bytes / 1048576).toFixed(1) + "MB，上限 5MB)，请先删除一些对话", size: bytes }, 413);
      await env.KV.put("history:" + user, s);
      return json({ ok: true });
    }

    // ---- 文件上传（需登录，10MB，保存 7 天）----
    if (path === "/api/files/upload" && request.method === "POST") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, message: "请先登录再上传" }, 401);
      const fd = await request.formData().catch(() => null);
      const f = fd && fd.get("file");
      if (!f || typeof f === "string") return json({ ok: false, message: "没有收到文件" }, 400);
      if (f.size > 10 * 1024 * 1024) return json({ ok: false, message: "文件超过 10MB 限制" }, 413);
      const id = rand(12);
      await env.KV.put("file:" + id, await f.arrayBuffer(), {
        expirationTtl: 7 * 24 * 3600,
        metadata: { user, name: f.name, mime: f.type || "application/octet-stream", size: f.size, uploaded_at: Date.now(), expires_at: Date.now() + 7 * 24 * 3600 * 1000 }
      });
      return json({ ok: true, id, name: f.name, size: f.size, expires_days: 7 });
    }
    if (path.startsWith("/api/files/") && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, message: "请先登录" }, 401);
      const { value, metadata } = await env.KV.getWithMetadata("file:" + path.slice("/api/files/".length), "arrayBuffer");
      if (!value || metadata?.user !== user) return json({ ok: false, message: "文件不存在" }, 404);
      return new Response(value, { headers: { ...CORS, "X-Content-Type-Options": "nosniff", "Content-Type": metadata.mime || "application/octet-stream", "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(metadata.name || "file") } });
    }

    // ---- 文件列表/删除 ----
    if (path === "/api/files" && request.method === "GET") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, message: "请先登录" }, 401);
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20)));
      // v23：list 返回里自带 metadata，不用再对每个 key 逐个 get（v22 最多 1000 次读取，免费版 50 次子请求就会炸）
      const all = []; let cursor;
      for (let page = 0; page < 5; page++) {
        const l = await env.KV.list({ prefix: "file:", limit: 1000, cursor });
        for (const k of l.keys) { const m = k.metadata; if (m && m.user === user) all.push({ id: k.name.slice(5), name: m.name, mime: m.mime, size: m.size, uploaded_at: m.uploaded_at, expires_at: m.expires_at }); }
        if (l.list_complete) break; cursor = l.cursor;
      }
      all.sort((a, b) => (b.uploaded_at || 0) - (a.uploaded_at || 0));
      return json({ ok: true, items: all.slice(0, limit), total: all.length });
    }
    if (path.startsWith("/api/files/") && request.method === "DELETE") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, message: "请先登录" }, 401);
      const id = path.slice("/api/files/".length), meta = await env.KV.getWithMetadata("file:" + id, "stream");
      if (!meta.metadata || meta.metadata.user !== user) return json({ ok: false, message: "文件不存在" }, 404);
      await env.KV.delete("file:" + id); return json({ ok: true, id });
    }
    // ---- 资料库：直接从 history:<user> 转为资料库列表 ----
    if (path === "/api/library" && request.method === "GET") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const raw = await env.KV.get("history:" + user, "json");
      const chats = Array.isArray(raw) ? raw : [];
      const items = chats.map((c, i) => ({ id: String(c.id || ("chat-" + i)), title: String(c.title || "未命名对话"), content: Array.isArray(c.msgs) ? c.msgs.map(m => (m.role === "user" ? "用户：" : "助手：") + String(m.text || "")).join("\n\n") : "", updated_at: c.updated_at || c.updatedAt || null, source: "history" }));
      return json({ ok: true, items });
    }

    // ---- 项目：统一存储在 projects:<user> 数组 ----
    if (path === "/api/projects" && request.method === "GET") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const projects = await env.KV.get("projects:" + user, "json"); return json({ ok: true, items: Array.isArray(projects) ? projects : [] });
    }
    if (path === "/api/projects" && request.method === "POST") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const b = await request.json().catch(() => ({})), id = String(b.id || rand(10));
      const project = { id, name: String(b.name || "未命名项目"), items: [], created_at: Date.now(), updated_at: Date.now() };
      const projects = await env.KV.get("projects:" + user, "json"); const next = [project, ...(Array.isArray(projects) ? projects.filter(x => x.id !== id) : [])].slice(0, 200);
      await env.KV.put("projects:" + user, JSON.stringify(next)); return json({ ok: true, project });
    }
    if (path.match(/^\/api\/projects\/[^/]+\/items$/) && request.method === "POST") {
      const user = await userFromReq(request, env, url); if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const pid = decodeURIComponent(path.split("/")[3]), b = await request.json().catch(() => ({}));
      const projects = await env.KV.get("projects:" + user, "json"); const list = Array.isArray(projects) ? projects : []; const project = list.find(x => x.id === pid);
      if (!project) return json({ ok: false, msg: "项目不存在" }, 404);
      const item = { id: String(b.id || rand(10)), title: String(b.title || "未命名条目"), chat_id: b.chat_id ? String(b.chat_id) : null, content: String(b.content || ""), created_at: Date.now() };
      project.items = [item, ...(Array.isArray(project.items) ? project.items.filter(x => x.id !== item.id) : [])].slice(0, 500); project.updated_at = Date.now();
      await env.KV.put("projects:" + user, JSON.stringify(list)); return json({ ok: true, item, project });
    }


    // ---- 抓链接正文：前端发链接 → 后端去抓 → 返回 8000 字正文 ----
    if (path === "/api/fetch" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const target = String(b.url||"");
      if (!/^https?:\/\//.test(target)) return json({ ok: false, msg: "链接格式不对" }, 400);
      // v25：飞书链接不许走通用抓取（一定被拦），在这里兜底改走开放接口，旧前端/别的入口调进来也一样
      let tu = null; try { tu = new URL(target); } catch {}
      if (tu && FEISHU_HOST_RE.test(tu.hostname)) {
        const f = feishuParse(target);
        if (!f) return json({ ok: false, msg: "飞书链接只支持 /docx/、/wiki/、/file/，不能用通用抓取" }, 400);
        try {
          if (f.kind === "file") return json({ ok: true, url: target, source: "feishu-api", ...(await feishuReadFile(env, f, user)) });
          const res = await feishuRead(env, f);
          if (res.err) return json({ ok: false, msg: res.err, step: res.step }, res.code || 502);
          return json({ ok: true, url: target, title: res.title, content: res.content.slice(0, 8000), source: "feishu-api" });
        } catch(e) { return json({ ok: false, msg: "飞书连接器没调通：" + e.message }, 502); }
      }
      try {
        const res = await readPage(target);
        if (res.ok === false) return json({ ok: false, msg: res.msg }, res.status || 502);
        return json(res);
      } catch(e) { return json({ ok: false, msg: "抓取失败："+e.message }, 502); }
    }
    // ---- v35：地图全接口直通：POST /api/map {provider:"amap"|"tencent", api, params, method?, path?}，GET /api/map 返回接口清单 ----
    if (path === "/api/map/jskey" && request.method === "GET") {   // 高德 JS API（Web端）Key 本来就会出现在网页里，只给预览地图用
      return json({ ok: true, key: String(env.AMAP_JS_KEY || "").trim(), sec: String(env.AMAP_JS_SECURITY || "").trim() });
    }
    if (path === "/api/map") {
      const AMAP_APIS = {
        staticmap: "v3/staticmap", geo: "v3/geocode/geo", regeo: "v3/geocode/regeo",
        text: "v5/place/text", around: "v5/place/around", polygon: "v5/place/polygon", detail: "v5/place/detail",
        inputtips: "v3/assistant/inputtips",
        driving: "v3/direction/driving", walking: "v3/direction/walking", transit: "v3/direction/transit/integrated", bicycling: "v4/direction/bicycling", electrobike: "v5/direction/electrobike",
        convert: "v3/assistant/coordinate/convert", district: "v3/config/district", ip: "v3/ip", weather: "v3/weather/weatherInfo",
        traffic_rectangle: "v3/traffic/status/rectangle", traffic_circle: "v3/traffic/status/circle", traffic_road: "v3/traffic/status/road",
        geofence_meta: "v4/geofence/meta", geofence_status: "v4/geofence/status",
        falcon: "tsapi:", geohub: "geohub:",
      };
      const TX_APIS = {
        convert: "ws/coord/v1/translate", district_list: "ws/district/v1/list", district_children: "ws/district/v1/getchildren", district_search: "ws/district/v1/search",
        regeo: "ws/geocoder/v1/", geo: "ws/geocoder/v1/", ip: "ws/location/v1/ip", search: "ws/place/v1/search", suggestion: "ws/place/v1/suggestion",
        staticmap: "ws/staticmap/v2/", driving: "ws/direction/v1/driving/",
      };
      if (request.method === "GET") return json({ ok: true, amap: Object.keys(AMAP_APIS), tencent: Object.keys(TX_APIS), amapReady: !!String(env.AMAP_KEY || "").trim(), tencentReady: !!(String(env.TENCENT_MAP_KEY || "").trim() && String(env.TENCENT_MAP_SK || "").trim()) });
      if (request.method !== "POST") return json({ ok: false, msg: "只支持 GET / POST" }, 405);
      const b = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(b.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const prov = String(b.provider || "amap"), api = String(b.api || ""), params = {};
      for (const [k, v] of Object.entries(b.params && typeof b.params === "object" ? b.params : {})) if (v !== undefined && v !== null && k !== "key" && k !== "sig") params[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
      const readJson = async (r, label, okFn, secrets) => { const raw = await r.text(); mapLog(label + "_RESP", `HTTP ${r.status} ${raw.slice(0, 2000)}`, ...secrets); let j; try { j = JSON.parse(raw); } catch { return json({ ok: false, msg: label + " 返回了非 JSON（HTTP " + r.status + "）" }, 502); } return json({ ok: okFn(j), provider: prov, api, data: j, ...(okFn(j) ? {} : { msg: j.info || j.message || j.errmsg || "请求失败" }) }, okFn(j) ? 200 : 502); };
      try {
        if (prov === "amap") {
          const key = String(env.AMAP_KEY || "").trim(); if (!key) return json({ ok: false, msg: "没有配置 AMAP_KEY" }, 500);
          const ep = AMAP_APIS[api]; if (!ep) return json({ ok: false, msg: "不支持的高德接口：" + api, apis: Object.keys(AMAP_APIS) }, 400);
          const amapOk = (j) => j.status === "1" || j.status === 1 || j.errcode === 0 || j.errcode === 10000;
          let base, sub = ep, m = String(b.method || "GET").toUpperCase();
          if (ep === "tsapi:") { base = "https://tsapi.amap.com"; sub = String(b.path || "").replace(/^\/+/, ""); if (!/^v1\/track\/[a-z\/]+$/i.test(sub)) return json({ ok: false, msg: "猎鹰接口 path 需形如 v1/track/service/list" }, 400); if (!b.method) m = "POST"; }
          else if (ep === "geohub:") { base = "https://restapi.amap.com"; sub = String(b.path || "").replace(/^\/+/, ""); if (!/^(rest\/lbs\/geohub|v\d\/geohub)\/[a-z0-9_\/.-]+$/i.test(sub) || sub.includes("..")) return json({ ok: false, msg: "GeoHUB 接口 path 需形如 rest/lbs/geohub/tiles/mvt" }, 400); }
          else base = "https://restapi.amap.com";
          if (api === "staticmap") { const qs = new URLSearchParams({ ...params, key }); return json({ ok: true, provider: prov, api, url: `${base}/${sub}?${qs}` }); }
          if (api === "geofence_meta" && !b.method) m = Object.keys(params).some(k => k === "name" || k === "points" || k === "center") ? "POST" : "GET";
          if (m === "GET" || m === "DELETE") { const qs = new URLSearchParams({ ...params, key }), u = `${base}/${sub}?${qs}`; mapLog("AMAP_REQ", m + " " + u, key); return await readJson(await fetch(u, { method: m, signal: T(10000), headers: { Accept: "application/json" } }), "AMAP", amapOk, [key]); }
          const isGeofence = api.startsWith("geofence"), u = isGeofence ? `${base}/${sub}?key=${encodeURIComponent(key)}${b.gid ? "&gid=" + encodeURIComponent(b.gid) : ""}` : `${base}/${sub}`;
          const body = isGeofence ? JSON.stringify(b.params || {}) : new URLSearchParams({ ...params, key });
          mapLog("AMAP_REQ", m + " " + u, key);
          return await readJson(await fetch(u, { method: m, body, signal: T(10000), headers: { Accept: "application/json", "Content-Type": isGeofence ? "application/json" : "application/x-www-form-urlencoded" } }), "AMAP", amapOk, [key]);
        }
        if (prov === "tencent") {
          const key = String(env.TENCENT_MAP_KEY || "").trim(), sk = String(env.TENCENT_MAP_SK || "").trim(); if (!key || !sk) return json({ ok: false, msg: "没有配置 TENCENT_MAP_KEY / TENCENT_MAP_SK" }, 500);
          const ep = TX_APIS[api]; if (!ep) return json({ ok: false, msg: "不支持的腾讯接口：" + api, apis: Object.keys(TX_APIS) }, 400);
          // 签名：路径 + "?" + 参数名排序、参数值 URL 编码后的查询串 + SK 做 MD5；请求使用同一 canonical query。
          const signed = await tencentSignedUrl(ep, { ...params, key }, sk), { sig, url: u } = signed;
          if (api === "staticmap") return json({ ok: true, provider: prov, api, url: u });
          mapLog("TENCENT_REQ", u, key, sk);
          return await readJson(await fetch(u, { signal: T(10000), headers: { Accept: "application/json" } }), "TENCENT", (j) => j.status === 0, [key, sk]);
        }
        return json({ ok: false, msg: "provider 只能是 amap 或 tencent" }, 400);
      } catch (e) { return json({ ok: false, msg: e && e.name === "AbortError" ? "高德地图请求超时（10 秒）" : "地图接口调用失败：" + e.message }, 502); }
    }
    // ---- v34：统一调用入口（面板测试 / 前端手动调用）：POST {id 或 ids, q} ----
    if (path === "/api/connectors/run" && request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(b.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const q = String(b.q || b.query || "").slice(0, 300); if (!q) return json({ ok: false, msg: "缺少 q" }, 400);
      const ids = (Array.isArray(b.ids) ? b.ids : b.id ? [b.id] : routeConnectors(q, env)).filter((i) => CONNECTORS[i]).slice(0, 8);
      if (!ids.length) return json({ ok: true, ids: [], results: [], msg: "这句话没有匹配到任何连接器" });
      const res = await runConnectors(ids, q, env);
      return json({ ok: true, ids, results: res.results, translated: res.translated, footer: connFooter(res, q) });
    }
    // ---- 搜索：DuckDuckGo + Wikipedia，免费不用 Key ----
    if (path === "/api/connectors/search/execute" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const q = String(b.q||b.query||"");
      if (!q) return json({ ok: false, msg: "缺少搜索词" }, 400);
      try {
        const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`, { signal: T(8000) });
        const j = await r.json().catch(()=>({}));
        const results = [...(j.RelatedTopics||[]).slice(0,5).map(x=>({title: x.Text||"", url: x.FirstURL||""})), ...(j.Results||[]).slice(0,5).map(x=>({title: x.Text||"", url: x.FirstURL||""}))];
        let wiki = null;
        try { const w = await fetch(`https://zh.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`, { signal: T(8000) }); if (w.ok) { const wj = await w.json(); wiki = { title: wj.title, extract: wj.extract }; } } catch {}
        return json({ ok: true, query: q, results, wiki });
      } catch(e) { return json({ ok: false, msg: "搜索失败："+e.message }, 502); }
    }
    // ---- 连接器列表 ----
    if (path === "/api/connectors" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      return json({ ok: true, connectors: [{id:"search", name:"搜索 DuckDuckGo", status:"connected"}, {id:"wiki", name:"百科 Wikipedia", status:"connected"}, {id:"fetch", name:"抓链接", status:"connected"}, {id:"github", name:"GitHub 仓库搜索", status: String(env.GH_PAT||"").trim() ? "connected" : "not_configured"}, {id:"figma", name:"Figma 设计稿", status: String(env.FIGMA_TOKEN||"").trim() ? "connected" : "not_configured"}, {id:"screenshot", name:"网页截图", status:"connected"}, {id:"feishu", name:"飞书文档", status: feishuHasEnv(env) ? "connected" : "not_configured", note: "仅检查变量是否配置，不代表 token 能拿到、文档能读；真实状态看 /debug 里的 feishu"}, ...Object.entries(CONNECTORS).map(([id, c]) => ({ id, name: c.name, group: c.group, status: id === "tencentmap" ? (String(env.TENCENT_MAP_KEY || "").trim() && String(env.TENCENT_MAP_SK || "").trim() ? "connected" : "not_configured") : c.env ? (String(env[c.env] || "").trim() ? "connected" : "not_configured") : "connected", ...(c.remind ? { remind: c.remind } : {}), ...(c.label ? { label: c.label } : c.group === "reference" ? { label: "网页搜索，非官方数据" } : c.web ? { label: "网页搜索，仅限官方域名" } : {}) }))], groups: CONN_GROUPS });
    }



    if (path.match(/^\/api\/projects\/[^/]+$/) && request.method === "DELETE") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const pid = decodeURIComponent(path.split("/").pop());
      const projects = await env.KV.get("projects:"+user, "json");
      const list = (Array.isArray(projects)?projects:[]).filter(x=>x.id!==pid);
      await env.KV.put("projects:"+user, JSON.stringify(list));
      return json({ ok: true, id: pid });
    }
    // ============ A 生图 v8：修 402，3 层兜底，不再给坏图 ============
    if (path === "/api/generate/image" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const rawPrompt = String(b.prompt||"").trim();
      if (!rawPrompt) return json({ ok: false, msg: "缺少 prompt，告诉我画什么" }, 400);
      // v11 质量修法（v14 漏了，v15 补上）：短中文自动加长英文质量词，豆包就是这么做的
      // 如果用户已经写了长的英文，就不动；如果只写了“帮我画一只猫”，就自动加上质量词
      // v23：按 style 决定质量词。style="photo" 才加写实词；"raw" 完全不加；不传则自动判断：
      // 人像/实拍类才加写实，logo/插画/动漫/图标等不加，其它只加中性的画质词。
      const style = String(b.style || "auto").toLowerCase();
      const isPhoto = /人像|人物|真人|照片|写实|摄影|实拍|portrait|photo|realistic|selfie|风景照|产品图/i.test(rawPrompt);
      const isArt = /logo|标志|图标|icon|插画|插图|动漫|漫画|卡通|扁平|矢量|像素|水彩|油画|素描|海报|illustration|anime|cartoon|vector|flat|pixel|watercolor|sketch|poster/i.test(rawPrompt);
      const alreadyQ = /photorealistic|highly detailed|8k|sharp focus/i.test(rawPrompt);
      const enhancedPrompt = style === "raw" || alreadyQ ? rawPrompt
        : (style === "photo" || (style === "auto" && isPhoto && !isArt)) ? `${rawPrompt}, photorealistic, highly detailed, sharp focus, natural light, 8k, high quality`
        : (isArt ? rawPrompt : `${rawPrompt}, high quality, highly detailed, clean composition`);
      const prompt = enhancedPrompt;
      const width = Math.min(1536, Math.max(256, Number(b.width||1024)));
      const height = Math.min(1536, Math.max(256, Number(b.height||1024)));
      const seed = Math.floor(Math.random()*1000000);
      // 第 1 试：Pollinations 带 Referer + model=flux（现在必须带 Referer 否则 402）
      const tries = [
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&nologo=true&referrer=openmanus&seed=${seed}`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=turbo&nologo=true&referrer=openmanus&seed=${seed}`,
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`,
      ];
      let lastStatus = 0, lastErr = "";
      for (const imgUrl of tries) {
        try {
          const r = await fetch(imgUrl, { headers: { "User-Agent": "Mozilla/5.0", Referer: "https://openmanus-znymbdta.manus.space" }, signal: T(30000) });
          lastStatus = r.status;
          if (!r.ok) { lastErr = "Pollinations 返回 "+r.status; continue; }
          const buf = await r.arrayBuffer();
          // 坏图过滤：太小 / 不是图片就当失败，不返回坏图
          const ct = (r.headers.get("content-type")||"").toLowerCase();
          if (buf.byteLength < 5000 || (!ct.includes("image") && buf.byteLength < 20000)) { lastErr = "返回的不是图片"; continue; }
          const id = rand(12);
          await env.KV.put("file:"+id, buf, { expirationTtl: 7*24*3600, metadata: { user, name: "image-"+id+".jpg", mime: "image/jpeg", size: buf.byteLength, uploaded_at: Date.now(), expires_at: Date.now()+7*24*3600*1000, prompt: rawPrompt } });
          return json({ ok: true, id, file_id: id, prompt, width, height, url: "/api/files/"+id, download: "/api/files/"+id, model: "pollinations" });
        } catch(e) { lastErr = e.message; continue; }
      }
      // 生图兜底 v10：6 个备用，一个没了走下一个
      // 1-3 Pollinations 已试过，4-6 再试 HF + OpenRouter
      const hf = String(env.HF_TOKEN||"").trim();
      const hfModels = ["black-forest-labs/FLUX.1-dev", "black-forest-labs/FLUX.1-schnell", "stabilityai/stable-diffusion-xl-base-1.0"]; // v15: dev 质量好先用，schnell 快但差后用
      for (const m of hfModels) {
        if (!hf) break;
        try {
          const r2 = await fetch(`https://api-inference.huggingface.co/models/${m}`, { method: "POST", headers: { Authorization: "Bearer "+hf, "Content-Type": "application/json" }, body: JSON.stringify({ inputs: prompt }), signal: T(60000) });
          if (!r2.ok) { lastErr = "HF "+m+" 返回 "+r2.status; continue; }
          const buf2 = await r2.arrayBuffer();
          const ct2 = (r2.headers.get("content-type")||"").toLowerCase();
          if (buf2.byteLength < 5000 || !ct2.includes("image")) { lastErr = "HF "+m+" 没返回图"; continue; }
          const id2 = rand(12);
          await env.KV.put("file:"+id2, buf2, { expirationTtl: 7*24*3600, metadata: { user, name: "image-"+id2+".jpg", mime: "image/jpeg", size: buf2.byteLength, uploaded_at: Date.now(), expires_at: Date.now()+7*24*3600*1000, prompt } });
          return json({ ok: true, id: id2, file_id: id2, prompt, width, height, url: "/api/files/"+id2, download: "/api/files/"+id2, model: "hf:"+m });
        } catch(e) { lastErr = "HF "+m+" 失败："+e.message; continue; }
      }
      // 第 6 试：OpenRouter 免费画图（需要 OPENROUTER_KEYS，模型 qwen-image）
      const orKeys = getKeys(env.OPENROUTER_KEYS);
      if (orKeys.length) {
        try {
          const r3 = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: "Bearer "+orKeys[0], "Content-Type": "application/json" }, body: JSON.stringify({ model: "qwen/qwen-image:free", messages: [{ role: "user", content: prompt }], modalities: ["image","text"] }), signal: T(60000) });
          const j3 = await r3.json().catch(()=>({}));
          const imgB64 = j3.choices?.[0]?.message?.images?.[0]?.image_url?.url || j3.choices?.[0]?.message?.content;
          if (r3.ok && imgB64 && imgB64.startsWith("data:image")) {
            const b64 = imgB64.split(",")[1] || "";
            const bin = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
            const id3 = rand(12);
            await env.KV.put("file:"+id3, bin, { expirationTtl: 7*24*3600, metadata: { user, name: "image-"+id3+".jpg", mime: "image/jpeg", size: bin.byteLength, uploaded_at: Date.now(), expires_at: Date.now()+7*24*3600*1000, prompt } });
            return json({ ok: true, id: id3, file_id: id3, prompt, width, height, url: "/api/files/"+id3, download: "/api/files/"+id3, model: "openrouter:qwen-image" });
          } else { lastErr = "OpenRouter 画图返回 "+r3.status; }
        } catch(e) { lastErr = "OpenRouter 画图失败："+e.message; }
      }
      // 3 次都失败 + HF 也没成：直接返回失败，不给坏图，前端只弹 toast，不弹下载弹窗
      return json({ ok: false, msg: lastStatus===402 ? "生图失败：Pollinations 免费额度用完了（402），HF 也没配好，去 Cloudflare 里配 HF_TOKEN 再试" : "生图失败："+(lastErr||"Pollinations 没返回图") }, 502);
    }

    // ============ v69：朗读按钮用的云端女声（直接回 mp3，不落盘；失败时前端退回浏览器自带声音） ============
    if (path === "/api/tts" && request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(b.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const text = String(b.text || "").trim().slice(0, 1200);
      if (!text) return json({ ok: false, msg: "缺少要读的文字" }, 400);
      // 默认晓晓（女声）；只允许 xxx-XX-NameNeural 这种合法名字
      const voice = /^[a-z]{2,3}-[A-Za-z]{2,4}-[A-Za-z0-9]+Neural$/.test(String(b.voice || "")) ? String(b.voice) : "zh-CN-XiaoxiaoNeural";
      const rt = Math.max(-50, Math.min(100, Math.round((Number(b.rate) || 1) * 100 - 100)));
      let wsErr = "";
      try { const mp3 = await edgeTtsWs(text, voice, rt); return new Response(mp3, { status: 200, headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } }); } catch (e) { wsErr = e.message; }
      try {
        const r = await fetch("https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491EE68", { method: "POST", headers: { "Content-Type": "application/ssml+xml", "User-Agent": "Mozilla/5.0", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3" }, body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}"><prosody rate="${rt >= 0 ? "+" : ""}${rt}%">${xmlEsc(text)}</prosody></voice></speak>`, signal: T(25000) });
        if (!r.ok) return json({ ok: false, msg: "云端语音失败：WebSocket（" + wsErr + "）；HTTP 返回 " + r.status }, 502);
        const buf = await r.arrayBuffer();
        if (buf.byteLength < 1000) return json({ ok: false, msg: "云端语音没有返回声音" }, 502);
        return new Response(buf, { status: 200, headers: { ...CORS, "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
      } catch (e) { return json({ ok: false, msg: "云端语音失败：" + e.message }, 502); }
    }
    // ============ 音频 v10：3 备用，TTS ============
    if (path === "/api/generate/audio" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const text = String(b.text||b.prompt||"").trim();
      if (!text) return json({ ok: false, msg: "缺少要读的文字" }, 400);
      const voice = /^[a-z]{2,3}-[A-Za-z]{2,4}-[A-Za-z0-9]+Neural$/.test(String(b.voice||"")) ? String(b.voice) : "zh-CN-XiaoxiaoNeural";
      let lastErr = "";
      // 1 试：Edge TTS（免费，不用 Key）
      try {
        const r = await fetch("https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491EE68", { method: "POST", headers: { "Content-Type": "application/ssml+xml", "User-Agent": "Mozilla/5.0", "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3" }, body: `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}">${xmlEsc(text.slice(0, 3000))}</voice></speak>`, signal: T(30000) });
        if (r.ok) { const buf = await r.arrayBuffer(); if (buf.byteLength > 2000) { const id = rand(12); await env.KV.put("file:"+id, buf, { expirationTtl: 7*24*3600, metadata: { user, name: "audio-"+id+".mp3", mime: "audio/mpeg", size: buf.byteLength, uploaded_at: Date.now(), expires_at: Date.now()+7*24*3600*1000, prompt: text } }); return json({ ok: true, id, file_id: id, url: "/api/files/"+id, download: "/api/files/"+id, model: "edge-tts" }); } }
        lastErr = "Edge TTS 返回 "+r.status;
      } catch(e) { lastErr = "Edge TTS 失败："+e.message; }
      // 2 试：HF TTS
      const hf2 = String(env.HF_TOKEN||"").trim();
      if (hf2) {
        for (const m of ["microsoft/speecht5_tts", "espnet/kan-bayashi_ljspeech_vits"]) {
          try {
            const r = await fetch(`https://api-inference.huggingface.co/models/${m}`, { method: "POST", headers: { Authorization: "Bearer "+hf2, "Content-Type": "application/json" }, body: JSON.stringify({ inputs: text }), signal: T(30000) });
            if (!r.ok) { lastErr = "HF TTS "+m+" 返回 "+r.status; continue; }
            const buf = await r.arrayBuffer(); if (buf.byteLength < 2000) continue;
            const id = rand(12); await env.KV.put("file:"+id, buf, { expirationTtl: 7*24*3600, metadata: { user, name: "audio-"+id+".wav", mime: "audio/wav", size: buf.byteLength, uploaded_at: Date.now(), expires_at: Date.now()+7*24*3600*1000, prompt: text } });
            return json({ ok: true, id, file_id: id, url: "/api/files/"+id, download: "/api/files/"+id, model: "hf:"+m });
          } catch(e) { lastErr = e.message; continue; }
        }
      }
      return json({ ok: false, msg: "语音生成失败："+(lastErr||"3 个备用都失败了") }, 502);
    }
    // ============ B 定时任务 ============
    // 数据：tasks:<user> = [{id,title,time,timezone,repeat,prompt,enabled,next_run,created_at}]
    async function loadTasks(user) { const t = await env.KV.get("tasks:"+user, "json"); return Array.isArray(t)?t:[]; }
    if (path === "/api/tasks/schedules" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const title = String(b.title||b.prompt||"未命名任务").slice(0,100);
      if (!title) return json({ ok: false, msg: "缺少任务标题" }, 400);
      const tm = /^(\d{1,2}):(\d{2})$/.exec(String(b.time||"").trim());
      if (!tm || Number(tm[1]) > 23 || Number(tm[2]) > 59) return json({ ok: false, msg: "执行时间格式应为 HH:MM，例如 09:00" }, 400);
      const time = String(tm[1]).padStart(2, "0") + ":" + tm[2];
      const tz = validTz(b.timezone);
      const now = nowIn(tz), repeat = REPEATS.includes(b.repeat) ? b.repeat : "daily";
      const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date || "")) ? String(b.date) : "";
      const weekday = Number.isInteger(Number(b.weekday)) && Number(b.weekday) >= 0 && Number(b.weekday) <= 6 ? Number(b.weekday) : 1;
      // 今天这个点已经过了：今天不补跑，从下一个符合条件的日子开始（指定了未来日期的一次性任务除外）
      const task = { id: rand(10), title, time, timezone: tz, repeat, prompt: String(b.prompt||title).slice(-12000), enabled: b.enabled!==false,
        last_run_day: (now.hm >= time && !(repeat === "once" && date > now.day)) ? now.day : "", created_at: Date.now(), updated_at: Date.now() };
      if (repeat === "weekly") task.weekday = weekday;
      if (repeat === "once" && date) task.date = date;
      task.next_run = nextRunOf(task);
      const list = [task, ...(await loadTasks(user))].slice(0,100);
      await env.KV.put("tasks:"+user, JSON.stringify(list));
      return json({ ok: true, task, note: "任务由 Cron 触发器执行，请确认 Worker 已配置 Cron Trigger（如 */5 * * * *）" });
    }
    if (path === "/api/tasks/schedules" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      return json({ ok: true, items: (await loadTasks(user)).map((t) => { if (!t.last_result) return t; const sk = stripApiLinks(t.last_result); return { ...t, last_result: sk.text, last_links: (t.last_links && t.last_links.length) ? t.last_links : sk.links }; }) });
    }
    // v81：修改 / 暂停 / 恢复（PATCH /api/tasks/schedules/:id）
    if (path.match(/^\/api\/tasks\/schedules\/[^/]+$/) && request.method === "PATCH") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const id = decodeURIComponent(path.split("/").pop());
      const list = await loadTasks(user), t = list.find(x=>x.id===id);
      if (!t) return json({ ok: false, msg: "没找到这个任务（可能已被删除）" }, 404);
      if (b.title !== undefined) { const v = String(b.title).trim().slice(0,100); if (!v) return json({ ok: false, msg: "标题不能为空" }, 400); t.title = v; }
      if (b.prompt !== undefined) t.prompt = String(b.prompt).slice(-12000) || t.title;
      if (b.time !== undefined) { const tm = /^(\d{1,2}):(\d{2})$/.exec(String(b.time).trim()); if (!tm || Number(tm[1]) > 23 || Number(tm[2]) > 59) return json({ ok: false, msg: "执行时间格式应为 HH:MM，例如 09:00" }, 400); t.time = String(tm[1]).padStart(2,"0") + ":" + tm[2]; }
      if (b.repeat !== undefined) { if (!REPEATS.includes(b.repeat)) return json({ ok: false, msg: "repeat 只能是 once / daily / weekdays / weekly" }, 400); t.repeat = b.repeat; }
      if (b.weekday !== undefined && Number.isInteger(Number(b.weekday)) && Number(b.weekday) >= 0 && Number(b.weekday) <= 6) t.weekday = Number(b.weekday);
      if (b.date !== undefined) { if (/^\d{4}-\d{2}-\d{2}$/.test(String(b.date))) t.date = String(b.date); else delete t.date; }
      if (b.timezone !== undefined) t.timezone = validTz(b.timezone);
      if (b.enabled !== undefined) {
        t.enabled = !!b.enabled;
        if (t.enabled && t.repeat === "once" && t.last_run_at) { delete t.last_run_at; t.last_run_day = ""; }   // 重新打开一次性任务 = 再跑一次
      }
      // 改了时间/重复方式：今天这个点已过就不补跑
      if (b.time !== undefined || b.repeat !== undefined || b.weekday !== undefined || b.date !== undefined) { const n = nowIn(validTz(t.timezone)); t.last_run_day = (n.hm >= t.time && !(t.repeat === "once" && t.date && t.date > n.day)) ? n.day : ""; }
      t.next_run = t.enabled ? nextRunOf(t) : t.next_run; t.updated_at = Date.now();
      await env.KV.put("tasks:"+user, JSON.stringify(list));
      return json({ ok: true, task: t });
    }
    // v81：立即执行一次（不影响原计划，结果写进 last_result）
    if (path.match(/^\/api\/tasks\/schedules\/[^/]+\/run$/) && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const id = decodeURIComponent(path.split("/")[4]);
      const t0 = (await loadTasks(user)).find(x=>x.id===id);
      if (!t0) return json({ ok: false, msg: "没找到这个任务（可能已被删除）" }, 404);
      const { text, status, links } = await execTaskPrompt(t0, env);
      const fresh = await loadTasks(user), ft = fresh.find(x=>x.id===id);
      if (ft) { Object.assign(ft, { last_run_at: Date.now(), last_status: status, last_result: text.slice(0, 6000), last_links: links, updated_at: Date.now() }); await env.KV.put("tasks:"+user, JSON.stringify(fresh)); }
      return json({ ok: status === "ok", status, result: text.slice(0, 6000), links, msg: status === "ok" ? "" : "这次执行没拿到结果：" + text.slice(0, 200) });
    }
    if (path.match(/^\/api\/tasks\/schedules\/[^/]+$/) && request.method === "DELETE") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const id = decodeURIComponent(path.split("/").pop());
      const list = (await loadTasks(user)).filter(x=>x.id!==id);
      await env.KV.put("tasks:"+user, JSON.stringify(list));
      return json({ ok: true, id });
    }
    // v89：手动刷新热榜，真实调用糖果梦并写入 KV；GET 仍然只读缓存。
    if (path === "/api/hot" && request.method === "POST") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const r = await refreshHotList(env);
      let m = null; try { m = await env.KV.get(HOT_META, "json"); } catch {}
      return json({ ok: !!r.ok, refreshed: true, error: r.error || (m && m.last_error) || "", meta: m || null }, r.ok ? 200 : 502);
    }
    // v86：今日热榜（只读 KV 缓存；有 ?debug=1 时附上最近一次异常的返回开头，方便核对字段）
    if (path === "/api/hot" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      let c = null, m = null; try { c = await env.KV.get(HOT_KEY, "json"); } catch {} try { m = await env.KV.get(HOT_META, "json"); } catch {}
      const boards = Object.entries((c && c.boards) || {}).filter(([, b]) => b && Array.isArray(b.items) && b.items.length).map(([key, b]) => ({ key, name: b.name || key, items: b.items, fetched_at: b.fetched_at || null, source_updated_at: b.source_updated_at || null }));
      const meta = { configured: !!String(env.TANG_HOT_KEY || env.TGMENG_KEY || "").trim(), last_try_at: (m && m.last_try_at) || null, last_ok_at: (m && m.last_ok_at) || null, stale: !!(m && m.last_try_at && (!m.last_ok_at || m.last_try_at > m.last_ok_at) && m.last_error), last_error: (m && m.last_error) || "", missing: (m && m.missing) || [] };
      if (url.searchParams.get("debug") === "1") { meta.last_error = (m && m.last_error) || ""; meta.raw_head = (m && m.raw_head) || ""; }
      // v87：糖果指数（AI 汇总）单独一栏，不混进各平台榜
      let cc = null, cm = null; try { cc = await env.KV.get(CANDY_KEY, "json"); } catch {} try { cm = await env.KV.get(CANDY_META, "json"); } catch {}
      const candyFailed = !!(cm && cm.last_try_at && (!cm.last_ok_at || cm.last_try_at > cm.last_ok_at) && cm.last_error);
      const candy = { name: "糖果指数（AI 汇总）", fetched_at: candyFailed ? null : (cc && cc.fetched_at) || null, stale: candyFailed, last_error: (cm && cm.last_error) || "", cats: CANDY_CRON.map((k) => { const b = !candyFailed && cc && cc.cats && cc.cats[k]; return { key: k, name: candyLabel(k), items: (b && b.items) || [], fetched_at: (b && b.fetched_at) || null }; }) };
      if (url.searchParams.get("debug") === "1") { candy.last_error = (cm && cm.last_error) || ""; candy.raw_head = (cm && cm.raw_head) || ""; }
      return json({ ok: true, fetched_at: (c && c.fetched_at) || null, boards, candy, meta });
    }
    if (path === "/api/tasks/recent" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const tasks = await loadTasks(user);
      const recent = tasks.slice(0,20).map(t=>({ id: t.id, title: t.title, time: t.time, timezone: t.timezone, repeat: t.repeat, weekday: t.weekday, date: t.date || "", prompt: String(t.prompt||"").slice(0,300), next_run: t.next_run, enabled: t.enabled, status: t.last_status === "failed" ? "上次执行失败" : t.enabled ? "等待执行" : (t.last_run_at ? "已完成" : "已暂停"), last_run_at: t.last_run_at || null, last_result: t.last_result || "", created_at: t.created_at }));
      return json({ ok: true, items: recent });
    }
    // ============ C 分享链接 ============
    // 数据：share:<id> = {owner,title,content,permission,expires_at,created_at}
    if (path === "/api/shares" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const content = String(b.content||"");
      if (!content) return json({ ok: false, msg: "缺少要分享的内容" }, 400);
      const id = rand(10);
      const days = Math.min(30, Math.max(1, Number(b.expiry_days||b.expires_days||7)));
      const share = { id, owner: user, title: String(b.title||"分享"), content, permission: String(b.permission||"read"), expires_at: Date.now()+days*24*3600*1000, created_at: Date.now() };
      await env.KV.put("share:"+id, JSON.stringify(share), { expirationTtl: days*24*3600 });
      return json({ ok: true, share: { id, title: share.title, permission: share.permission, expires_at: share.expires_at, url: "/s/"+id, api_url: "/api/shares/"+id } });
    }
    if (path.match(/^\/api\/shares\/[^/]+$/) && request.method === "GET") {
      const id = decodeURIComponent(path.split("/").pop());
      const s = await env.KV.get("share:"+id, "json");
      if (!s) return json({ ok: false, msg: "分享不存在或已过期" }, 404);
      if (s.expires_at && Date.now() > s.expires_at) { await env.KV.delete("share:"+id); return json({ ok: false, msg: "分享已过期" }, 410); }
      return json({ ok: true, share: { id: s.id, title: s.title, content: s.content, permission: s.permission, expires_at: s.expires_at, created_at: s.created_at } });
    }
    if (path.match(/^\/api\/shares\/[^/]+$/) && request.method === "DELETE") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const id = decodeURIComponent(path.split("/").pop());
      const s = await env.KV.get("share:"+id, "json");
      if (!s) return json({ ok: false, msg: "分享不存在" }, 404);
      if (s.owner !== user) return json({ ok: false, msg: "不是你的分享，不能撤销" }, 403);
      await env.KV.delete("share:"+id);
      return json({ ok: true, id });
    }


    // ---- 分享页：浏览器直接打开的只读页面（内容全部转义，CSP 禁止脚本）----
    if (path.match(/^\/s\/[^/]+$/) && request.method === "GET") {
      const id = decodeURIComponent(path.split("/").pop()), s = await env.KV.get("share:"+id, "json");
      const page = (title, body, status = 200) => new Response('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + xmlEsc(title) + '</title><style>body{margin:0;background:#f6f8f5;color:#243127;font:15px/1.75 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif}main{max-width:820px;margin:0 auto;padding:28px 18px 60px}h1{font-size:22px;margin:0 0 4px}small{color:#7a8c7d}pre{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #dfe8dc;border-radius:12px;padding:18px;margin-top:18px;font:inherit}</style></head><body><main>' + body + '</main></body></html>',
        { status, headers: { "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer" } });
      if (!s) return page("分享不存在", "<h1>分享不存在或已过期</h1>", 404);
      if (s.expires_at && Date.now() > s.expires_at) { await env.KV.delete("share:"+id); return page("分享已过期", "<h1>分享已过期</h1>", 410); }
      return page(s.title || "分享", "<h1>" + xmlEsc(s.title || "分享") + "</h1><small>只读分享 · " + xmlEsc(new Date(s.created_at).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })) + "</small><pre>" + xmlEsc(s.content) + "</pre>");
    }

    // ---- GitHub 连接器：真调 GitHub API，不编数据 ----
    if (path === "/api/connectors/github/execute" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const q = String(b.q||b.query||"openmanus");
      const pat = String(env.GH_PAT||"").trim();
      if (!pat) return json({ ok: false, msg: "GH_PAT 没有配置，GitHub 连接器没调通" }, 500);
      try {
        const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=5`, { headers: { Authorization: "Bearer "+pat, Accept: "application/vnd.github+json", "User-Agent": "OpenManus" }, signal: T(10000) });
        if (!r.ok) return json({ ok: false, msg: "GitHub API 返回 "+r.status+"，GitHub 连接器没调通" }, 502);
        const j = await r.json();
        const results = (j.items||[]).map(x=>({ full_name: x.full_name, description: x.description, stars: x.stargazers_count, forks: x.forks_count, language: x.language, url: x.html_url }));
        return json({ ok: true, query: q, total: j.total_count, results, source: "github-api" });
      } catch(e) { return json({ ok: false, msg: "GitHub 连接器没调通："+e.message }, 502); }
    }
    if (path === "/api/connectors/github/execute" && request.method === "GET") {
      const user = await userFromReq(request, env, url);
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const q = String(url.searchParams.get("q")||"openmanus");
      const pat = String(env.GH_PAT||"").trim();
      if (!pat) return json({ ok: false, msg: "GH_PAT 没有配置，GitHub 连接器没调通" }, 500);
      try {
        const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=5`, { headers: { Authorization: "Bearer "+pat, Accept: "application/vnd.github+json", "User-Agent": "OpenManus" }, signal: T(10000) });
        if (!r.ok) return json({ ok: false, msg: "GitHub API 返回 "+r.status } , 502);
        const j = await r.json();
        const results = (j.items||[]).map(x=>({ full_name: x.full_name, description: x.description, stars: x.stargazers_count, forks: x.forks_count, language: x.language, url: x.html_url }));
        return json({ ok: true, query: q, total: j.total_count, results, source: "github-api" });
      } catch(e) { return json({ ok: false, msg: "GitHub 连接器没调通："+e.message }, 502); }
    }

    // ---- v24 Figma 连接器：读文件结构和文字（不是截图）----
    if (path === "/api/connectors/figma/execute" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const tok = String(env.FIGMA_TOKEN||"").trim();
      if (!tok) return json({ ok: false, msg: "FIGMA_TOKEN 没有配置，Figma 连接器没调通" }, 500);
      const m = /^https?:\/\/(?:[\w-]+\.)?figma\.com\/(?:file|design|proto|board)\/([A-Za-z0-9]+)/.exec(String(b.url||""));
      if (!m) return json({ ok: false, msg: "不是 Figma 文件链接（应为 figma.com/design/… 这种）" }, 400);
      let node = ""; try { node = (new URL(String(b.url)).searchParams.get("node-id")||"").replace(/-/g, ":"); } catch {}
      const api = node ? `https://api.figma.com/v1/files/${m[1]}/nodes?ids=${encodeURIComponent(node)}&depth=6` : `https://api.figma.com/v1/files/${m[1]}?depth=4`;
      try {
        const r = await fetch(api, { headers: { "X-Figma-Token": tok }, signal: T(15000) });
        if (!r.ok) return json({ ok: false, msg: r.status === 403 ? "Figma 拒绝访问（token 无效，或没有这个文件的权限）" : r.status === 404 ? "Figma 找不到这个文件或节点" : "Figma API 返回 " + r.status }, 502);
        const j = await r.json();
        const roots = node ? Object.values(j.nodes||{}).map(x => x && x.document).filter(Boolean) : (j.document && j.document.children) || [];
        const SKIP = new Set(["VECTOR","BOOLEAN_OPERATION","STAR","LINE","ELLIPSE","REGULAR_POLYGON","RECTANGLE"]);
        const lines = []; let budget = 400;
        const walk = (n, d) => {
          if (!n || budget <= 0 || SKIP.has(n.type)) return; budget--;
          const bb = n.absoluteBoundingBox, sz = bb ? " " + Math.round(bb.width) + "×" + Math.round(bb.height) : "";
          if (n.type === "TEXT") lines.push("  ".repeat(d) + "文字：" + String(n.characters||"").replace(/\s+/g, " ").slice(0, 200));
          else lines.push("  ".repeat(d) + n.type + " " + (n.name||"") + sz);
          (n.children||[]).forEach(c => walk(c, d + 1));
        };
        roots.forEach(n => walk(n, 0));
        const title = String(j.name || (roots[0] && roots[0].name) || "Figma 文件");
        const head = "Figma：" + title + (j.lastModified ? "（最后修改 " + j.lastModified + "）" : "") + "\n";
        // v26 看图：除了文字，再调 GET /v1/images/:file_key?ids=...&format=png&scale=2，把 PNG 地址一起返回；出图失败不影响文字
        let ids = node ? [node] : [];
        if (!ids.length) { const pg = (j.document && j.document.children && j.document.children[0] && j.document.children[0].children) || []; ids = pg.filter(n => n && n.id && ["FRAME","COMPONENT","COMPONENT_SET","SECTION"].includes(n.type)).slice(0, 3).map(n => n.id); }
        const images = []; let imagesError = "";
        if (!ids.length) imagesError = "没有可出图的节点（链接里没有 node-id，文件首页也没有顶层画板）";
        else {
          try {
            const ir = await fetch(`https://api.figma.com/v1/images/${m[1]}?ids=${ids.map(encodeURIComponent).join(",")}&format=png&scale=2`, { headers: { "X-Figma-Token": tok }, signal: T(25000) });
            const ij = await ir.json().catch(() => ({}));
            if (!ir.ok || ij.err) imagesError = ir.status === 403 ? "Figma 出图被拒绝（token 缺少 file_content:read 权限，或无文件权限）" : "Figma 出图失败：" + (ij.err || ir.status);
            else for (const id of ids) { const u = ij.images && ij.images[id]; if (u) images.push({ node_id: id, url: u }); }
            if (!imagesError && !images.length) imagesError = "Figma 没有返回 PNG 地址（节点可能不可渲染）";
          } catch (e) { imagesError = "Figma 出图失败：" + e.message; }
        }
        const imgText = images.length ? "\n\n设计稿 PNG（2x）：\n" + images.map(x => x.node_id + " " + x.url).join("\n") : "";
        const text = (head + lines.join("\n") + (budget <= 0 ? "\n…（内容太多，已截断）" : "")).slice(0, 8000 - imgText.length) + imgText;
        return json({ ok: true, url: String(b.url), title, content: text, images, images_error: imagesError || undefined, source: "figma-api" });
      } catch(e) { return json({ ok: false, msg: "Figma 连接器没调通：" + e.message }, 502); }
    }
    // ---- v27 截图连接器：Microlink（免 Key）→ 失败兜底 thum.io；Worker 里不跑浏览器 ----
    if (path === "/api/connectors/screenshot/execute" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const target = String(b.url||"").trim();
      let tu; try { tu = new URL(target); } catch { return json({ ok: false, msg: "链接格式不对" }, 400); }
      if (!/^https?:$/.test(tu.protocol)) return json({ ok: false, msg: "链接格式不对" }, 400);
      const h = tu.hostname.toLowerCase();
      if (h === "localhost" || !h.includes(".") || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h) || /\.(local|internal|lan)$/.test(h) || h.startsWith("[")) return json({ ok: false, msg: "内网/本地地址不能截图" }, 400);
      if (FEISHU_HOST_RE.test(h) || /(^|\.)figma\.com$/.test(h)) return json({ ok: false, msg: "飞书/Figma 链接请走各自的连接器，不走截图" }, 400);
      // 标题：尽力而为，拿不到就空
      const titleP = (async () => { try { const r = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" }, signal: T(4000) }); const t = (await r.text()).slice(0, 60000), m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(t), title = m ? m[1].replace(/\s+/g, " ").trim().slice(0, 120) : ""; const blocked = /(performing security verification|security verification|just a moment|attention required|cloudflare|cf-chl-|challenge-platform)/i.test(t); return { title, blocked }; } catch { return { title: "", blocked: false }; } })();
      let shot = "", source = "", err = "";
      try {
        const r = await fetch("https://api.microlink.io?url=" + encodeURIComponent(target) + "&screenshot=true&embed=screenshot.url&meta=false", { redirect: "manual", signal: T(12000) });
        const loc = r.headers.get("Location");
        if (r.status >= 300 && r.status < 400 && /^https:\/\//.test(loc || "")) shot = loc;
        else {
          const txt = await r.text();
          let j = null; try { j = JSON.parse(txt); } catch {}
          const u2 = (j && j.data && j.data.screenshot && j.data.screenshot.url) || (/^https:\/\/\S+$/.test(txt.trim()) ? txt.trim() : "");
          if (u2) shot = u2; else err = "Microlink " + r.status + (j && j.message ? "：" + j.message : "");
        }
        if (shot) source = "microlink";
      } catch (e) { err = "Microlink " + (e.name === "TimeoutError" ? "超时" : e.message); }
      if (!shot) { shot = "https://image.thum.io/get/width/1200/crop/800/" + target; source = "thum.io"; }
      const page = await titleP, title = page.title;
      if (page.blocked || /(performing security verification|security verification|just a moment|attention required|cloudflare)/i.test(title)) return json({ ok: true, url: target, title, blocked: true, message: "该网站需要验证，无法预览", source: "blocked" });
      return json({ ok: true, url: target, screenshot_url: shot, title, source, microlink_error: err || undefined });
    }
    // ---- v25 飞书连接器：读 docx 文档和知识库里的 docx（纯文本），只走 open.feishu.cn ----
    if (path === "/api/connectors/feishu/execute" && request.method === "POST") {
      const b = await request.json().catch(()=>({}));
      const user = await userFromReq(request, env, url, String(b.token||""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const f = feishuParse(b.url);
      if (!f) return json({ ok: false, msg: "不是飞书文档链接（支持 /docx/、/wiki/ 和 /file/）" }, 400);
      try {
        if (f.kind === "file") return json({ ok: true, url: String(b.url), source: "feishu-api", ...(await feishuReadFile(env, f, user)) });   // /file/ 读失败也返回 ok:true + 原因，不报“不是飞书文档链接”
        const res = await feishuRead(env, f);
        if (res.err) return json({ ok: false, msg: res.err, step: res.step }, res.code || 502);
        return json({ ok: true, url: String(b.url), title: res.title, content: res.content.slice(0, 8000), source: "feishu-api" });
      } catch(e) { return json({ ok: false, msg: "飞书连接器没调通：" + e.message }, 502); }
    }

    // ---- v29 模型清单：前端下拉直接读这里，以后加模型只改后端 WORK_MODELS / EXTRA，不用再改前端 ----
    if (path === "/api/models" && request.method === "GET") {
      const ex = (n) => (EXTRA.find((x) => x.name === n) || {}).models || [];
      return json({ ok: true, providers: [
        { id: "Groq", name: "Groq", models: WORK_MODELS.groq },
        { id: "Gemini", name: "Gemini", models: WORK_MODELS.gemini },
        { id: "OpenRouter", name: "OpenRouter", models: WORK_MODELS.openrouter },
        { id: "英伟达", name: "英伟达", models: ex("NVIDIA") },
        { id: "智谱", name: "智谱", models: ex("Zhipu") },
        { id: "GitHub Models", name: "GitHub Models", models: ex("GitHubModels") }
      ] });
    }
    // ---- v30 导出：/api/export/{docx|pptx|xlsx|csv|html}，纯 JS 生成，每次传完整 Markdown + part ----
    const expM = path.match(/^\/api\/export\/(docx|pptx|xlsx|csv|html)$/);
    if (expM && request.method === "POST") {
      const user = await userFromReq(request, env, url, "");
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      return handleExport(request, expM[1]);
    }
    // ---- v29 翻译：Riva 单独一步，Riva 没配/失败再用聊天模型兜底 ----
    if (path === "/api/translate" && request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(b.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const text = String(b.text || "").trim().slice(0, 12000);
      if (!text) return json({ ok: false, msg: "没有要翻译的内容" }, 400);
      const to = b.to === "en" ? "en" : b.to === "zh" ? "zh" : (cjkRatio(text) >= 0.5 ? "en" : "zh");
      try {
        let out = await rivaTranslate(env, text, to), via = "riva";
        if (!out) {
          const r = await tryAllFree([{ role: "system", content: "你是翻译。把用户给的文字翻成" + (to === "en" ? "英文" : "简体中文") + "，保留段落、列表和换行，只输出译文，不要解释。" }, { role: "user", content: text }], env, async () => {}, false, "", { raw: true });
          out = r && r.text; via = r ? r.from : "";
        }
        if (!out) return json({ ok: false, msg: "翻译失败：翻译模型和聊天模型都没有返回" }, 502);
        return json({ ok: true, to, text: out, via });
      } catch (e) { return json({ ok: false, msg: "翻译失败：" + e.message }, 502); }
    }
    // ---- v29 记忆：memory:{用户ID}:{项目ID}，记 对话 / 路线 / 进度 / 用户操作；换模型时带着它接着做 ----
    if (path === "/api/memory" && (request.method === "GET" || request.method === "PUT" || request.method === "POST")) {
      const body = request.method === "GET" ? {} : await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const pid = String(request.method === "GET" ? url.searchParams.get("project") : body.project || "").trim();
      if (!pid) return json({ ok: false, msg: "缺少 project" }, 400);
      if (request.method === "GET") return json({ ok: true, memory: (await env.KV.get(memKey(user, pid), "json")) || null });
      const clip = (x, n) => String(x == null ? "" : x).slice(0, n);
      const prev = (await env.KV.get(memKey(user, pid), "json")) || {};
      const mem = {
        messages: Array.isArray(body.messages) ? body.messages.slice(-2000).map((m) => ({ role: m.role === "user" ? "user" : "assistant", text: clip(m.text, 20000) })) : (prev.messages || []),   // 记全部，不再只记 40 条
        route: body.route !== undefined ? clip(body.route, 200) : (prev.route || ""),
        progress: body.progress !== undefined ? clip(body.progress, 400) : (prev.progress || ""),
        actions: Array.isArray(body.actions) ? body.actions.slice(-200).map((a) => ({ part: a.part == null ? "" : clip(a.part, 20), action: clip(a.action, 20), note: clip(a.note, 400), at: Number(a.at) || Date.now() })).concat((prev.actions || []).filter((a) => a.action === "对了" || a.action === "编了")).slice(-200) : (prev.actions || []),
        last_from: prev.last_from || "", updated_at: Date.now()
      };
      const str = JSON.stringify(mem);
      if (str.length > 4 * 1024 * 1024) return json({ ok: false, msg: "记忆太大（超过 4MB）" }, 413);
      await env.KV.put(memKey(user, pid), str);
      return json({ ok: true, size: str.length });
    }

    // ---- v62：百度地图完整 Web 服务直通 ----
    if (path === "/api/baidu") {
      if (request.method === "GET") return json({ ok: true, apis: BAIDU_APIS, verified: BAIDU_VERIFIED, ready: !!String(env.BAIDU_MAP_AK || "").trim(), tip: "POST {api 或 path, params}；path 填百度文档里 api.map.baidu.com 后面那一段" });
      if (request.method !== "POST") return json({ ok: false, msg: "请用 GET 或 POST" }, 405);
      const body = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      try {
        const p = body.api ? BAIDU_APIS[String(body.api)] : String(body.path || "");
        if (!p) return json({ ok: false, msg: "不支持的接口：" + (body.api || "(空)"), apis: Object.keys(BAIDU_APIS) }, 400);
        const out = await baiduRaw(env, p, body.params && typeof body.params === "object" ? body.params : {});
        if (out.image) return new Response(out.r.body, { status: out.r.status, headers: { "Content-Type": out.r.headers.get("content-type") || "image/png", ...CORS } });
        return json({ ok: true, api: body.api || null, path: p, http: out.http, status: out.data && out.data.status != null ? out.data.status : null, data: out.data });
      } catch (e) { return json({ ok: false, msg: String(e.message || e).split(String(env.BAIDU_MAP_AK || "~~")).join("***") }, e.status || 502); }
    }

    // ---- v65：全局 location_context（聊天和地点面板共用）：GET 读 / POST 存 / DELETE 清 ----
    if (path === "/api/location") {
      if (!["GET", "POST", "DELETE"].includes(request.method)) return json({ ok: false, msg: "请用 GET / POST / DELETE" }, 405);
      const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      if (request.method === "DELETE") { try { await env.KV.delete("loc:" + user); } catch {} return json({ ok: true, location: null }); }
      if (request.method === "GET") return json({ ok: true, location: await locLoad(env, user) });
      const loc = normLoc(body.location || body);
      if (!loc) return json({ ok: false, msg: "缺少有效的 lat / lng" }, 400);
      const eff = await locSave(env, user, loc);
      return json({ ok: true, location: eff, kept_previous: eff !== loc });
    }

    // ---- v61：地点选择 + 路线 + 周边（地点面板与对话共用同一定位结果和百度接口） ----
    if (path === "/api/places/line" || path === "/api/places/extras" || path === "/api/places/where" || path === "/api/places/suggest" || path === "/api/places/route" || path === "/api/places/nearby" || path === "/api/places/staticmap" || path === "/api/places/busrt") {
      if (request.method !== "POST") return json({ ok: false, msg: "请用 POST" }, 405);
      const body = await request.json().catch(() => ({}));
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      try {
        if (path === "/api/places/extras") return json({ ok: true, ...(await placeExtras(env, body)) });
        if (path === "/api/places/where") return json({ ok: true, ...(await placeWhere(env, body)) });
        if (path === "/api/places/line") return json({ ok: true, ...(await placeLine(env, body)) });
        if (path === "/api/places/suggest") {
          const q = String(body.q || "").trim().slice(0, 40); if (q.length < 1) return json({ ok: false, msg: "请输入地名" }, 400);
          const r = await placeSuggest(env, q); const lc = body.loc && Number.isFinite(Number(body.loc.lat)) && Number.isFinite(Number(body.loc.lng)) ? body.loc : null; return json({ ok: true, list: lc ? placeSortByDistance(r.list, lc) : r.list, sorted: !!lc, cached: !!r.cached, notes: r.notes || [] });
        }
        if (path === "/api/places/busrt") return json({ ok: true, ...(await placeBusRealtime(env, body.center, body.radius)) });
        if (path === "/api/places/staticmap") {
          const r = await placeStaticMap(env, body.c, body.p);
          return new Response(r.buf, { status: 200, headers: { ...CORS, "Content-Type": r.type, "Cache-Control": "private, max-age=3600", "X-Map-Via": encodeURIComponent(r.via) } });
        }
        if (path === "/api/places/nearby") {
          const r = await placeNearby(env, body.keyword, body.center, body.radius, body.cat, body.limit);
          return json({ ok: true, ...r });
        }
        const r = await placeRoute(env, String(body.mode || "transit"), body.from, body.to, String(body.tactics || ""));
        return json({ ok: true, ...r });
      } catch (e) { return json({ ok: false, msg: String(e.message || e).split(String(env.BAIDU_MAP_AK || "~~")).join("***") }, e.status || 502); }
    }

    // ---- v37 个人知识库：kb:{用户}，论文 / 链接 / 草稿 / 笔记，存在 KV，换手机也在 ----
    if (path === "/api/kb" || path === "/api/kb/delete" || path === "/api/kb/clear") {
      const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      if (path === "/api/kb/clear" && request.method === "POST") { await env.KV.delete("kb:" + user); return json({ ok: true, cleared: true, msg: "已清空" }); }
      if (path === "/api/kb/delete" && request.method === "POST") {
        const a = await kbLoad(env, user), id = String(body.id || ""), n = a.filter((x) => x.id !== id);
        if (n.length === a.length) return json({ ok: false, msg: "没找到这条资料" }, 404);
        await kbPut(env, user, n, false); return json({ ok: true });
      }
      if (path === "/api/kb" && request.method === "GET") {
        const a = await kbLoad(env, user), id = url.searchParams.get("id"), q = String(url.searchParams.get("q") || "").trim().toLowerCase(), ty = url.searchParams.get("type") || "";
        if (id) { const it = a.find((x) => x.id === id); return it ? json({ ok: true, item: it }) : json({ ok: false, msg: "没找到这条资料" }, 404); }
        let items = a.slice().reverse(); if (ty) items = items.filter((x) => x.type === ty);
        if (q) items = items.filter((x) => (x.title + " " + x.text + " " + x.url).toLowerCase().includes(q));
        return json({ ok: true, total: a.length, items: items.slice(0, 200).map((x) => ({ id: x.id, type: x.type, title: x.title, url: x.url, src: x.src, group: x.group, at: x.at, len: String(x.text || "").length, preview: cCl(x.text, 160) })) });
      }
      if (path === "/api/kb" && request.method === "POST") {
        if (!String(body.title || body.text || body.url || "").trim()) return json({ ok: false, msg: "标题、内容、链接至少填一个" }, 400);
        const r = await kbAdd(env, user, [{ type: body.type, title: body.title, url: body.url, text: body.text, src: cCl(String(body.src || "手动添加"), 60), group: body.group === "reference" ? "reference" : "" }], false);
        return r.ok ? json({ ok: true, added: r.added, truncated: String(body.text || "").length > KB_TXT }) : json({ ok: false, msg: "资料库满了（超过 4MB），先删掉一些再存" }, 413);
      }
    }
    // ---- v37 反馈 对 / 错：fb:{用户}；同时记进记忆里的“对了 / 编了” ----
    if (path === "/api/feedback" && (request.method === "POST" || request.method === "GET")) {
      const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
      const user = await userFromReq(request, env, url, String(body.token || ""));
      if (!user) return json({ ok: false, msg: "未登录，token失效" }, 401);
      const a = await fbLoad(env, user);
      if (request.method === "GET") return json({ ok: true, items: a.slice(-100).reverse() });
      const mid = String(body.mid || "").slice(0, 40); if (!mid) return json({ ok: false, msg: "缺少 mid" }, 400);
      const verdict = body.verdict === "ok" ? "ok" : body.verdict === "bad" ? "bad" : "";
      const rest = a.filter((x) => x.mid !== mid);
      if (verdict) rest.push({ mid, verdict, q: cCl(body.q, 300), a: cCl(body.a, 600), note: cCl(body.note, 300), at: Date.now() });
      await env.KV.put("fb:" + user, JSON.stringify(rest.slice(-FB_MAX)));
      const pid = String(body.project || "").trim();
      if (pid) { try { const mk = memKey(user, pid), mem = (await env.KV.get(mk, "json")) || {}; let acts = (Array.isArray(mem.actions) ? mem.actions : []).filter((x) => x.part !== "fb:" + mid); if (verdict) acts.push({ part: "fb:" + mid, action: verdict === "ok" ? "对了" : "编了", note: cCl(body.note || body.q, 300), at: Date.now() }); mem.actions = acts.slice(-200); mem.updated_at = Date.now(); await env.KV.put(mk, JSON.stringify(mem)); } catch {} }
      return json({ ok: true, verdict });
    }

    // ---- 对话（SSE 流式）----
    if (path === "/v1/chat/completions" && request.method === "POST") {
      if (env.REQUIRE_LOGIN === "1" && !(await userFromReq(request, env, url))) return json({ error: "请先登录" }, 401);
      const raw = await request.text();
      if (raw.length > 400000) return json({ error: "请求太大" }, 413);
      let b = {}; try { b = JSON.parse(raw); } catch {}
      const msgs = (Array.isArray(b.messages) ? b.messages : [{ role: "user", content: String(b.prompt || "") }])
        .filter((m) => m && ["system", "user", "assistant"].includes(m.role)).slice(-40);

      // 前端带 stream:true 就返回 SSE 流；老前端不带，就返回一整段 JSON（等待期间只发空格保活）
      const wantStream = b.stream === true;
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const enc = new TextEncoder();
      const write = (s) => writer.write(enc.encode(s)).catch(() => {});
      const sse = (t) => "data: " + JSON.stringify({ choices: [{ delta: { content: t } }] }) + "\n\n";
      let collected = "";
      const emit = (t) => { if (wantStream) return write(sse(t)); collected += t; return Promise.resolve(); };

      ctx.waitUntil((async () => {
        const ping = setInterval(() => write(wantStream ? ": ping\n\n" : " "), wantStream ? 5000 : 10000);
        try {
          // GitHub 拦截：用户说搜 GitHub，就直接调 GitHub API，不让模型编数据
          const lastUser = [...msgs].reverse().find(m=>m.role==="user");
          const lastText = textOf(lastUser?.content||"");
          // 地图周边请求在模型前强制走统一接口，避免模型编“无法定位”、表格或虚构地点。
          const nearbyQ = lastText.length <= 200 && !/【文件[:：]/.test(lastText) ? parseChatNearby(lastText) : null;
          if (nearbyQ) {
            try {
              const chatUser = await userFromReq(request, env, url, String(b.token || "")).catch(() => null);
              // 1) 用户这句话里点名的地点优先；2) 没点名就用全局 location_context（请求带的 > KV 里存的）；3) 都没有就只问一句，不去全国搜
              let ctxLoc = normLoc(b.location_context);
              if (ctxLoc) ctxLoc = await locSave(env, chatUser, ctxLoc); else ctxLoc = await locLoad(env, chatUser);
              let center = null, reply = "";
              if (nearbyQ.center) {
                const found = await placeSuggest(env, nearbyQ.center);
                const pick = pickBestPlace(found.list, nearbyQ.center, ctxLoc);   // v66：同名地点自动挑一个，不再让用户确认
                center = pick && pick.best;
                if (!center) reply = `没有找到“${nearbyQ.center}”，请补充城市或更具体的地址。`;
              } else {
                center = ctxLoc;
                if (!center) reply = "你现在在哪个地点？";
                else if (!nearbyQ.keyword) reply = "想查附近的什么？比如“附近 500 米有哪些公交站”。";
              }
              if (reply) await emit(reply);
              else await emit(nearbyReply(await placeNearby(env, nearbyQ.keyword, center, nearbyQ.radius)));
            } catch (e) { await emit("周边地图查询失败：" + String(e.message || e)); }
            if (wantStream) await write("data: [DONE]\n\n"); else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
            clearInterval(ping); await writer.close().catch(()=>{}); return;
          }
          // v89：天气优先使用前端 navigator.geolocation 的坐标；没有坐标就询问用户，绝不默认北京或使用 IP 定位。
          const weatherQ = lastText.length <= 200 && !/【文件[:：]/.test(lastText) && !/```/.test(lastText) && /天气|气温|温度|下雨|下雪|降雨|降水|带伞|穿什么|未来\s*7\s*天|未来七天/.test(lastText);
          if (weatherQ) {
            try {
              const loc = normLoc(b.location_context), place = cWeatherPlace(lastText);
              await emit(!place && !loc ? "没拿到你的定位，你在上海吗？请确认城市，或打开定位后再问一次。" : weatherDirectReply(await cWeather(lastText, env, loc)));
            } catch (e) { await emit("天气查询失败：" + String(e && e.message || e).slice(0, 180)); }
            if (wantStream) await write("data: [DONE]\n\n"); else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
            clearInterval(ping); await writer.close().catch(()=>{}); return;
          }
          // v88：热搜 / 热榜优先读糖果梦热榜缓存；问新闻时在后面附带今日新闻。
          // 只处理短消息，附件或长文中的“热搜”不应劫持正常问答。
          const hotQ = lastText.length <= 200 && !/【文件[:：]/.test(lastText) && !/```/.test(lastText) && /热搜|热榜|热议|热门排行|实时排行/.test(lastText);
          if (hotQ) {
            try {
              const reply = await hotNewsReply(env, /新闻|报道|快讯|头条|要闻|时事|今日热点|热点新闻/.test(lastText));
              if (reply) await emit(reply);
              else await emit("糖果梦热榜暂不可用：没有返回热榜缓存或最近一次抓取错误未记录。请点击首页热榜面板中的“刷新”重试。");
            } catch (e) { await emit("读取糖果梦热榜缓存失败：" + String(e && e.message || e).slice(0, 160)); }
            if (wantStream) await write("data: [DONE]\n\n"); else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
            clearInterval(ping); await writer.close().catch(()=>{}); return;
          }
          // v87：糖果指数 / 招采：短消息、没带附件时，直接调糖果梦接口回复（数字、顺序、链接全部来自接口，不经过模型）
          const tangQ = lastText.length <= 120 && !/【文件[:：]/.test(lastText) && !/```/.test(lastText) ? tangIntent(lastText) : null;
          if (tangQ) {
            try { await emit(tangQ.type === "candy" ? await candyReply(env, tangQ.cats) : await procureReply(env, tangQ)); }
            catch (e) { await emit((tangQ.type === "candy" ? "糖果指数" : "招采") + "没查到：" + String(e && e.message || e).slice(0, 200) + "。我不会编数据。"); }
            if (wantStream) await write("data: [DONE]\n\n"); else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
            clearInterval(ping); await writer.close().catch(()=>{}); return;
          }
          // v23：只拦“短消息、没带附件”的搜索意图。前端会把附件全文拼进消息，长文档里提到 GitHub 不该被劫持。
          const isGithubQ = lastText.length <= 200 && !/【文件[:：]/.test(lastText) && /github/i.test(lastText) && /(搜|查|找|仓库|repo)/i.test(lastText);
          if (isGithubQ) {
            const pat = String(env.GH_PAT||"").trim();
            if (!pat) { await emit("GitHub 连接器没调通：GH_PAT 没有配置，请先在 Cloudflare 里配 GH_PAT"); }
            else {
              try {
                const m = lastText.match(/(?:openmanus|[a-zA-Z0-9_\-\.\/]+)/i);
                // 取 openmanus 或用户说的关键词，默认 openmanus
                const q = /openmanus/i.test(lastText) ? "openmanus" : (lastText.split(/\s+/).filter(w=>w.length>2 && !/github|搜|查|找|仓库|帮我|一下/i.test(w))[0]||"openmanus");
                const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=5`, { headers: { Authorization: "Bearer "+pat, Accept: "application/vnd.github+json", "User-Agent": "OpenManus" }, signal: T(10000) });
                if (!r.ok) { await emit(`GitHub 连接器没调通：GitHub API 返回 ${r.status}`); }
                else {
                  const j = await r.json();
                  const lines = (j.items||[]).map((x,i)=>`${i+1}. ${x.full_name} ★${x.stargazers_count} | ${x.language||""} | ${x.description||""}\n   ${x.html_url}`).join("\n\n");
                  await emit(`在 GitHub 上搜 “${q}”，共找到 ${j.total_count} 个，取前 5 个（真调 GitHub API，不是编的）：\n\n${lines||"没找到"}`);
                }
              } catch(e) { await emit("GitHub 连接器没调通："+e.message); }
            }
            if (wantStream) await write("data: [DONE]\n\n"); else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
            clearInterval(ping); await writer.close().catch(()=>{}); return;
          }
          // 工作模式：先走云端大模型，Kaggle 当备用（Kaggle 断了也不影响干活）
          const requested = normProvider(b.provider);
          const requestedModel = typeof b.model === "string" ? b.model.trim().slice(0, 120) : "";   // v29：前端选的具体模型，先试它，不通再按原顺序兜底
          let msgs2 = msgs;
          try { const pt = await preTranslate(msgs, env); if (pt) msgs2 = pt; } catch {}   // v29：说“翻译”或正文是英文 → 先让 Riva 翻一遍
          let memUser = null, mem = null;
          if (b.project_id && env.KV) { try { memUser = await userFromReq(request, env, url, String(b.token || "")); if (memUser) mem = await env.KV.get(memKey(memUser, b.project_id), "json"); } catch {} }
          const notify = (t) => wantStream ? write("data: " + JSON.stringify({ notice: t }) + "\n\n") : emit("\n\n（" + t + "）");
          // 资料库只在用户明确提出“查我的资料”时参与回答；普通问题和实时搜索不读取它。
          let kbHits = [], kbUser = memUser;
          const wantsKb = /(?:查|搜索|搜|找|看看|读取|列出|告诉我).{0,12}我的资料|我的资料.{0,12}(?:有哪些|内容|查|搜|搜索|查询)/i.test(lastText);
          try {
            if (env.KV && b.kb !== false && wantsKb && lastText.length <= 300 && !/```/.test(lastText)) {
              if (!kbUser) kbUser = await userFromReq(request, env, url, String(b.token || ""));
              if (kbUser) {
                kbHits = kbSearch(await kbLoad(env, kbUser), lastText.replace(/我的资料/g, ""), 3);
                if (kbHits.length) { msgs2 = mergeSys(msgs2, kbSystem(kbHits)); notify("已查询「我的资料」，命中 " + kbHits.length + " 条"); }
                const fs = fbSystem(await fbLoad(env, kbUser), lastText); if (fs) msgs2 = mergeSys(msgs2, fs);
              }
            }
          } catch {}
          // v34：自动选连接器查资料（不用打前缀）。只处理短消息、没带附件、没带代码块；查到的真实资料塞进 system，回答后由系统附“来源”
          let connRes = null;
          try {
            if (b.connectors !== false && lastText.length <= 300 && !/【文件[:：]/.test(lastText) && !/```/.test(lastText)) {
              const cids = routeConnectors(lastText, env);
              if (cids.length) {
                connRes = await runConnectors(cids, lastText, env); msgs2 = mergeSys(msgs2, connSystem(connRes));
                // 实时搜索结果不自动写入“我的资料”；保存只能由用户主动操作并确认。
              }
            }
          } catch {}
          const freeFirst = await tryAllFree(msgs2, env, emit, wantStream, requested, { model: requestedModel, memory: mem });
          let interrupted = "";
          if (freeFirst) {
            if (!freeFirst.streamed) await emit(freeFirst.text);
            interrupted = freeFirst.err || "";   // 所有模型都接不上才会走到这：只提示，已写的内容保留
            if (mem && memUser) { try { mem.last_from = freeFirst.from; mem.updated_at = Date.now(); await env.KV.put(memKey(memUser, b.project_id), JSON.stringify(mem)); } catch {} }
            if (wantStream) await write("data: " + JSON.stringify({ meta: { from: freeFirst.from, requested: requested || undefined, model: requestedModel || undefined, resumed: freeFirst.resumed || undefined } }) + "\n\n");
          } else {
            const r = AGG ? await kaggleStream(AGG, msgs, emit) : { got: false, err: "还没有 Kaggle 链接" };
            if (!r.got) await emit("❌ 云端模型都失败了" + (r.err ? "，Kaggle 也不可用（" + r.err + "），请稍后再试" : "，请稍后再试"));
            else interrupted = r.err || "";
          }
          if (!interrupted) { let f = connRes ? connFooter(connRes, lastText) : ""; const kf = wantsKb ? kbFooter(kbHits) : ""; if (kf) f = f ? f + "\n" + kf : "\n\n" + kf; if (f) await emit(f); }
          if (interrupted) await notify("回复中断：" + interrupted);
          if (wantStream) await write("data: [DONE]\n\n");
          else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: collected || "(空回复)" } }] }));
        } catch (e) {
          if (wantStream) await write(sse("❌ " + e.message));
          else await write(JSON.stringify({ choices: [{ message: { role: "assistant", content: "❌ " + e.message } }] }));
        } finally { clearInterval(ping); await writer.close().catch(() => {}); }
      })());

      return new Response(readable, { headers: wantStream
        ? { ...CORS, "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" }
        : { ...JH, "Cache-Control": "no-cache, no-transform" } });
    }

    // 不存在的 /api/ 接口要明确报错，不能假装成功
    if (path.startsWith("/api/")) return json({ ok: false, msg: "接口不存在: " + path }, 404);
    return json({ ok: true, agg: AGG || "not set" });
}
