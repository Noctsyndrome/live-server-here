import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Settings, Info, Star, History, Radio } from 'lucide-react';
import clsx from 'clsx';
import TitleBar from './TitleBar';

export default function Layout() {
  const { t } = useTranslation();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      const servers = await window.api.getServers();
      setActiveCount(servers ? servers.length : 0);
    };

    updateCount();
    const removeListener = window.api.onServerUpdate(updateCount);
    return () => removeListener && removeListener();
  }, []);

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: t('dashboard'), badge: activeCount > 0 ? activeCount : null },
    { to: "/history", icon: History, label: t('history') },
    { to: "/favorites", icon: Star, label: t('favorites') },
    { to: "/settings", icon: Settings, label: t('settings') },
    { to: "/about", icon: Info, label: t('about') },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden border border-gray-200 dark:border-gray-800">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Radio size={18} />
              </span>
              Live Server Here
            </h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative",
                  isActive 
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-400">
            v1.0.0
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

