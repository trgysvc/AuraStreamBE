import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    // Attempting a relational query to filter out tracks that already have stream_mp3
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select(`
            id,
            title,
            status,
            track_files!inner (file_type, s3_key)
        `)
        .in('status', ['processing', 'active', 'pending_qc'])
        .limit(3);
    
    console.log(JSON.stringify(tracks, null, 2));
    if (error) console.error(error);
}
main();
