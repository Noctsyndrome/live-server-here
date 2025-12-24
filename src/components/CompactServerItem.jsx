import React from 'react';
import { Play, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CompactServerItem({ 
  server, 
  onStart,
  onToggleFavorite,
  onDelete,
  isFavorite
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <button 
          onClick={() => onStart(server.root)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 transition-colors"
          title={t('startServer')}
        >
          <Play size={14} fill="currentColor" />
        </button>
        
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate text-gray-700 dark:text-gray-200" title={server.root}>
                    {server.alias || server.root.split(/[/\\]/).pop()}
                </span>
            </div>
            <div className="text-xs text-gray-400 truncate" title={server.root}>
                {server.root}
            </div>
        </div>
      </div>
      
      <div className="flex items-center">
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(server.root, !isFavorite)}
            className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-yellow-400 transition-colors"
            title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          >
            <Star size={16} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-yellow-400" : ""} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(server.root)}
            className="ml-2 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
            title={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

