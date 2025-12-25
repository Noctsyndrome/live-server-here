import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { History as HistoryIcon } from 'lucide-react';
import CompactServerItem from '../components/CompactServerItem';

export default function History() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);

  const loadData = useCallback(async () => {
    const hist = await window.api.getHistory();
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
      // History list should not change immediately if we are strictly history view, 
      // but usually history order updates on usage. 
      // However, the requirement is "unify styling with compact view (read-only)".
      loadData();
    } catch (err) {
      alert('Failed to start server: ' + err.message);
    }
  };

  const handleDelete = async (path) => {
    // Direct delete without confirmation
    await window.api.removeHistoryItem(path);
    loadData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">{t('history')}</h2>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700/50 text-gray-400 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <HistoryIcon size={28} className="opacity-50" />
          </div>
          <p className="text-base font-medium mb-1">{t('noHistory')}</p>
          <p className="text-sm text-gray-400">{t('emptyHistoryHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {history.map((item) => (
            <CompactServerItem
              key={item.root}
              server={item}
              onStart={handleStart}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

