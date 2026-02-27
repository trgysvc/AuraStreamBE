import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTracks() {
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching tracks:', error);
        return;
    }

    let withMatrix = 0;
    let withoutMatrix = 0;

    for (const track of tracks) {
        const acousticUrl = track.metadata?.acoustic_matrix_url;
        if (acousticUrl) {
            withMatrix++;
            console.log(`✅ ${track.title} (Created: ${track.created_at})`);
        } else {
            withoutMatrix++;
            console.log(`❌ ${track.title} (Created: ${track.created_at}) [NO MATRIX YET]`);
        }
    }

    console.log(`\nSummary: ${withMatrix} with matrix, ${withoutMatrix} without matrix in last 50 tracks.`);
}

checkTracks();
