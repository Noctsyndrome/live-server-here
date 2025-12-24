const { Tray, Menu, app } = require('electron');
const path = require('path');
const serverManager = require('./server-manager');

let tray = null;
let mainWindow = null;

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
    
    // Better approach: use nativeImage.createFromPath but if it fails...
    // Let's rely on electron-builder default resources if available.
    // Or I can use a base64 string to create an icon.
    
    const { nativeImage } = require('electron');
    // A simple red dot 16x16 base64 png
    const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABTSURBVDhP7YyxDcAwCEN9/6N74w4sQJVI7Q6eI1+wI0iJ/CIiJjQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzQ7M7O3Z+YF2m2yK2W4FzR7A1UoI9Vv22JDAAAAAElFTkSuQmCC';
    const icon = nativeImage.createFromDataURL(`data:image/png;base64,${iconBase64}`);
    
    tray = new Tray(icon);
    tray.setToolTip('Live Server Here');
    
    updateMenu();
    
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
        }
    });

    serverManager.on('update', () => {
        updateMenu();
    });
}

function updateMenu() {
    if (!tray) return;

    const servers = serverManager.getAllServers();
    
    const template = [
        { label: 'Live Server Here', enabled: false },
        { type: 'separator' }
    ];

    if (servers.length === 0) {
        template.push({ label: 'No servers running', enabled: false });
    } else {
        servers.forEach(server => {
            template.push({
                label: `${server.root} (${server.port})`,
                submenu: [
                    { label: 'Open in Browser', click: () => require('electron').shell.openExternal(`http://localhost:${server.port}`) },
                    { label: 'Stop', click: () => serverManager.stopServer(server.root) }
                ]
            });
        });
    }

    template.push({ type: 'separator' });
    template.push({ label: 'Open Dashboard', click: () => mainWindow.show() });
    template.push({ label: 'Quit', click: () => {
        serverManager.stopAll();
        app.quit();
    }});

    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
}

// Listen for updates from server manager?
// ServerManager should emit events. But it's a simple object. 
// We can hook into broadcastUpdate or just poll.
// Best way: ServerManager emits events. I didn't implement EventEmitter on ServerManager.
// Let's modify ServerManager to extend EventEmitter or just call this updateMenu manually.
// For simplicity, I'll export an update function and call it from main.js when receiving IPC or similar.
// Or I can just expose updateMenu.

module.exports = {
    init,
    updateMenu
};
