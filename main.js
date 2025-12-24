const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');

// Set App User Model ID for Windows Taskbar Icon
app.setAppUserModelId('com.liveserverhere.app');

const serverManager = require('./server-manager');
const trayManager = require('./tray-manager');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        show: false, // Start hidden, show if requested
        frame: false, // Frameless window
        icon: path.join(__dirname, 'build/icon.png'), // App Icon
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // In production, load the built file. In dev, we might want to load localhost:5173 but for simplicity we build first.
    // To support dev mode better, we could check env.
    // For now, let's assume we always build to dist-ui/index.html
    mainWindow.loadFile(path.join(__dirname, 'dist-ui/index.html'));

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });
    
    // If no args (just opened), show window
    // Check if we have args that look like a path
    // argv[1] is usually the path in dev, or executable in prod... need to be careful.
    // In prod: argv[1] might be the argument.
    // In dev: argv[2] might be the argument.
    
    // We will handle args parsing in a separate function.
    
    trayManager.init(mainWindow);
    
    // Set initial language for tray
    const lng = store.get('language', 'zh');
    trayManager.setLanguage(lng);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        // And if there are args, handle them.
        handleCommandLine(commandLine);
        
        // Optionally show window, or just notify user via tray balloon?
        // If we started a server, maybe we don't need to show window immediately, just notification.
        // But for now let's show window to confirm.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
        }
    });

    app.whenReady().then(() => {
        createWindow();
        handleCommandLine(process.argv);
        
        // Restore history?
        // Maybe implemented later.
    });
}

function handleCommandLine(argv) {
    // Determine if there is a path argument.
    // In dev: electron . path
    // In prod: app.exe path
    
    // Simple heuristic: find first argument that is a valid directory.
    const fs = require('fs');
    
    // Skip the first arg (executable)
    // In dev, we might have more args.
    
    const possiblePaths = argv.slice(1);
    
    for (const p of possiblePaths) {
        if (p === '.' || p.startsWith('--')) continue; // Skip flags or current dir if passed by mistake? actually . is valid.
        
        try {
            if (fs.existsSync(p) && fs.lstatSync(p).isDirectory()) {
                // Found a directory! Start server.
                serverManager.startServer(p).then(info => {
                    // Show notification
                    if (Notification.isSupported()) {
                        new Notification({ title: 'Live Server Started', body: `Serving ${info.root} at port ${info.port}` }).show();
                    }
                }).catch(err => {
                    console.error(err);
                });
                return; // Only start one?
            }
        } catch (e) {
            // Ignore invalid paths
        }
    }
}

const fs = require('fs');

// IPC Handlers
ipcMain.handle('start-server', async (event, rootPath) => {
    const defaultPort = store.get('defaultPort', 8080);
    const info = await serverManager.startServer(rootPath, defaultPort);
    addToHistory(rootPath);
    return info;
});

ipcMain.handle('stop-server', async (event, rootPath) => {
    return serverManager.stopServer(rootPath);
});

ipcMain.handle('get-servers', async () => {
    const servers = serverManager.getAllServers();
    // Enrich with metadata and last modified
    return Promise.all(servers.map(async s => {
        const meta = store.get(`meta.${escapePath(s.root)}`, {});
        const mtime = await getLastModified(s.root);
        return { ...s, ...meta, lastModified: mtime };
    }));
});

ipcMain.handle('get-history', async () => {
    const history = store.get('history', []);
    return Promise.all(history.map(async p => {
        const meta = store.get(`meta.${escapePath(p)}`, {});
        const mtime = await getLastModified(p);
        return { root: p, ...meta, lastModified: mtime };
    }));
});

ipcMain.handle('remove-history-item', async (event, rootPath) => {
    let history = store.get('history', []);
    history = history.filter(h => h !== rootPath);
    store.set('history', history);
    return history;
});

ipcMain.handle('get-favorites', async () => {
    const allMeta = store.get('meta', {});
    const favorites = [];
    for (const [escapedPath, meta] of Object.entries(allMeta)) {
        if (meta.favorite) {
            const p = unescapePath(escapedPath);
            const mtime = await getLastModified(p);
            favorites.push({ root: p, ...meta, lastModified: mtime });
        }
    }
    return favorites;
});

ipcMain.handle('update-meta', (event, rootPath, changes) => {
    const key = `meta.${escapePath(rootPath)}`;
    const current = store.get(key, {});
    store.set(key, { ...current, ...changes });
    return store.get(key);
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('get-language', () => {
    return store.get('language', 'zh');
});

ipcMain.handle('set-language', (event, lng) => {
    store.set('language', lng);
    trayManager.setLanguage(lng); // Update tray immediately
});

ipcMain.handle('get-settings', () => {
    return {
        language: store.get('language', 'zh'),
        theme: store.get('theme', 'light'),
        defaultPort: store.get('defaultPort', 8080)
    };
});

ipcMain.handle('set-setting', (event, key, value) => {
    store.set(key, value);
    if (key === 'language') {
        trayManager.setLanguage(value);
    }
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Window Controls
ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow.hide(); // Don't actually close, just hide to tray
});

function addToHistory(path) {
    let history = store.get('history', []);
    // Remove if exists (to move to top)
    history = history.filter(h => h !== path);
    // Add to top
    history.unshift(path);
    // Limit to 20
    if (history.length > 20) history.pop();
    store.set('history', history);
    
    // Ensure meta exists
    const key = `meta.${escapePath(path)}`;
    if (!store.has(key)) {
        store.set(key, { alias: '', favorite: false, created: Date.now() });
    }
}

function escapePath(p) {
    return p.replace(/\./g, '%2E'); // Electron-store uses dot notation
}

function unescapePath(p) {
    return p.replace(/%2E/g, '.');
}

async function getLastModified(dirPath) {
    try {
        const stats = await fs.promises.stat(dirPath);
        // Simple approach: just dir mtime. 
        // For better accuracy (content change), we could scan children, but let's start with this.
        return stats.mtime.getTime();
    } catch (e) {
        return null;
    }
}


app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    // Do not quit, keep running in tray
});
