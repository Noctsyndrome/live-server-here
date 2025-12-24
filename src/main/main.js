const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const serverManager = require('./server-manager');
const trayManager = require('./tray-manager');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Start hidden, show if requested
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');

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

// IPC Handlers
ipcMain.handle('start-server', async (event, rootPath) => {
    const info = await serverManager.startServer(rootPath);
    addToHistory(rootPath);
    return info;
});

ipcMain.handle('stop-server', async (event, rootPath) => {
    return serverManager.stopServer(rootPath);
});

ipcMain.handle('get-servers', () => {
    return serverManager.getAllServers();
});

ipcMain.handle('get-history', () => {
    return store.get('history', []);
});

ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.canceled) return null;
    return result.filePaths[0];
});

function addToHistory(path) {
    let history = store.get('history', []);
    // Remove if exists (to move to top)
    history = history.filter(h => h !== path);
    // Add to top
    history.unshift(path);
    // Limit to 10
    if (history.length > 10) history.pop();
    store.set('history', history);
}


app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    // Do not quit, keep running in tray
});
