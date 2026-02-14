
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
    console.log('--- Manual Ingest: The Sweat The Brass ---');

    const trackData = {
        title: 'The Sweat The Brass',
        artist: 'Sonaraura AI',
        bpm: 115,
        duration_sec: 245, // Estimated for a jam session
        genre: 'Afro-Funk / Afrobeat',
        key: 'A Minor',
        mood_tags: ['Raw', 'Energetic', 'Groovy', 'Gritty', 'Rebellious'],
        instruments: ['Wah-Wah Guitar', 'Hammond Organ', 'Trumpet', 'Saxophone', 'Congas', 'Cowbell', 'Electric Bass', 'Drum Kit'],
        status: 'active',
        ai_metadata: {
            sub_genre: ['Vintage Funk', 'World Groove', 'Rare Groove'],
            character: ['Retro', 'Analog', 'Live Sound', 'Warm'],
            vocal_type: 'Male, Percussive, Call-and-Response, Shouts',
            description: "1970'lerin tozlu ve sıcak stüdyo atmosferinden fırlamış, yüksek enerjili bir Afro-funk fırtınası. Analog bant doygunluğu (tape saturation) ve oda sesleriyle (room bleed) dolu bu parça; lastik gibi esneyen bir bas hattı, sıkı wah-wah gitarlar ve patlayıcı bir brass (üflemeli) bölümü üzerine kurulu. Perküsif erkek vokallerin 'çağrı ve cevap' (call-and-response) tekniğiyle tansiyonu yükselttiği, otantik ve terli bir 'jam session' kaydı.",
            visual_style: 'Orange, Mustard, Brown tones, Grainy photography aesthetic',
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

    // Link raw file
    await supabase.from('track_files').insert({
        track_id: data.id,
        file_type: 'raw',
        s3_key: `raw/${data.id}/The Sweat The Brass.mp3`,
        tuning: '440hz'
    });

    console.log('Ingest Complete.');
}

uploadTrack();
