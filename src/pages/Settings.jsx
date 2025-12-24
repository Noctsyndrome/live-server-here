import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [defaultPort, setDefaultPort] = useState(8080);

  useEffect(() => {
    window.api.getSettings().then(settings => {
      setTheme(settings.theme || 'light');
      setDefaultPort(settings.defaultPort || 8080);
    });
  }, []);
  
  const changeLanguage = (e) => {
    const lng = e.target.value;
    i18n.changeLanguage(lng);
    window.api.setLanguage(lng);
  };

  const changeTheme = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    window.api.setSetting('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeDefaultPort = (e) => {
    const port = parseInt(e.target.value, 10);
    setDefaultPort(port);
    window.api.setSetting('defaultPort', port);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('settings')}</h2>
      
      <div className="space-y-4">
        {/* Language */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('language')}
          </label>
          <select
            value={i18n.language}
            onChange={changeLanguage}
            className="w-48 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Theme */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('theme')}
          </label>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => {
                const e = { target: { value: 'light' } };
                changeTheme(e);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                theme === 'light'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t('light')}
            </button>
            <button
              onClick={() => {
                const e = { target: { value: 'dark' } };
                changeTheme(e);
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {t('dark')}
            </button>
          </div>
        </div>

        {/* Default Port */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('defaultPort')}
          </label>
          <input
            type="number"
            value={defaultPort}
            onChange={changeDefaultPort}
            className="w-48 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}
