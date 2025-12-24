const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
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
    onServerUpdate: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('server-update', listener);
        return () => ipcRenderer.removeListener('server-update', listener);
    },
    openExternal: (url) => shell.openExternal(url),
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close')
});
