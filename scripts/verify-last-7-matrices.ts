import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title, metadata')
        .not('metadata->acoustic_matrix_url', 'is', null)
        .limit(17);

    if (error) {
        console.error("Database error:", error);
        return;
    }

    console.log(`\n🔍 Checking the last 7 updated tracks...`);
    console.log(`--------------------------------------------------`);

    for (const track of tracks) {
        const url = track.metadata?.acoustic_matrix_url;
        if (!url) {
            console.log(`❌ Track: "${track.title}" (${track.id})\n   -> No acoustic_matrix_url found in metadata.\n`);
            continue;
        }

        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.log(`❌ Track: "${track.title}" (${track.id})\n   -> Fetch failed with status: ${res.status}\n`);
                continue;
            }

            const json = await res.json();

            if (!Array.isArray(json)) {
                console.log(`❌ Track: "${track.title}" (${track.id})\n   -> JSON fetched is not an array.\n`);
                continue;
            }

            const frameCount = json.length;
            const paramCount = frameCount > 0 ? Object.keys(json[0]).length : 0;

            let status = frameCount === 5000 && paramCount === 56 ? '✅ SUCCESS' : '⚠️ WARNING';
            // Note: 54 audio features + 'frame_index' + 't' = 56 total keys per frame object

            console.log(`${status} Track: "${track.title}" (${track.id})`);
            console.log(`   -> URL: ${url}`);
            console.log(`   -> Frames (Peaks): ${frameCount} ${frameCount === 5000 ? '(Perfect)' : '(Mismatch!)'}`);
            console.log(`   -> Total Keys/Frame: ${paramCount} (54 audio params + 2 index/time params)\n`);

        } catch (e: any) {
            console.error(`❌ Track: "${track.title}" (${track.id})\n   -> Failed to fetch or parse URL: ${url}\n   -> Error: ${e.message}\n`);
        }
    }
}

check();
