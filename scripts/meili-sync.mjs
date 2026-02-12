
import { createClient } from '@supabase/supabase-js';
import { MeiliSearch } from 'meilisearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const meiliClient = new MeiliSearch({
    host: 'http://localhost:7700',
    apiKey: 'masterKey' // Default local key
});

async function syncToMeilisearch() {
    console.log('--- Syncing Supabase Tracks to Meilisearch ---');
    
    try {
        // 1. Fetch all tracks from Supabase
        const { data: tracks, error } = await supabase
            .from('tracks')
            .select('*')
            .eq('status', 'active');
        
        if (error) throw error;
        console.log(`Found ${tracks.length} active tracks in Supabase.`);

        // 2. Prepare Meilisearch Index
        const index = meiliClient.index('tracks');
        
        // 3. Configure Index (Faceted Search)
        await index.updateSettings({
            filterableAttributes: ['genre', 'bpm', 'mood_tags', 'artist'],
            searchableAttributes: ['title', 'artist', 'genre', 'mood_tags'],
            rankingRules: [
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'exactness'
            ]
        });
        console.log('Meilisearch settings updated.');

        // 4. Index Documents
        const response = await index.addDocuments(tracks);
        console.log('Sync task sent to Meilisearch:', response.taskUid);

    } catch (err) {
        console.error('Sync Error:', err.message);
    }
}

syncToMeilisearch();
