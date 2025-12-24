const serverListElement = document.getElementById('server-list');
const historyListElement = document.getElementById('history-list');
const addBtn = document.getElementById('add-btn');

addBtn.addEventListener('click', async () => {
    const path = await window.api.selectDirectory();
    if (path) {
        try {
            await window.api.startServer(path);
            refreshHistory();
        } catch (err) {
            alert('Failed to start server: ' + err.message);
        }
    }
});

function renderServers(servers) {
    serverListElement.innerHTML = '';
    
    if (servers.length === 0) {
        serverListElement.innerHTML = '<div class="empty-state">No active servers. Click "+ Add Folder" to start one.</div>';
        return;
    }

    servers.forEach(server => {
        const item = document.createElement('div');
        item.className = 'server-item';
        
        const statusClass = `status-${server.status}`;
        
        item.innerHTML = `
            <div class="server-info">
                <span class="server-path" title="${server.root}">${server.root}</span>
                <span class="server-details">
                    Port: ${server.port} | Status: <span class="${statusClass}">${server.status}</span>
                </span>
            </div>
            <div class="server-actions">
                <button onclick="openInBrowser('http://localhost:${server.port}')">Open</button>
                <button class="stop" onclick="stopServer('${server.root.replace(/\\/g, '\\\\')}')">Stop</button>
            </div>
        `;
        serverListElement.appendChild(item);
    });
}

async function refreshHistory() {
    const history = await window.api.getHistory();
    historyListElement.innerHTML = '';
    
    if (history.length === 0) {
        historyListElement.innerHTML = '<div class="empty-state">No history yet.</div>';
        return;
    }
    
    history.forEach(path => {
        const item = document.createElement('div');
        item.className = 'server-item';
        
        item.innerHTML = `
            <div class="server-info">
                <span class="server-path" title="${path}">${path}</span>
            </div>
            <div class="server-actions">
                <button onclick="startServer('${path.replace(/\\/g, '\\\\')}')">Start</button>
            </div>
        `;
        historyListElement.appendChild(item);
    });
}

window.startServer = async (path) => {
    try {
        await window.api.startServer(path);
        refreshHistory();
    } catch (err) {
        alert('Failed to start server: ' + err.message);
    }
};

window.openInBrowser = (url) => {
    window.api.openExternal(url);
};

window.stopServer = async (root) => {
    await window.api.stopServer(root);
};

window.api.onServerUpdate((data) => {
    renderServers(data);
});

// Initial load
window.api.getServers().then(renderServers);
refreshHistory();
