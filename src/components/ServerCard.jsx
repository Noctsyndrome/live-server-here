import React, { useState } from 'react';
import { Play, Square, ExternalLink, Star, Edit2, Check, X, Clock, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export default function ServerCard({ 
  server, 
  onStart, 
  onStop, 
  onOpen, 
  onToggleFavorite, 
  onUpdateAlias 
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [alias, setAlias] = useState(server.alias || '');

  const handleSaveAlias = () => {
    onUpdateAlias(server.root, alias);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setAlias(server.alias || '');
    setIsEditing(false);
  };

  const formatTime = (ms) => {
    if (!ms) return '';
    return new Date(ms).toLocaleString();
  };

  const statusColor = {
    running: 'text-green-500',
    stopped: 'text-gray-400',
    starting: 'text-yellow-500'
  }[server.status] || 'text-gray-400';

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 mb-1 h-7">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder={t('alias')}
                  className="px-2 py-1 text-sm border-b border-blue-500 outline-none bg-transparent dark:text-gray-100 min-w-[120px]"
                  autoFocus
                />
                <button onClick={handleSaveAlias} className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors" title={t('save')}>
                  <Check size={14} />
                </button>
                <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title={t('cancel')}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-semibold text-lg truncate text-gray-800 dark:text-gray-100" title={server.root}>
                  {server.alias || server.root.split(/[/\\]/).pop()}
                </h3>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mb-3" title={server.root}>
            {server.root}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            {server.status === 'running' && (
              <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                <Globe size={12} className="text-blue-500" />
                {server.port}
              </span>
            )}
            <span className={clsx("flex items-center gap-1 font-medium", statusColor)}>
              <span className={clsx("w-1.5 h-1.5 rounded-full", server.status === 'running' ? "bg-green-500" : "bg-gray-400")}></span>
              {t(`status_${server.status || 'stopped'}`)}
            </span>
            {server.lastModified && (
              <span className="flex items-center gap-1 text-gray-400" title={t('lastUpdated')}>
                <Clock size={12} />
                {formatTime(server.lastModified)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onToggleFavorite(server.root, !server.favorite)}
            className={clsx(
              "p-2 rounded-md transition-colors",
              server.favorite ? "text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" : "text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            <Star size={18} fill={server.favorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end border-t border-gray-100 dark:border-gray-700/50 pt-3">
        {server.status === 'running' ? (
          <>
            <button 
              onClick={() => onOpen(server.port)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-md text-sm transition-colors"
            >
              <ExternalLink size={15} />
              {t('open')}
            </button>
            <button 
              onClick={() => onStop(server.root)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md text-sm transition-colors"
            >
              <Square size={15} />
              {t('stop')}
            </button>
          </>
        ) : (
          <button 
            onClick={() => onStart(server.root)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 rounded-md text-sm transition-colors"
          >
            <Play size={15} />
            {t('startServer')}
          </button>
        )}
      </div>
    </div>
  );
}

