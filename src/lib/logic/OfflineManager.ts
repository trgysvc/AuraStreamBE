export const OfflineManager = {
    DB_NAME: 'AuraStream_Offline',
    STORE_NAME: 'tracks',
    QUOTA_MB: 500,

    async init() {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return null;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async cacheTrack(trackId: string, url: string) {
        const db = await this.init() as IDBDatabase | null;
        if (!db) return false;

        try {
            const response = await fetch(url);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.STORE_NAME, 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                
                store.put({ id: trackId, blob, cachedAt: Date.now() });
                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (e) {
            console.error("Offline Cache Error:", e);
            return false;
        }
    },

    async getCachedTrack(trackId: string): Promise<string | null> {
        const db = await this.init() as IDBDatabase | null;
        if (!db) return null;

        return new Promise((resolve) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(trackId);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(URL.createObjectURL(request.result.blob));
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => resolve(null);
        });
    }
};
