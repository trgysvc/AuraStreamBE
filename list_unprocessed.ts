import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: allTracks, error } = await supabase
        .from('tracks')
        .select(`
            id, 
            title, 
            status,
            track_files (file_type, s3_key)
        `)
        .in('status', ['processing', 'active', 'pending_qc']);

    if (error) {
        console.error(error);
        return;
    }

    const tracksToProcess = allTracks.filter((track) => {
        const hasRaw = track.track_files.some(f => f.file_type === 'raw');
        const isProcessed = track.track_files.some(f => ['stream_mp3', 'stream_aac'].includes(f.file_type));
        return hasRaw && !isProcessed;
    });

    console.log(`\n=== Henüz İşlenmemiş (Unprocessed) Şarkı Listesi ===`);
    console.log(`Toplam Bekleyen: ${tracksToProcess.length}\n`);
    
    tracksToProcess.forEach((track, index) => {
        console.log(`${index + 1}. [${track.title}] (ID: ${track.id}, Mevcut Durum: ${track.status})`);
    });
}
main();
