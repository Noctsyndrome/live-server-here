import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';
import Logs from './pages/Logs';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from './components/Toast';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Load initial settings (language and theme)
    window.api.getSettings().then(settings => {
      if (settings.language) {
        i18n.changeLanguage(settings.language);
      }
      if (settings.theme) {
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }, [i18n]);

  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="history" element={<History />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<Logs />} />
            <Route path="about" element={<About />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}

export default App;
