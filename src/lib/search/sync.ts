import { searchClient, INDEX_NAME } from './client';

export interface SyncTransformation {
    id: string;
    title: string;
    bpm: number | null;
    duration: number | null;
    mood_tags: string[];
    instruments: string[];
    is_instrumental: boolean;
    tuning: '440hz' | '432hz' | '528hz' | null;
    popularity_score: number;
    created_at: string;
    genre: string | null;
    key: string | null;
    language: string | null;
}

interface TrackRecord {
    id: string;
    title: string;
    bpm: number | null;
    duration_sec: number | null;
    mood_tags: string[];
    instruments: string[];
    is_instrumental: boolean;
    primary_tuning: '440hz' | '432hz' | '528hz' | null;
    popularity_score: number;
    created_at: string;
    genre: string | null;
    key: string | null;
    language: string | null;
    status: string;
}

export const SearchSync = {
    /**
     * Transforms a database record into a Meilisearch document
     */
    transformTrack(record: TrackRecord): SyncTransformation {
        return {
            id: record.id,
            title: record.title,
            bpm: record.bpm,
            duration: record.duration_sec,
            mood_tags: record.mood_tags || [],
            instruments: record.instruments || [],
            is_instrumental: !!record.is_instrumental,
            tuning: record.primary_tuning,
            popularity_score: record.popularity_score || 0,
            created_at: new Date(record.created_at).toISOString(),
            genre: record.genre,
            key: record.key,
            language: record.language || (record.is_instrumental ? 'instrumental' : 'unknown'),
        };
    },

    /**
     * Syncs a single track to Meilisearch
     */
    async indexTrack(record: TrackRecord) {
        const document = this.transformTrack(record);
        await searchClient.index(INDEX_NAME).addDocuments([document]);
        console.log(`Indexed track: ${record.id}`);
    },

    /**
     * Removes a track from Meilisearch
     */
    async deleteTrack(id: string) {
        await searchClient.index(INDEX_NAME).deleteDocument(id);
        console.log(`Deleted track from index: ${id}`);
    },

    /**
     * Sync batch of tracks (for initial population)
     */
    async indexBatch(records: TrackRecord[]) {
        const documents = records.map(record => this.transformTrack(record));
        await searchClient.index(INDEX_NAME).addDocuments(documents);
        console.log(`Indexed batch of ${records.length} tracks`);
    }
};
