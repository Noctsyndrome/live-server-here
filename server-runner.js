const liveServer = require('live-server');

const args = process.argv.slice(2);
const params = JSON.parse(args[0]);

const serverParams = {
    port: params.port,
    host: "0.0.0.0",
    root: params.root,
    open: true,
    file: "index.html",
    wait: 1000,
    logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
};

try {
    liveServer.start(serverParams);
    if (process.send) {
        process.send({ status: 'started', port: params.port, root: params.root });
    }
} catch (err) {
    if (process.send) {
        process.send({ status: 'error', error: err.message });
    }
    process.exit(1);
}
