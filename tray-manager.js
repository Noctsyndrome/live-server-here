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

function createIconWithBadge(count) {
    const { nativeImage } = require('electron');
    const iconPath = path.join(__dirname, 'build/icon.png');

    try {
        let icon = nativeImage.createFromPath(iconPath);
        // Note: Creating an icon with overlay badge requires the 'canvas' package
        // which is a native module. For simplicity, we'll just return the basic icon
        // and use the tooltip to show the count instead.
        return icon.resize({ width: 16, height: 16 });
    } catch (err) {
        console.error('Failed to create icon:', err);
        // Fallback to base64 icon
        const { nativeImage } = require('electron');
        const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABTSURBVDhP7YyxDcAwCEN9/6N74w4sQJVI7Q6eI1+wI0iJ/CIiJjQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzR7A1UoI9Vv22JDAAAAAElFTkSuQmCC';
        return nativeImage.createFromDataURL(`data:image/png;base64,${iconBase64}`);
    }
}

function init(window) {
    mainWindow = window;

    const iconPath = path.join(__dirname, 'build/icon.png');
    let icon;

    try {
        const { nativeImage } = require('electron');
        icon = nativeImage.createFromPath(iconPath);
        icon = icon.resize({ width: 16, height: 16 });
    } catch (e) {
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

    // Update icon (simplified - no badge overlay to avoid canvas dependency)
    const iconWithBadge = createIconWithBadge(servers.length);
    tray.setImage(iconWithBadge);

    // Update tooltip to show count
    const baseTooltip = 'Live Server Here';
    const tooltip = servers.length > 0
        ? `${baseTooltip} (${servers.length} ${servers.length === 1 ? 'server' : 'servers'} running)`
        : baseTooltip;
    tray.setToolTip(tooltip);

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
    template.push({
        label: t.quit, click: () => {
            serverManager.stopAll();
            app.quit();
        }
    });

    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
}

module.exports = {
    init,
    updateMenu,
    setLanguage
};

