import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkBPM() {
    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, bpm, metadata')
        .limit(20)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    console.log("Recent 20 tracks BPM:");
    data.forEach(t => {
        console.log(`- [${t.bpm}] ${t.title} | Metadata BPM: ${t.metadata?.technical?.bpm || t.metadata?.true_bpm}`);
    });
}
checkBPM();
