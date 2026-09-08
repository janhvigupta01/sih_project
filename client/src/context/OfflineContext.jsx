import React, { createContext, useContext, useState, useEffect } from 'react';
import { getOfflineQueue, clearOfflineQueue, saveOfflineItem } from '../utils/indexedDB';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  const refreshQueueCount = async () => {
    try {
      const items = await getOfflineQueue();
      setQueueCount(items ? items.length : 0);
    } catch (e) {
      setQueueCount(0);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncMessage('Back Online! Automatically syncing queued deals...');
      syncQueuedData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncMessage('Network disconnected. Offline mode active: deals will save locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    refreshQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueOfflineAction = async (type, data) => {
    await saveOfflineItem(type, data);
    await refreshQueueCount();
  };

  const syncQueuedData = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const items = await getOfflineQueue();
      if (items && items.length > 0) {
        // Send batch sync request
        for (const item of items) {
          if (item.type === 'batch_creation') {
            await fetch('/api/batches', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            }).catch(() => {});
          }
        }
        await clearOfflineQueue();
        await refreshQueueCount();
        setSyncMessage(`Successfully synced ${items.length} offline actions to cloud!`);
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        queueCount,
        isSyncing,
        syncMessage,
        queueOfflineAction,
        syncQueuedData,
        refreshQueueCount
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
