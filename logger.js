const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class Logger {
    constructor() {
        this.logsDir = path.join(app.getPath('userData'), 'logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
        this.cleanOldLogs();
    }

    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logsDir);
            const now = Date.now();
            const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

            files.forEach(file => {
                const filePath = path.join(this.logsDir, file);
                const stats = fs.statSync(filePath);
                if (stats.mtime.getTime() < sevenDaysAgo) {
                    fs.unlinkSync(filePath);
                }
            });
        } catch (err) {
            console.error('Failed to clean old logs:', err);
        }
    }

    getLogFilePath() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logsDir, `${date}.log`);
    }

    write(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            fs.appendFileSync(this.getLogFilePath(), logLine);
        } catch (err) {
            console.error('Failed to write log:', err);
        }

        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[${level.toUpperCase()}]`, message, meta);
        }
    }

    info(message, meta) {
        this.write('info', message, meta);
    }

    warn(message, meta) {
        this.write('warn', message, meta);
    }

    error(message, meta) {
        this.write('error', message, meta);
    }

    getLogs(limit = 50) {
        try {
            const logFile = this.getLogFilePath();
            if (!fs.existsSync(logFile)) return [];

            const content = fs.readFileSync(logFile, 'utf-8');
            const lines = content.trim().split('\n').filter(Boolean);

            return lines
                .slice(-limit)
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean)
                .reverse();
        } catch (err) {
            console.error('Failed to read logs:', err);
            return [];
        }
    }

    clearLogs() {
        try {
            const files = fs.readdirSync(this.logsDir);
            files.forEach(file => {
                fs.unlinkSync(path.join(this.logsDir, file));
            });
            return true;
        } catch (err) {
            console.error('Failed to clear logs:', err);
            return false;
        }
    }
}

module.exports = new Logger();
