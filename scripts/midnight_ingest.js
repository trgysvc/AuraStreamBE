
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser
const envFile = fs.readFileSync('/Users/trgysvc/Developer/AuraStreamBE/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadTrack() {
    console.log('--- Manual Ingest: Midnight in Marrakesh ---');

    const trackData = {
        title: 'Midnight in Marrakesh',
        artist: 'Sonaraura AI',
        bpm: 122,
        duration_sec: 215,
        genre: 'Afro House / Nu-Jazz',
        key: 'Eb Minor',
        mood_tags: ['Sophisticated', 'Warm', 'Groovy', 'Uplifting', 'Elegant'],
        instruments: ['Congas', 'Muted Electric Guitar', 'Rhodes Piano', 'Trumpet', 'Saxophone', 'Shakers', 'Deep Bass'],
        status: 'active',
        ai_metadata: {
            sub_genre: ['Afro-Funk', 'Soulful House', 'Lounge'],
            energy_level: 'Mid-High',
            vocal_type: 'Female, Soulful, Smooth, Lead & Backing',
            source: 'manual_metadata_ingest'
        }
    };

    const { data, error } = await supabase
        .from('tracks')
        .insert(trackData)
        .select()
        .single();

    if (error) {
        console.error('Error inserting track:', error);
        return;
    }

    console.log('Track inserted successfully:', data.id);

    // Mock file record
    await supabase.from('track_files').insert({
        track_id: data.id,
        file_type: 'raw',
        s3_key: `raw/${data.id}/Midnight in Marrakesh.mp3`,
        tuning: '440hz'
    });

    console.log('Ingest Complete.');
}

uploadTrack();
