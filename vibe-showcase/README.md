# Vibe Coding 展示页 —— 「猫&鱼 · 情侣记录」

作品集网站的独立板块：左侧 390×844 手机视口里**真实运行**应用，右侧项目信息 + 演示控制。
目标是最终嵌进秋招作品集网站，现阶段独立开发、方便快速调整。

## 快速开始

双击 `启动.bat`（自动起本地服务 + 开浏览器），或手动：

```bash
node server.js     # 然后访问 http://localhost:4820
```

> ⚠️ 必须走本地服务，不能直接双击 index.html 打开——file:// 下 iframe 是跨域的，鼠标模拟触摸会失效。
> 端口用 4820 而不是常见的 4173，是为了避开别的项目 vite preview 的默认端口。

## 文件结构

```
vibe-showcase/
├─ index.html       # 展示壳：手机框 + 触摸桥 + 右侧面板 + 引导演擎 + 快速调整区(CONFIG)
├─ app-real/        # ✅ 真实应用的演示构建（无 Supabase、纯本地虚构数据）
├─ catfish-demo/    # 真实应用的源码副本 + 演示补丁（node_modules 是目录联接，不占空间）
│   └─ src/…        # 与原项目的差异见下方「演示构建做了什么」
├─ app/index.html   # 早期占位小应用（已废弃，仅作备用参考）
├─ server.js        # 本地静态服务器（零依赖，含 /app-real/ SPA 回退）
├─ 启动.bat         # 双击即用
├─ smoke.mjs        # 占位应用的历史冒烟测试
├─ smoke-real.mjs   # 真实应用全流程验收（14 项，需托管浏览器 CDP 端口 19542）
└─ vibe-real-final.png  # 最近一次验收截图
```

## 快速调整

**改文案 / 演示步骤 / 应用地址** → 只动 `index.html` 顶部的 `CONFIG` 块（`appUrl` 当前指向 `app-real/index.html`）：

- `demoSteps`：引导演示的每一步（文字 + 高亮目标选择器 + 动作类型）

**改右侧面板文字** → index.html 里 `<aside class="panel">` 那一段，直接改 HTML。

**改配色** → `<style>` 顶部的 `:root` CSS 变量（猫橙 `#F6B26B`、鱼蓝 `#A8DADC` 已留在变量里）。

## 接入真实的猫&鱼应用（已完成 2026-08-30）

真实应用已接入并全流程验收（14 项断言全绿）。源码在 `WorkBuddy/2026-08-03-16-18-05/catfish/`（PROJECT.md 为接手文档）。

### 演示构建做了什么（相对原项目的差异，全部只在 catfish-demo/ 副本内，原项目未动一字）

1. **不配置 Supabase**：不拷 `.env` → `src/lib/supabase.js` 自动降级到 localStorage 本地存储，产物经审计零 Supabase 端点
2. **`public/demo-boot.js`**（新增）：首次进入写入全套虚构种子数据（美食/电影/旅行/想吃/想去/留言），预置身份「小猫」与已验证状态（跳过验证码）；监听 `vibe:reset` 消息实现「重置演示数据」
3. **`index.html`**：注入 demo-boot.js；移除 Google Fonts 外链（会阻塞首屏渲染，且公开环境不保证可达）；验证码在 `useAuth.js`/`Verify.jsx` 里改为 `'demo'`（真实验证码不得进入任何对外包），改完需重新构建才会从产物里消失
4. **`vite.config.js`**：去掉 PWA 插件（Service Worker 会和宿主作品集网站冲突）；`base: '/app-real/'`
5. **`App.jsx`**：BrowserRouter → HashRouter（路由挂 hash，嵌入任何子路径都不会把地址推回根路径，也免去服务器回退依赖）
6. **data-demo 标记**：Home 美食卡 / FoodRecords 记录卡、＋ 按钮、完成按钮——供引导演示高亮；`PageTransition.jsx` 的 StaggerItem 改为透传 props

更新演示版流程：同步源码差异到 `catfish-demo/src/` → `npm run build` → 用 `catfish-demo/dist` 替换 `app-real/`。

### 隐私红线（已核对 ✓）

- ✅ 演示产物无 Supabase 端点引用（已审计 dist 内所有 js/html）
- ✅ 演示数据全虚构（云边咖啡馆 / 星际邮差 / 青岛……），存浏览器本地，「重新开始」即复原
- ✅ 真实验证码已从演示源码与产物中移除（改为 `'demo'`，正常流程也走不到验证页）
- ✅ `hero-couple` / 头像均为插画，无真人照片（已逐张核验）
- ⚠️ 唯一保留的真实信息：首页「since 2026.01.05」（恋爱开始日，`catfish-demo/src/lib/config.js` 的 `RELATIONSHIP_START_DATE`）。想改虚构日期就改那一行后重新构建

## 对外交接包

- `..\Vibe展示页-交接包.zip`（轻量：壳 + 产物 + 交接说明，只能改展示壳）
- `..\Vibe展示页-源码交接包.zip`（含 `catfish-demo/` 源码副本，对方可自改自构建；不含 node_modules，需 `npm install`）
- 两个包都经过审计：无 `.env`、无 Supabase 端点、无真实验证码、无未引用大图
- 重打包：`Compress-Archive -Path index.html, app-real, 交接说明.md` （源码包再加 `catfish-demo`，用 robocopy 先排 node_modules：`/XD node_modules /XF hero-couple.*`）

## 嵌入作品集网站

两种方式，到时选一个：

1. **整页 iframe**：作品集里放一个入口卡片，点击后 iframe 加载这个展示页（最省事，推荐）
2. **拆组件**：把 `.stage` 那一块连同样式抠出去合进作品集的页面体系（样式可能冲突，工作量大）

## 冒烟测试

改了壳子或重新构建应用之后跑一遍 `node smoke-real.mjs`（需本地服务端口空闲 + Cola 托管浏览器在跑），
覆盖：应用启动、演示模式 6 步推进、受信点击进模块/表单、种子数据可见、复位复原、无 JS 异常。
