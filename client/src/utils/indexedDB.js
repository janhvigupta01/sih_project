// IndexedDB Offline Queue Manager for Scrap Sathi
const DB_NAME = 'ScrapSathiOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineQueue';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveOfflineItem = async (type, data) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = {
        type, // 'batch_creation' | 'handover_proof' | 'scan_log'
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save to IndexedDB:', err);
    // Fallback to localStorage if IndexedDB has issues
    const current = JSON.parse(localStorage.getItem('scrapsathi_offline_queue') || '[]');
    current.push({ type, data, timestamp: new Date().toISOString() });
    localStorage.setItem('scrapsathi_offline_queue', JSON.stringify(current));
  }
};

export const getOfflineQueue = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    const fromLocal = JSON.parse(localStorage.getItem('scrapsathi_offline_queue') || '[]');
    return fromLocal;
  }
};

export const clearOfflineQueue = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        localStorage.removeItem('scrapsathi_offline_queue');
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    localStorage.removeItem('scrapsathi_offline_queue');
  }
};
