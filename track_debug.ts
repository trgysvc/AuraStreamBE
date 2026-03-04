import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const trackId = "33ed9b63-995f-4c83-b948-ccda45b8728d";
    const { data: trackData } = await supabase.from('tracks').select('*').eq('id', trackId).single();
    const { data: fileData } = await supabase.from('track_files').select('*').eq('track_id', trackId);
    
    console.log("=== Track DB record ===");
    console.log(trackData);
    console.log("=== File Records ===");
    console.log(fileData);
}
main();
