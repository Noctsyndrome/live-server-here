import React from 'react';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('about')}</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Live Server Here</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          A simple and convenient tool to launch local HTTP servers directly from your file explorer.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-24 font-medium text-gray-500">{t('version')}:</span>
            <span>0.1.0</span>
          </div>
          <div className="flex">
            <span className="w-24 font-medium text-gray-500">{t('author')}:</span>
            <span>Dennki</span>
          </div>
        </div>

        <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold mb-2">{t('acknowledgements')}</h4>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            {t('inspiration')}
          </p>
          <a 
            href="https://github.com/ritwickdey/vscode-live-server" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm hover:underline break-all"
            onClick={(e) => {
              e.preventDefault();
              if (window.api && window.api.openExternal) {
                 window.api.openExternal('https://github.com/ritwickdey/vscode-live-server');
              } else {
                 window.open('https://github.com/ritwickdey/vscode-live-server', '_blank');
              }
            }}
          >
            https://github.com/ritwickdey/vscode-live-server
          </a>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 italic">
            Vibe coding with TRAE and Gemini-3-Pro
          </p>
        </div>
      </div>
    </div>
  );
}
