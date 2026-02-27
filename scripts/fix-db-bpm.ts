import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function fixBpm() {
    console.log('🚀 Starting BPM Synchronization Script...');

    // Fetch all tracks
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title, bpm, metadata');

    if (error || !tracks) {
        console.error('❌ Error fetching tracks:', error);
        return;
    }

    console.log(`🎵 Checking ${tracks.length} tracks...`);

    let updatedCount = 0;
    let fallbackCount = 0;

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        // 1. Prioritize new extract script format (true_bpm) over legacy processing format (technical.bpm)
        const dbMetadata = track.metadata || {};
        const trueBpm = dbMetadata.true_bpm || dbMetadata.technical?.bpm;

        if (!trueBpm) {
            console.log(`⚠️ Skpping ${track.title} (${track.id}) - No valid true BPM found in metadata.`);
            fallbackCount++;
            continue;
        }

        const cleanBpm = parseInt(trueBpm, 10);

        if (isNaN(cleanBpm)) {
            console.error(`❌ Non-numeric BPM string found for ${track.title}:`, trueBpm);
            continue;
        }

        // Only update if it differs
        if (track.bpm !== cleanBpm && cleanBpm > 0) {
            console.log(`[${i + 1}/${tracks.length}] Updating ${track.title}: ${track.bpm} ➡️ ${cleanBpm}`);

            const { error: updateError } = await supabase
                .from('tracks')
                .update({ bpm: cleanBpm })
                .eq('id', track.id);

            if (updateError) {
                console.error(`❌ Failed to update ${track.title}:`, updateError);
            } else {
                updatedCount++;
            }
        } else {
            // console.log(`[${i+1}/${tracks.length}] Valid - ${track.title}: ${track.bpm}`);
        }
    }

    console.log(`\n✅ BPM Synchronization Complete!`);
    console.log(`- Tracks Successfully Repaired: ${updatedCount}`);
    console.log(`- Tracks Skipping (Missing Data): ${fallbackCount}`);
}

fixBpm();
