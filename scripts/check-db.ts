import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, status, metadata, track_files(file_type, s3_key, tuning), created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
