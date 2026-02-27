import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBucket() {
    const { data, error } = await supabase.storage.from('acoustic-data').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
        console.error('Error fetching bucket:', error);
        return;
    }

    console.log(`Found ${data.length} files in acoustic-data bucket recently.`);

    // Checking a few of the latest ones without matrix
    // e.g. "Will You Remember Me?" -> '1a853a4a-089a-4c93-b15c-424f610af97b'
    const targetIds = [
        '1a853a4a-089a-4c93-b15c-424f610af97b',
        'fe2f560b-d844-4ca1-9ccd-4b4037deb285', // Slow Snow
        'a64c1547-a310-4f05-8813-e9feeb2662b1' // Rite of Passage
    ];

    for (const id of targetIds) {
        const exists = data.some(f => f.name.includes(id));
        console.log(`Track ${id}: JSON in bucket = ${exists ? 'YES' : 'NO'}`);
    }
}

checkBucket();
