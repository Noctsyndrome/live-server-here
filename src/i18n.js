import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "history": "History",
      "settings": "Settings",
      "about": "About",
      "activeServers": "Active Servers",
      "noActiveServers": "No active servers running.",
      "startServer": "Start Server",
      "stop": "Stop",
      "open": "Open",
      "port": "Port",
      "status": "Status",
      "recentFolders": "Recent Folders",
      "noHistory": "No history yet.",
      "language": "Language",
      "selectLanguage": "Select Language",
      "version": "Version",
      "author": "Author",
      "addFolder": "Add Folder",
      "favorites": "Favorites",
      "noFavorites": "No favorite folders yet.",
      "alias": "Alias",
      "setAlias": "Set Alias",
      "lastUpdated": "Last updated",
      "cancel": "Cancel",
      "save": "Save",
      "status_running": "Running",
      "status_stopped": "Stopped",
      "status_starting": "Starting",
      "delete": "Delete",
      "removeFromFavorites": "Remove from Favorites",
      "addToFavorites": "Add to Favorites",
      "acknowledgements": "Acknowledgements",
      "inspiration": "Inspired by VSCode Live Server extension",
      "theme": "Theme",
      "light": "Light",
      "dark": "Dark",
      "defaultPort": "Default Port",
      "system": "System"
    }
  },
  zh: {
    translation: {
      "dashboard": "仪表盘",
      "history": "历史记录",
      "settings": "设置",
      "about": "关于",
      "activeServers": "运行中的服务",
      "noActiveServers": "暂无运行中的服务。",
      "startServer": "启动服务",
      "stop": "停止",
      "open": "打开",
      "port": "端口",
      "status": "状态",
      "recentFolders": "最近使用的文件夹",
      "noHistory": "暂无历史记录。",
      "language": "语言",
      "selectLanguage": "选择语言",
      "version": "版本",
      "author": "作者",
      "addFolder": "添加文件夹",
      "favorites": "收藏夹",
      "noFavorites": "暂无收藏的文件夹。",
      "alias": "别名",
      "setAlias": "设置别名",
      "lastUpdated": "最后更新",
      "cancel": "取消",
      "save": "保存",
      "status_running": "运行中",
      "status_stopped": "已停止",
      "status_starting": "启动中",
      "delete": "删除",
      "removeFromFavorites": "取消收藏",
      "addToFavorites": "加入收藏",
      "acknowledgements": "鸣谢",
      "inspiration": "项目灵感来源于 vscode live server 插件",
      "theme": "主题",
      "light": "浅色",
      "dark": "深色",
      "defaultPort": "默认端口",
      "system": "系统"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // Default to Chinese
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
