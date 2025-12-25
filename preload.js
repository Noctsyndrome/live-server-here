const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Get file path for dropped files (Electron 21+)
    getPathForFile: (file) => webUtils.getPathForFile(file),
    startServer: (rootPath) => ipcRenderer.invoke('start-server', rootPath),
    stopServer: (rootPath) => ipcRenderer.invoke('stop-server', rootPath),
    getServers: () => ipcRenderer.invoke('get-servers'),
    getHistory: () => ipcRenderer.invoke('get-history'),
    removeHistoryItem: (root) => ipcRenderer.invoke('remove-history-item', root),
    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    updateMeta: (root, changes) => ipcRenderer.invoke('update-meta', root, changes),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getLanguage: () => ipcRenderer.invoke('get-language'),
    setLanguage: (lng) => ipcRenderer.invoke('set-language', lng),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    getLogs: () => ipcRenderer.invoke('get-logs'),
    clearLogs: () => ipcRenderer.invoke('clear-logs'),
    onServerUpdate: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('server-update', listener);
        return () => ipcRenderer.removeListener('server-update', listener);
    },
    openExternal: (url) => ipcRenderer.invoke('open-external', url),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
