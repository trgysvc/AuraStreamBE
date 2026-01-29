import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || 'masterKey';

export const searchClient = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
});

export const INDEX_NAME = 'tracks_production';

// Initialize index settings (run this once or via migration script)
export async function configureIndex() {
    const index = searchClient.index(INDEX_NAME);

    await index.updateSettings({
        searchableAttributes: [
            'title',
            'genre',
            'mood_tags',
            'instruments',
            'description'
        ],
        filterableAttributes: [
            'bpm',
            'duration',
            'key',
            'tuning',
            'is_instrumental',
            'genre',
            'mood',
            'language',
            'created_at',
            'popularity_score'
        ],
        sortableAttributes: [
            'created_at',
            'popularity_score',
            'bpm',
            'duration'
        ],
        typoTolerance: {
            enabled: true,
            minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 }
        },
        faceting: { maxValuesPerFacet: 100 },
        pagination: { maxTotalHits: 10000 }
    });

    console.log('Meilisearch index configured successfully.');
}
