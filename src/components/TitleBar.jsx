import React from 'react';
import { Minus, Square, X, Zap } from 'lucide-react';

export default function TitleBar() {
  return (
    <div className="h-8 bg-gray-100 dark:bg-gray-800 flex justify-between items-center select-none" style={{ WebkitAppRegion: 'drag' }}>
      <div className="px-4 text-xs text-gray-500 font-medium flex items-center gap-2">
        Live Server Here
      </div>
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button 
          onClick={() => window.api.minimize()}
          className="px-3 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <Minus size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
        <button 
          onClick={() => window.api.maximize()}
          className="px-3 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <Square size={14} className="text-gray-600 dark:text-gray-400" />
        </button>
        <button 
          onClick={() => window.api.close()}
          className="px-3 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors group"
        >
          <X size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
}
