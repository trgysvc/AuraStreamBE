import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: tracks, error } = await supabase.from('tracks').select('id, title, status').in('status', ['processing', 'pending_qc', 'rejected']);
    console.log("Tracks:", tracks?.length);
    console.log(tracks);
    if(error) console.error(error);
}
main();
