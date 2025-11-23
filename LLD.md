脑洞王小游戏低阶设计（LLD）

一、范围与目标
	•	范围：单人通关式文字猜图游戏；抖音小游戏平台，Canvas 2D 渲染，自绘 UI 和虚拟键盘；本地内置关卡为主，可选云端题库 OTA。
	•	目标：在抖音小游戏平台提供顺畅的关卡流（首页 → 作答 → 结果 → 通关），支持本地存档与基础反馈提示；云端题库优先、本地题库兜底。

⸻

二、客户端架构与目录
	•	game.js
	•	入口，获取 systemInfo，初始化 Canvas 2D、事件监听、资源预加载。
	•	管理主循环与场景调度。
	•	game.json
	•	小游戏配置：竖屏锁定、调试开关、canvas 配置、云函数路径。
	•	assets/levels.js
	•	本地关卡数据表，字段见数据模型。
	•	assets/images/
	•	关卡图 level-{id}.png（与 Level.id 对应）。
	•	UI 图标 ui-{name}.png。
	•	styles/theme.js
	•	主题常量：颜色、字号、间距、圆角、阴影等。
	•	state/index.js
	•	全局状态单例：当前场景、关卡索引、输入字符、结果态、静音、最高进度。
	•	对外提供初始化、读写接口与校验。
	•	utils/draw.js
	•	Canvas 2D 通用绘制：背景、圆角卡片、按钮、遮罩、弹窗、文本、虚拟键盘、输入格子。
	•	utils/input.js
	•	触摸命中检测（基于逻辑坐标）、虚拟键盘映射、事件分发。
	•	utils/storage.js
	•	存档封装：progress、settings 的读写与默认值处理。
	•	utils/sound.js（可选）
	•	音效播放、静音切换。
	•	utils/normalize.js
	•	答案字符串标准化：去空白、去标点、繁转简等。
	•	scenes/home.js
	•	首页渲染与点击“开始”逻辑。
	•	scenes/level.js
	•	关卡渲染、输入格子、虚拟键盘、提交与结果弹窗、下一关。
	•	scenes/clear.js
	•	通关页，支持再玩一轮/回到首页。
	•	（可选联网）cloudfunctions/levels/、cloudfunctions/report/
	•	具体见接口与云函数规划。

⸻

三、数据模型

3.1 Level

type Level = {
  id: number;
  image: string;        // 关卡图片相对路径或远程 URL
  answers: string[];    // 主答案列表（至少一个）
  altAnswers?: string[];// 容错答案列表
  hint?: string;        // 可选提示文案
  length?: number;      // 可选：展示格子数，优先级高于 answers[0].length
};

	•	若 length 存在：渲染格子数量 = length。
	•	若 length 缺失：渲染格子数量 = answers[0].length。
	•	若 answers 为空：视为非法关卡，初始化时过滤掉。

3.2 State

type Stage = 'home' | 'level' | 'clear';

type GameState = {
  stage: Stage;                 // 当前场景
  currentIndex: number;         // 当前关卡索引，0 表示第 1 关
  chars: string[];              // 当前作答字符数组，长度 = 当前关卡格子数
  result: 'correct' | 'wrong' | null; // 当前结果态
  muted: boolean;               // 是否静音
  maxUnlocked: number;          // 已解锁的最大关卡索引（0-based）
  levels: Level[];              // 当前生效关卡列表（云端覆盖后）
};

	•	currentIndex、maxUnlocked 均为 0-based。
	•	每次加载/更新题库后需保证：
	•	若 levels.length === 0，直接退回首页并提示“题库异常”；
	•	否则 maxUnlocked = min(maxUnlocked, levels.length - 1)。

⸻

四、核心流程

4.1 初始与题库加载
	1.	启动 game.js：
	•	读取本地存档（progress、settings）。
	•	加载本地 assets/levels.js 构造初始 levels。
	•	state.init(levels)：
	•	若有进度：maxUnlocked = clamp(stored.maxUnlocked)，currentIndex = 0 或 maxUnlocked（按产品决定，默认=0）；
	•	若无进度：maxUnlocked = 0，currentIndex = 0。
	•	stage = 'home'。
	2.	异步请求云端 /levels：
	•	成功且有有效 data：用云端 data 覆盖 levels；按新 levels 重新 clamp maxUnlocked 与 currentIndex。
	•	失败或返回异常：保持本地关卡，不做 UI 提示，仅 console.log。

4.2 首页
	•	渲染游戏标题、开始按钮、最高通关进度等。
	•	点击“开始”：
	•	设置 stage = 'level'；
	•	对应 currentIndex 的关卡初始化 chars 与 result=null。

4.3 关卡
	•	根据 currentIndex 取当前 Level：
	•	渲染关卡图片 image。
	•	计算格子数量：len = level.length ?? normalize(level.answers[0]).length。
	•	初始化 chars = Array(len).fill('')。
	•	输入与键盘：
	•	使用自绘虚拟键盘，不使用系统原生输入框。
	•	点击任一格子：将“焦点索引”设置为该格。
	•	默认焦点为第一个空格子（若没有空格子，则为最后一格）。
	•	虚拟键盘：
	•	字符按键：在当前焦点格写入 1 字（覆盖已有内容），焦点自动右移一格；若已在最后一格，则停留。
	•	删除键：清空当前格内容；若当前格为空则清空前一个非空格子，并将焦点移到该格。
	•	提交键：触发 checkAnswer。
	•	不支持长按连续删除（首版简化）。
	•	提交与判定：
	•	raw = chars.join('')。
	•	cleaned = normalize(raw)，其中：
	•	去掉所有空白（包括半角/全角空格）。
	•	去掉常见中英文标点（如 ,.?!，。？！ 等）。
	•	可选：繁体转简体（在 utils/normalize.js 实现）。
	•	对每个 answers 与 altAnswers 执行同样的 normalize：
	•	match = any(normalize(a) === cleaned)。
	•	匹配成功：result='correct'，弹出正确弹窗；
	•	匹配失败且输入非空：result='wrong'，弹出错误提示弹窗；
	•	输入全部为空时提交：不做判定，可直接忽略或提示“请先输入”。
	•	结果弹窗：
	•	正确：显示“回答正确”，按钮“下一关”；
	•	错误：显示“再想想”，按钮“继续作答”。
	•	点击按钮关闭弹窗；正确时调用 nextLevel()。
	•	进度与存档：
	•	每次答对某关时：
	•	若 currentIndex > maxUnlocked，更新 maxUnlocked = currentIndex；
	•	调用 storage.saveProgress({ maxUnlocked, muted })。

4.4 下一关与通关
	•	nextLevel()：
	•	若 currentIndex < levels.length - 1：
	•	currentIndex++；
	•	重置 chars 为新关长度数组；
	•	result = null；
	•	返回 stage='level'。
	•	若已是最后一关：
	•	stage='clear'；
	•	进入通关场景。

4.5 通关页
	•	展示完成态（例如“恭喜通关，共 X 关”）。
	•	按钮“再玩一轮”：
	•	currentIndex = 0；
	•	stage='level'；
	•	重新初始化第一关 chars 与 result。
	•	可选按钮“返回首页”：stage='home'。

⸻

五、资源与命名
	•	关卡图片：assets/images/level-{id}.png，例如：
	•	level-1.png：柴犬八只图；
	•	level-2.png：Mate 手机 + 湿书图。
	•	UI 图标：
	•	assets/images/ui-start.png
	•	assets/images/ui-correct.png
	•	assets/images/ui-wrong.png 等。
	•	颜色与字号（在 styles/theme.js）：
	•	colors.primary、colors.bg、colors.text、colors.accent、colors.overlay。
	•	fontSizes.title、fontSizes.levelText、fontSizes.button 等。

⸻

六、错误与降级
	•	图片加载失败：
	•	使用统一占位图 assets/images/level-placeholder.png；
	•	保持输入与提交逻辑可用。
	•	云函数失败：
	•	获取题库失败：仅 console.log 记录错误，保持本地 levels 玩法，不弹提示。
	•	上报通关失败：静默忽略，仅 console.log。

⸻

七、接口与云函数规划（可选）

默认为纯本地玩法；以下云函数用于 OTA 与统计，可按需启用。

7.1 云函数：获取关卡列表
	•	路径：cloudfunctions/levels/index.ts
	•	触发：HTTP/云调用
	•	请求：GET /levels
	•	响应：

{
  "code": 0,
  "message": "",
  "data": [
    {
      "id": 1,
      "image": "https://.../level-1.png",
      "answers": ["八方来财"],
      "altAnswers": ["八方来柴"],
      "hint": "发财/柴谐音",
      "length": 4
    }
  ]
}

	•	客户端策略：
	•	启动时加载本地题库即可开始游戏。
	•	异步请求 /levels，若 code === 0 且 data 非空，则用返回 data 覆盖本地 levels。
	•	覆盖后执行 clamp(maxUnlocked)，更新 currentIndex。
	•	若失败则完全忽略，继续使用本地题库。

7.2 云函数：上报通关结果
	•	路径：cloudfunctions/report/index.ts
	•	触发：HTTP/云调用
	•	请求：POST /report

{
  "levelId": 1,
  "result": "correct",
  "durationMs": 12000,
  "timestamp": 1710000000000
}

	•	响应：

{ "code": 0, "message": "" }

	•	用途：收集匿名玩法统计，不做排行榜。
	•	客户端：失败时静默忽略，仅 console.log。

7.3 云函数实现要点
	•	入口：export default async function (params, context)。
	•	返回体统一：{ code, message, data }。
	•	请求体校验：
	•	限制 answers、altAnswers 字符串长度（如 ≤ 32）；
	•	限制数组长度和关卡数量。
	•	日志：记录调用来源和错误信息，不向前端暴露堆栈。

⸻

八、状态管理逻辑
	•	初始化：

state.init(localLevels) {
  const stored = storage.loadProgress();
  const levels = filterValidLevels(localLevels);
  let maxUnlocked = 0;
  let currentIndex = 0;

  if (stored && typeof stored.maxUnlocked === 'number') {
    maxUnlocked = clamp(stored.maxUnlocked, 0, levels.length - 1);
    currentIndex = 0; // 或 maxUnlocked，按产品选择
  }

  return { stage: 'home', currentIndex, maxUnlocked, levels, ... };
}

	•	更新字符：setChar(idx, char)
	•	仅接受单字符：value.slice(-1)。
	•	覆盖该格原有内容，并可更新焦点索引。
	•	校验：checkAnswer(chars)
	•	raw = chars.join('')
	•	cleaned = normalize(raw)
	•	matched = answers.some(a => normalize(a) === cleaned) || altAnswers.some(...)。
	•	进度：nextLevel()
	•	若 currentIndex < levels.length - 1：自增并重置 chars、result。
	•	否则：stage='clear'。
	•	存档：
	•	storage.saveProgress({ maxUnlocked, muted })。
	•	storage.loadProgress() 提供默认值。

⸻

九、事件与输入
	•	触摸命中：
	•	input.hitTest(x, y) 将屏幕坐标映射为逻辑坐标（基于统一逻辑宽度 750），判断是否命中按钮、输入格子或键盘按键。
	•	虚拟键盘：
	•	字符键 → setChar + 焦点右移。
	•	删除键 → 删除当前或上一个格子内容。
	•	提交键 → 触发 checkAnswer。
	•	防抖：
	•	提交按钮在一次判定完成前禁止二次触发。

⸻

十、渲染与性能
	•	渲染基础：
	•	使用抖音小游戏 Canvas 2D 上下文（canvas.getContext('2d')），不依赖 DOM。
	•	以逻辑宽度 750 为基准，按 windowWidth 比例缩放所有坐标与尺寸。
	•	预加载：
	•	启动时预加载当前关卡图片和下一关图片（若存在）。
	•	重绘策略：
	•	事件驱动重绘：输入变更、结果态变化、场景切换时触发重绘。
	•	无持续动画时不做逐帧循环。
	•	动效：
	•	按钮按压缩放、弹窗渐入可通过简单时间插值实现；后续如需复杂动效，可增加统一帧驱动渲染器。

⸻

十一、存储键
	•	ndw-v1-progress：

{ "maxUnlocked": 0 }

	•	ndw-v1-settings：

{ "muted": false }


⸻

十二、安全与合规
	•	云函数返回数据需脱敏，不含用户标识。
	•	上传字符串（如答案、hint）限制长度（例如 ≤ 32 字）。
	•	拒绝超大数组与异常 payload，避免占用过多内存。
	•	不收集明确的用户身份信息，如需统计，可在客户端生成匿名 sessionId，仅用于聚合分析。