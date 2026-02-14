
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/Users/trgysvc/Developer/AuraStreamBE/.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

async function testNewMetadata() {
    console.log('--- Testing New Schema Columns ---');

    const trackData = {
        title: 'The Sweat The Brass (Enhanced Meta)',
        artist: 'Sonaraura AI',
        bpm: 115,
        genre: 'Afro-Funk / Afrobeat',
        sub_genres: ['Vintage Funk', 'World Groove', 'Rare Groove'], // New Column
        key: 'A Minor',
        mood_tags: ['Raw', 'Energetic', 'Groovy', 'Gritty', 'Rebellious'],
        character_tags: ['Retro', 'Analog', 'Live Sound', 'Warm'], // New Column
        instruments: ['Wah-Wah Guitar', 'Hammond Organ', 'Brass Section'],
        vocal_type: 'Male, Percussive, Call-and-Response', // New Column
        status: 'active',
        ai_metadata: { source: 'schema_verification_test' }
    };

    const { data, error } = await supabase.from('tracks').insert(trackData).select().single();

    if (error) {
        console.error('Migration Required: Please run the SQL script in Supabase first!', error.message);
        return;
    }

    console.log('Success! Track stored with dedicated metadata columns. ID:', data.id);
}

testNewMetadata();
