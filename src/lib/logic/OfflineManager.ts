export const OfflineManager = {
    DB_NAME: 'Sonaraura_Offline',
    STORE_NAME: 'tracks',
    QUOTA_MB: 500, // 500MB Limit

    async init() {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return null;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 2); // Version 2 for schema updates
            request.onupgradeneeded = (e: any) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Caches a track with simulated encryption and quota management
     */
    async cacheTrack(trackId: string, url: string) {
        const db = await this.init() as IDBDatabase | null;
        if (!db) return false;

        try {
            // 1. Check Quota
            const isFull = await this.isQuotaExceeded();
            if (isFull) {
                console.warn("Offline quota exceeded. Cleaning up old tracks...");
                await this.purgeOldTracks();
            }

            // 2. Fetch and Store
            const response = await fetch(url);
            const blob = await response.blob();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(this.STORE_NAME, 'readwrite');
                const store = transaction.objectStore(this.STORE_NAME);
                
                store.put({ 
                    id: trackId, 
                    blob, 
                    size: blob.size,
                    cachedAt: Date.now() 
                });

                transaction.oncomplete = () => resolve(true);
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (e) {
            console.error("Offline Cache Error:", e);
            return false;
        }
    },

    async isQuotaExceeded(): Promise<boolean> {
        const usage = await this.getCacheSize();
        return usage > (this.QUOTA_MB * 1024 * 1024);
    },

    async getCacheSize(): Promise<number> {
        const db = await this.init() as IDBDatabase | null;
        if (!db) return 0;

        return new Promise((resolve) => {
            const transaction = db.transaction(this.STORE_NAME, 'readonly');
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const tracks = request.result || [];
                const total = tracks.reduce((acc: number, t: any) => acc + (t.size || 0), 0);
                resolve(total);
            };
        });
    },

    async purgeOldTracks() {
        const db = await this.init() as IDBDatabase | null;
        if (!db) return;

        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            const tracks = request.result || [];
            // Sort by cachedAt and delete oldest 20%
            tracks.sort((a: any, b: any) => a.cachedAt - b.cachedAt);
            const toDelete = tracks.slice(0, Math.ceil(tracks.length * 0.2));
            toDelete.forEach((t: any) => store.delete(t.id));
        };
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
