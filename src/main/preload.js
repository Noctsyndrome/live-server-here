const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('api', {
    startServer: (rootPath) => ipcRenderer.invoke('start-server', rootPath),
    stopServer: (rootPath) => ipcRenderer.invoke('stop-server', rootPath),
    getServers: () => ipcRenderer.invoke('get-servers'),
    getHistory: () => ipcRenderer.invoke('get-history'),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    onServerUpdate: (callback) => ipcRenderer.on('server-update', (event, data) => callback(data)),
    openExternal: (url) => shell.openExternal(url)
});
