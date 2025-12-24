const { Tray, Menu, app } = require('electron');
const path = require('path');
const serverManager = require('./server-manager');

let tray = null;
let mainWindow = null;
let currentLanguage = 'zh';

const translations = {
    en: {
        title: 'Live Server Here',
        noServers: 'No servers running',
        openDashboard: 'Open Dashboard',
        quit: 'Quit',
        openInBrowser: 'Open in Browser',
        stop: 'Stop'
    },
    zh: {
        title: 'Live Server Here',
        noServers: '暂无运行中的服务',
        openDashboard: '打开仪表盘',
        quit: '退出',
        openInBrowser: '在浏览器中打开',
        stop: '停止'
    }
};

function init(window) {
    mainWindow = window;
    // Create a simple icon (placeholder or use a default one)
    // For now, we assume there is an icon.ico or we use a system icon?
    // Electron requires a path. Let's use a dummy one or try to find one.
    // If no icon is provided, it might fail or show empty.
    // I'll create a simple empty file as placeholder if needed or skip icon if possible (but Tray needs one).
    // I'll assume we can use a standard file. I'll create a simple png/ico later or use a text file for now (won't work).
    // I'll use a generic path and user can add icon later. Or use electron's default app icon.
    
    // For this environment, I'll skip actual image creation and assume 'icon.png' exists.
    // I will CREATE a simple icon using a tool or just assume it.
    // Wait, I can't create an image file easily. 
    // I'll use `nativeImage` to create from buffer or data URL if possible, or just point to a non-existent one and see if it falls back.
    // Actually, on Windows, Tray needs an icon.
    // Let's create a minimal 1x1 png if possible or use a built-in one.
    
    // Use the file icon if available
    const iconPath = path.join(__dirname, 'build/icon.png');
    let icon;
    
    try {
        const { nativeImage } = require('electron');
        icon = nativeImage.createFromPath(iconPath);
        // Resize if needed, though 64x64 is okay, Tray usually wants 16x16 or 32x32
        icon = icon.resize({ width: 16, height: 16 });
    } catch (e) {
        // Fallback to base64 if file load fails
        const { nativeImage } = require('electron');
        const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABTSURBVDhP7YyxDcAwCEN9/6N74w4sQJVI7Q6eI1+wI0iJ/CIiJjQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzR7A1UoI9Vv22JDAAAAAElFTkSuQmCC';
        icon = nativeImage.createFromDataURL(`data:image/png;base64,${iconBase64}`);
    }
    
    tray = new Tray(icon);
    tray.setToolTip('Live Server Here');
    
    updateMenu();
    
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    serverManager.on('update', () => {
        console.log('Tray Manager received update event');
        updateMenu();
    });
}

function setLanguage(lng) {
    currentLanguage = lng;
    updateMenu();
}

function updateMenu() {
    if (!tray) return;

    const servers = serverManager.getAllServers();
    console.log('Updating Tray Menu with servers:', servers.length);
    
    const t = translations[currentLanguage] || translations.en;

    const template = [
        { label: t.title, enabled: false },
        { type: 'separator' }
    ];

    if (servers.length === 0) {
        template.push({ label: t.noServers, enabled: false });
    } else {
        servers.forEach(server => {
            template.push({
                label: `${server.root} (${server.port})`,
                submenu: [
                    { label: t.openInBrowser, click: () => require('electron').shell.openExternal(`http://localhost:${server.port}`) },
                    { label: t.stop, click: () => serverManager.stopServer(server.root) }
                ]
            });
        });
    }

    template.push({ type: 'separator' });
    template.push({ label: t.openDashboard, click: () => mainWindow.show() });
    template.push({ label: t.quit, click: () => {
        serverManager.stopAll();
        app.quit();
    }});

    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
}

module.exports = {
    init,
    updateMenu,
    setLanguage
};

