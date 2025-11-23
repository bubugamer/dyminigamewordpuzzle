# WordPuzzle 小程序 & 云端示例

该仓库包含一个最小可运行的抖音小游戏示例，以及对应的抖音云（Douyin Cloud）后端示例。

## 内容说明
- `game.js`：基于 Canvas 的 “WordPuzzle”（文字谜题）小游戏入口，会绘制欢迎界面。
- `cloudfunctions/quickstart`：Node.js 云函数模板，展示 OpenID 获取、二维码生成、内容安全（`antidirt`）、对 `todos` 集合的基础 CRUD，以及上下文回显示例。
- `java-springboot-demo`：Spring Boot 容器示例，通过抖音云网关暴露与上述云函数类似的接口。

## 快速开始（小游戏）
1. 安装抖音开发者工具，将项目根目录导入；AppID 使用 `tt78870e3ae7858cd802`（或替换成你自己的）。
2. 确保云函数根目录为 `cloudfunctions/`（由 `project.config.json` 指定）。
3. 在模拟器运行/预览，会看到带有项目图标的 Canvas 欢迎界面。

## 云函数（Node.js）
1. 执行 `cd cloudfunctions/quickstart && npm install` 安装依赖。
2. 在抖音云控制台使用 “quickstart” 模板部署，或直接上传该文件夹。
3. 可调用的云函数包括：
   - `get_open_id`：返回网关注入的 `openId`。
   - `qrcode_create`：通过云调用 OpenAPI 生成小程序二维码。
   - `antidirt`：调用内容安全 OpenAPI 检测文本风险。
   - `todos`：读取 `todos` 集合中的所有文档（需预先创建该集合）。
   - `insert_record`、`select_record`、`update_record`：对 `demo` 集合进行 CRUD 的示例。
   - `quick_start`：回显请求上下文，用于调试。

## Java Spring Boot 示例
- 路径：`java-springboot-demo`，基于 Java 8 和 Maven Wrapper。
- 本地运行（端口 8000）：`cd java-springboot-demo && ./mvnw spring-boot:run`。
- 关键接口：
  - `GET /get_open_id`：需要请求头 `X-TT-OPENID`，并原样返回。
  - `POST /antidirt`：代理调用文本内容安全云 API。
  - `insert_record`、`select_record`、`update_record`：返回占位示例（云数据库仅支持 Node）。
- 构建 Jar/容器：执行 `./mvnw package`，然后使用仓库内的 `Dockerfile` 与 `run.sh` 部署。

## 参考文档
- 抖音小游戏介绍：https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/guide/minigame/introduction
- 抖音云开发指南：https://developer.open-douyin.com/docs/resource/zh-CN/developer/tools/cloud/develop-guide/cloud-call
- 更详细的云函数与 Java 示例说明见 `cloudfunctions/quickstart/README.md` 和 `java-springboot-demo/README.md`。