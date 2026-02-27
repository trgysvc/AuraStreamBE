import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function checkBPM() {
    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, bpm, metadata')

    if (error) {
        console.error("DB Error:", error);
        return;
    }

    let exactly120 = 0;
    let other = 0;
    let matchesMetadata = 0;

    data.forEach(t => {
        if (t.bpm === 120 || t.bpm === '120') exactly120++;
        else other++;

        const metaBpm = t.metadata?.technical?.bpm || t.metadata?.true_bpm;
        if (metaBpm && metaBpm == t.bpm) {
            matchesMetadata++;
        }
    });

    console.log(`Total tracks: ${data.length}`);
    console.log(`BPM = 120: ${exactly120}`);
    console.log(`BPM != 120: ${other}`);
    console.log(`BPM matches metadata: ${matchesMetadata}`);
}
checkBPM();
