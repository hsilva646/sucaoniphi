import storage from '@/utils/storage';

const DATABASE_NAME = 'dindin_gourmet_db';
const DATABASE_VERSION = 1;

type StoreName = 'recipes' | 'sales';
const STORE_NAMES: StoreName[] = ['recipes', 'sales'];

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      STORE_NAMES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('IndexedDB open request blocked. Close other tabs using this site.');
    };
  });
};

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getStore = async (storeName: StoreName, mode: IDBTransactionMode) => {
  const db = await openDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
};

export const getAll = async <T>(storeName: StoreName): Promise<T[]> => {
  const store = await getStore(storeName, 'readonly');
  const request = store.getAll();
  return requestToPromise(request) as Promise<T[]>;
};

export const putAll = async <T extends { id: string }>(
  storeName: StoreName,
  items: T[]
): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(storeName, 'readwrite');
  const store = transaction.objectStore(storeName);

  items.forEach((item) => store.put(item));

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
};

export const putItem = async <T extends { id: string }>(
  storeName: StoreName,
  item: T
): Promise<void> => {
  const store = await getStore(storeName, 'readwrite');
  const request = store.put(item);
  return requestToPromise(request).then(() => undefined);
};

export const deleteItem = async (storeName: StoreName, id: string): Promise<void> => {
  const store = await getStore(storeName, 'readwrite');
  const request = store.delete(id);
  return requestToPromise(request).then(() => undefined);
};

export const clearStore = async (storeName: StoreName): Promise<void> => {
  const store = await getStore(storeName, 'readwrite');
  const request = store.clear();
  return requestToPromise(request).then(() => undefined);
};

export const initializeDatabase = async (): Promise<void> => {
  const db = await openDB();

  const migrateIfEmpty = async (storeName: StoreName) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const countRequest = store.count();
    const currentCount = (await requestToPromise(countRequest)) as number;

    if (currentCount === 0) {
      const items = storage.get(storeName, []) || [];
      if (Array.isArray(items) && items.length > 0) {
        await putAll(storeName, items.map((item: any) => ({ ...item })));
      }
    }
  };

  for (const storeName of STORE_NAMES) {
    await migrateIfEmpty(storeName);
  }
};
