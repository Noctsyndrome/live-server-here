import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';
import ServerCard from '../components/ServerCard';
import CompactServerItem from '../components/CompactServerItem';

export default function Dashboard() {
  const { t } = useTranslation();
  const [activeServers, setActiveServers] = useState([]);
  const [history, setHistory] = useState([]);

  const loadData = useCallback(async () => {
    const servers = await window.api.getServers();
    const hist = await window.api.getHistory();
    setActiveServers(servers || []);
    setHistory(hist || []);
  }, []);

  useEffect(() => {
    loadData();
    const removeListener = window.api.onServerUpdate(() => loadData());
    return () => removeListener && removeListener();
  }, [loadData]);

  const handleStart = async (path) => {
    try {
      await window.api.startServer(path);
      loadData();
    } catch (err) {
      alert('Failed to start server: ' + err.message);
    }
  };

  const handleStop = async (root) => {
    await window.api.stopServer(root);
    loadData();
  };

  const handleOpen = (port) => {
    window.api.openExternal(`http://localhost:${port}`);
  };

  const handleToggleFavorite = async (root, favorite) => {
    await window.api.updateMeta(root, { favorite });
    loadData();
  };

  const handleUpdateAlias = async (root, alias) => {
    await window.api.updateMeta(root, { alias });
    loadData();
  };

  const handleAdd = async () => {
    const path = await window.api.selectDirectory();
    if (path) {
      try {
        await window.api.startServer(path);
      } catch (err) {
        alert('Failed to start server: ' + err.message);
      }
    }
  };

  // Simplified recent folders: just show top 6, compact style
  // Do not exclude active servers, history is history. But user requested "no need to move to active".
  // Actually, usually "Recent" implies things not currently running if we have an "Active" section.
  // But let's just show top N unique paths that are NOT in activeServers to avoid redundancy if preferred,
  // or just show all. User said: "no need to move card to active", implies independent logic.
  // But typically you don't start an already running server.
  // Let's filter out running ones to keep it clean, or keep them but disable start?
  // User said "two panels present independent logic". 
  // Let's keep them separate. If a server is running, it's still in history.
  // But showing it in both might be confusing if one is "Start" and other is "Stop".
  // I will filter out active ones from the "Recent" list to avoid clutter, as that's standard UX.
  // const recentList = history
  //   .filter(h => !activeServers.some(s => s.root === h.root))
  //   .slice(0, 8); // Limit to 8 for compact view

  return (
    <div className="relative min-h-full">
      {/* Tech Grid Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10 pointer-events-none -z-10"></div>
      <div className="absolute top-0 left-0 right-0 h-48 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] mask-image-gradient-to-b pointer-events-none -z-10"></div>

      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('dashboard')}</h2>
          <button 
            onClick={handleAdd}
            className="group flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <FolderPlus size={18} className="text-gray-300 group-hover:text-white transition-colors" />
            <span className="font-medium">{t('addFolder')}</span>
          </button>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
            {t('activeServers')}
          </h3>
          {activeServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 text-gray-400 backdrop-blur-sm">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <FolderPlus size={24} className="opacity-50" />
              </div>
              <p>{t('noActiveServers')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeServers.map((server) => (
                <ServerCard 
                  key={server.root} 
                  server={{...server, status: 'running'}}
                  onStop={handleStop}
                  onOpen={handleOpen}
                  onToggleFavorite={handleToggleFavorite}
                  onUpdateAlias={handleUpdateAlias}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


