
import { createClient } from '@supabase/supabase-js';
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

async function cleanupDuplicates() {
    console.log('--- Aura DB Surgeon: Cleaning up track file pointers ---');

    // 1. Get all track files
    const { data: files } = await supabase.from('track_files').select('*');
    if (!files) return;

    for (const file of files) {
        // If it's a 'raw' file pointing to 'raw/' but there's a 'processed/' version, delete the old one
        if (file.s3_key.startsWith('raw/')) {
            const trackId = file.track_id;
            
            // Check if a processed version exists for this track
            const { data: processed } = await supabase
                .from('track_files')
                .select('id')
                .eq('track_id', trackId)
                .ilike('s3_key', 'processed/%')
                .maybeSingle();

            if (processed) {
                console.log(`Removing stale raw pointer for track ${trackId}: ${file.s3_key}`);
                await supabase.from('track_files').delete().eq('id', file.id);
            }
        }
    }

    console.log('--- Cleanup Completed ---');
}

cleanupDuplicates();
