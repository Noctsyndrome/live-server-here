import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus } from 'lucide-react';
import ServerCard from '../components/ServerCard';
import { useToast } from '../components/Toast';
import clsx from 'clsx';

export default function Dashboard() {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [activeServers, setActiveServers] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const loadData = useCallback(async () => {
    const servers = await window.api.getServers();
    setActiveServers(servers || []);
  }, []);

  useEffect(() => {
    loadData();
    const removeListener = window.api.onServerUpdate(() => loadData());
    return () => removeListener && removeListener();
  }, [loadData]);

  const handleStart = async (path) => {
    try {
      const result = await window.api.startServer(path);

      if (result.success) {
        // Check if port changed
        if (result.portChanged) {
          addToast(
            t('portChanged', { requested: result.requestedPort, actual: result.port }),
            'warning'
          );
        } else {
          addToast(t('serverStarted'), 'success');
        }
        loadData();
      } else {
        // Show error toast
        const errorMsg = t(result.error.message);
        addToast(errorMsg, 'error');
      }
    } catch (err) {
      addToast(t('errorUnknown'), 'error');
    }
  };

  const handleStop = async (root) => {
    await window.api.stopServer(root);
    addToast(t('serverStopped'), 'info');
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
      await handleStart(path);
    }
  };

  // Drag and drop handlers - use counter to prevent flickering
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    // In Electron, dataTransfer.files contains file objects with path property
    const files = e.dataTransfer.files;

    console.log('Drop event - files count:', files.length);

    if (files.length === 0) {
      console.log('No files in drop');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Use Electron's webUtils.getPathForFile() via preload
      try {
        const filePath = window.api.getPathForFile(file);
        console.log('File:', file.name, 'Path:', filePath);

        if (filePath) {
          await handleStart(filePath);
          break; // Only start first valid folder
        } else {
          console.log('Could not get path for file');
          addToast(t('errorInvalidPath'), 'error');
        }
      } catch (err) {
        console.error('Failed to start server:', err);
        addToast(t('errorInvalidPath'), 'error');
      }
    }
  };

  return (
    <div
      className="relative min-h-full"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
            <div
              className={clsx(
                "flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed text-gray-400 backdrop-blur-sm transition-all",
                isDragging
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700/50"
              )}
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FolderPlus size={28} className="opacity-50" />
              </div>
              <p className="text-base font-medium mb-1">{t('noActiveServers')}</p>
              <p className="text-sm text-gray-400">{t('dropHereToStart')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeServers.map((server) => (
                <div key={server.root} className="animate-slideInUp">
                  <ServerCard
                    server={{ ...server, status: 'running' }}
                    onStop={handleStop}
                    onOpen={handleOpen}
                    onToggleFavorite={handleToggleFavorite}
                    onUpdateAlias={handleUpdateAlias}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag overlay - only when dragging AND servers exist */}
      {isDragging && activeServers.length > 0 && (
        <div className="fixed inset-0 bg-blue-500/10 pointer-events-none flex items-center justify-center z-40">
          <div className="bg-white dark:bg-gray-800 px-8 py-6 rounded-2xl shadow-2xl border-2 border-dashed border-blue-500 dark:border-blue-400">
            <FolderPlus size={48} className="text-blue-500 dark:text-blue-400 mx-auto mb-3" />
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('dropHereToStart')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
