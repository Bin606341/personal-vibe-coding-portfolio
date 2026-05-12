# HoopVerse 篮球宇宙

一个 React + Vite + Three.js 制作的篮球主题 MVP 网站，包含 3D 互动首页和五个 NBA 篮球知识板块。

## 本地运行

不要直接双击 `index.html`。这是 Vite 前端项目，需要通过本地开发服务器访问。

```powershell
npm install
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

打开：

```text
http://127.0.0.1:5174/
```

## 可用命令

```powershell
npm test
npm run build
npm run test:e2e
```

## MVP 内容说明

- 首页支持方向键顺滑移动、斜向移动、贴身运球、`D` 键按住蓄力并松开投篮，靠近入口后进入板块。
- 顶部导航可直接访问现役球员、名人堂、教学区、战术区、经典绝杀。
- 现役球员区展示 30 支 NBA 球队入口，使用 NBA.com League Roster 生成的本地静态 roster 缓存。
- 队徽、现役球员头像和名人堂头像已从 NBA CDN 缓存到 `public/nba`，避免浏览器直接访问 CDN 时出现 HTTP/2 加载失败。
- 教学区、战术区和经典绝杀区都使用本地缓存的视频素材；点击播放只会在当前卡片内播放，放大按钮才会打开弹窗。
- 视频素材来自开放授权来源并缓存到 `public/media`；正式公开部署前仍应核对授权范围和数据更新频率。
