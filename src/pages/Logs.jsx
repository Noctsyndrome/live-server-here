import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';

export default function Logs() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        setLoading(true);
        const logData = await window.api.getLogs();
        setLogs(logData || []);
        setLoading(false);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleClearLogs = async () => {
        if (confirm(t('confirmClearLogs') || 'Are you sure you want to clear all logs?')) {
            await window.api.clearLogs();
            await loadLogs();
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('viewLogs')}</h2>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={loadLogs}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {t('refresh') || 'Refresh'}
                    </button>
                    <button
                        onClick={handleClearLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                        {t('clearLogs')}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <RefreshCw size={24} className="animate-spin mr-3" />
                        Loading...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">{t('noLogs')}</div>
                ) : (
                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                                <tr>
                                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{t('logTime')}</th>
                                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{t('logLevel')}</th>
                                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{t('logMessage')}</th>
                                    <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-medium">{t('logDetails')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${log.level === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                log.level === 'warn' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                                }`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                            {log.message}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs" title={log.root || log.port ? `${log.root || ''} ${log.port ? ':' + log.port : ''}` : ''}>
                                            {log.root && <span className="font-mono">{log.root}</span>}
                                            {log.port && <span className="ml-2 text-blue-500">:{log.port}</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
