# Yu Detective Agency — 部署说明

这是一个可直接部署的静态网站。入口文件是 `index.html`，网站使用相对路径加载本地脚本、模型、图片与 `assets/timelooper.mp3`。

## 本地预览

需要 Node.js 18 或更高版本：

```bash
node dev-server.mjs
```

然后打开 <http://127.0.0.1:4180/>。

## 部署到静态托管

将压缩包解压后的目录整体上传到静态托管服务（如 Nginx、Apache、Vercel、Netlify 或 GitHub Pages），并将站点根目录指向包含 `index.html` 的目录。无需构建步骤。

服务器需要正确返回以下 MIME 类型：

- `.html` → `text/html`
- `.js` → `text/javascript`
- `.css` → `text/css`
- `.json` → `application/json`
- `.mp3` → `audio/mpeg`

Three.js、OrbitControls、GSAP 和二维码模块目前通过 CDN import map 加载，因此线上访问需要允许外网请求；如需完全离线部署，再将这些依赖下载到本地并修改 `index.html` 的 import map。

## 目录说明

- `index.html`：主场景入口
- `AudioPlayer.js` / `AudioPlayer.css`：背景音乐与音量控件
- `assets/`：图片和 Timelooper 音频
- `*-preview/`：场景模型与交互页面资源
- `vibe-showcase/`、`startup-stall-preview/`：嵌入式子项目
- `vendor/`：本地第三方静态依赖
