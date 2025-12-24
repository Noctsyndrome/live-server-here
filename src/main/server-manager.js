const { fork } = require('child_process');
const path = require('path');
const portfinder = require('portfinder');
const { BrowserWindow } = require('electron');
const EventEmitter = require('events');

class ServerManager extends EventEmitter {
    constructor() {
        super();
        this.servers = new Map(); // root path -> { process, info }
    }

    async startServer(rootPath) {
        // Normalize path
        const root = path.normalize(rootPath);

        if (this.servers.has(root)) {
            // Bring window to front or notify?
            return this.servers.get(root).info;
        }

        try {
            const port = await portfinder.getPortPromise({ port: 8080 });
            
            const runnerPath = path.join(__dirname, 'server-runner.js');
            const params = {
                root: root,
                port: port
            };

            const child = fork(runnerPath, [JSON.stringify(params)]);

            const serverInfo = {
                id: Date.now().toString(),
                root,
                port,
                status: 'starting',
                startTime: Date.now(),
                pid: child.pid
            };

            this.servers.set(root, { process: child, info: serverInfo });
            this.broadcastUpdate();

            child.on('message', (msg) => {
                if (msg.status === 'started') {
                    serverInfo.status = 'running';
                    this.broadcastUpdate();
                } else if (msg.status === 'error') {
                    serverInfo.status = 'error';
                    serverInfo.error = msg.error;
                    this.broadcastUpdate();
                }
            });

            child.on('exit', (code) => {
                if (this.servers.has(root)) {
                    this.servers.delete(root);
                    this.broadcastUpdate();
                }
            });

            return serverInfo;
        } catch (error) {
            console.error('Failed to start server:', error);
            throw error;
        }
    }

    stopServer(rootPath) {
        const root = path.normalize(rootPath);
        const serverData = this.servers.get(root);
        if (serverData) {
            serverData.process.kill();
            this.servers.delete(root);
            this.broadcastUpdate();
        }
    }

    getAllServers() {
        return Array.from(this.servers.values()).map(v => v.info);
    }

    broadcastUpdate() {
        const windows = BrowserWindow.getAllWindows();
        const data = this.getAllServers();
        windows.forEach(win => {
            if (!win.isDestroyed()) {
                win.webContents.send('server-update', data);
            }
        });
    }
    
    stopAll() {
        for (const [root, serverData] of this.servers) {
            serverData.process.kill();
        }
        this.servers.clear();
        this.broadcastUpdate();
    }
}

module.exports = new ServerManager();
