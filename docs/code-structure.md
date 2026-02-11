# 代码结构介绍

## 1. 项目定位
`live-server-here` 是一个基于 **Electron + React + Vite** 的桌面应用，用于从 Windows 资源管理器快速启动静态文件服务（`live-server`）。

- Electron 主进程负责窗口、托盘、IPC、服务进程管理。
- React 渲染进程负责仪表盘、历史、收藏、设置、日志等 UI。
- 子进程负责真正启动 `live-server`。

## 2. 目录总览
```text
live-server-here/
├─ src/                        # React UI 源码
│  ├─ main.jsx                 # 前端入口
│  ├─ App.jsx                  # 路由入口
│  ├─ i18n.js                  # 国际化资源
│  ├─ pages/                   # 页面：Dashboard/History/Favorites/Settings/Logs/About
│  └─ components/              # UI 组件：Layout/ServerCard/CompactServerItem/Toast/TitleBar
├─ main.js                     # Electron 主进程入口（打包运行）
├─ preload.js                  # Electron 预加载层，向前端暴露 window.api
├─ server-manager.js           # 服务生命周期管理（启动/停止/广播状态）
├─ server-runner.js            # 子进程执行 live-server
├─ tray-manager.js             # 系统托盘菜单与交互
├─ logger.js                   # 文件日志读写与清理
├─ index.html                  # Vite 页面模板
├─ vite.config.js              # 前端构建配置（输出 dist-ui）
├─ dist-ui/                    # 前端构建产物
└─ docs/                       # 项目文档目录
```

## 3. 运行架构与数据流
### 3.1 启动链路
1. `main.js` 创建无边框窗口并加载 `dist-ui/index.html`。
2. `preload.js` 通过 `contextBridge` 暴露 `window.api`。
3. React 页面通过 `window.api` 发起 IPC 调用。
4. `main.js` 的 `ipcMain.handle(...)` 执行业务逻辑（启动服务、读取历史、更新设置等）。
5. `server-manager.js` 管理子进程，并向窗口广播 `server-update`。

### 3.2 服务启动链路
1. 前端触发 `window.api.startServer(rootPath)`。
2. 主进程调用 `serverManager.startServer(rootPath, basePort)`。
3. `server-manager.js` 使用 `portfinder` 找可用端口并 `fork` `server-runner.js`。
4. `server-runner.js` 调用 `live-server.start(...)` 启动 HTTP 服务。
5. 状态变化通过 `ipc` + `BrowserWindow.webContents.send('server-update', ...)` 回推前端和托盘。

## 4. 前端结构（`src/`）
- `src/main.jsx`：挂载 React 应用。
- `src/App.jsx`：`HashRouter` 路由组织，挂载 `Layout` 与各页面。
- `src/components/Layout.jsx`：侧边栏 + 页面容器，显示活动服务数量与版本。
- `src/pages/Dashboard.jsx`：核心页面，支持目录选择、拖拽启动、服务卡片管理。
- `src/pages/History.jsx`：历史记录列表与重启/删除。
- `src/pages/Favorites.jsx`：收藏目录列表与快速启动。
- `src/pages/Settings.jsx`：语言、主题、默认端口、日志页入口。
- `src/pages/Logs.jsx`：查看和清空日志。
- `src/pages/About.jsx`：应用信息与外链说明。
- `src/i18n.js`：中英文资源；当前中文文本存在编码异常（显示乱码）。

## 5. 主进程结构
- `main.js`
- 负责单实例锁、命令行路径处理、窗口生命周期、IPC 注册、历史/元数据持久化、设置管理、日志接口、窗口控制。
- 关键依赖：`electron-store`、`server-manager`、`tray-manager`、`logger`。

- `preload.js`
- 是主渲染隔离边界，统一封装前端可调用 API（如 `startServer/getServers/getSettings/getLogs/...`）。

- `server-manager.js`
- 内部 `Map<rootPath, {process, info}>` 保存运行中服务。
- 对外提供：`startServer/stopServer/getAllServers/stopAll`。
- 广播机制：给窗口发 `server-update`，同时触发托盘更新事件。

- `tray-manager.js`
- 构建系统托盘菜单，支持查看运行服务、打开浏览器、停止服务、打开主界面、退出。

- `logger.js`
- 日志按天写入用户目录，支持读取最近 N 条和清空日志。

## 6. 构建与发布
- `npm run build-ui`：Vite 构建前端到 `dist-ui/`。
- `npm run start`：启动 Electron 应用。
- `npm run dist`：通过 `electron-builder` 生成安装包。
- `package.json > build.files` 指定打包文件白名单。

## 7. 架构约束与校验
- 详细约束见：`docs/architecture-boundary.md`。
- 发布前建议执行：
  - `npm run verify:entrypoints`
- 该校验会检查：
  - Electron 入口是否为 `main.js`
  - `build.files` 是否包含主进程必要文件
  - 是否错误引入历史路径（`src/main/`、`renderer.js`）

## 8. 当前代码状态说明（重要）
- 主进程唯一入口：根目录 `main.js`（由 `package.json.main` 指定）。
- 主进程唯一代码源：根目录
  - `main.js`
  - `preload.js`
  - `server-manager.js`
  - `server-runner.js`
  - `tray-manager.js`
  - `logger.js`
- 渲染进程唯一代码源：`src/`（React + Vite）。
- 历史重复目录 `src/main/` 与历史 `renderer.js` 已移除，避免维护分叉。
