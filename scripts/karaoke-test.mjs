
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = './.env.local';
const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function injectKaraokeData() {
    console.log('--- Aura Karaoke Engine: Injecting word-level sync data ---');

    // Example JSON structure for "Été Perdu"
    const karaokeData = [
        { "text": "Le", "time": 0.5 }, { "text": "sable", "time": 0.8 }, { "text": "glisse", "time": 1.2 }, { "text": "entre", "time": 1.5 }, { "text": "mes", "time": 1.8 }, { "text": "doigts", "time": 2.2 },
        { "text": "Le", "time": 3.0 }, { "text": "vent", "time": 3.3 }, { "text": "murmure", "time": 3.8 }, { "text": "des", "time": 4.2 }, { "text": "secrets", "time": 4.5 }, { "text": "froids", "time": 4.9 },
        { "text": "Un", "time": 6.0 }, { "text": "bateau", "time": 6.3 }, { "text": "là-bas", "time": 6.8 },
        { "text": "Si", "time": 8.0 }, { "text": "loin", "time": 8.3 }, { "text": "déjà", "time": 8.8 },
        { "text": "Tout", "time": 10.0 }, { "text": "s'efface", "time": 10.5 },
        { "text": "Tout", "time": 12.0 }, { "text": "se", "time": 12.3 }, { "text": "noie", "time": 12.8 },
        // Chorus
        { "text": "Été", "time": 15.0 }, { "text": "perdu", "time": 15.5 },
        { "text": "Où", "time": 17.0 }, { "text": "es-tu", "time": 17.5 },
        { "text": "Les", "time": 20.0 }, { "text": "jours", "time": 20.3 }, { "text": "s'effacent", "time": 20.8 }, { "text": "dans", "time": 21.2 }, { "text": "la", "time": 21.5 }, { "text": "brume", "time": 21.9 }
    ];

    const { error } = await supabase
        .from('tracks')
        .update({ 
            lyrics_synced: karaokeData,
            updated_at: new Date().toISOString()
        })
        .ilike('title', '%Été Perdu%');

    if (error) {
        console.error('Failed to inject karaoke data:', error.message);
    } else {
        console.log('Successfully injected word-level sync for Été Perdu.');
    }
}

injectKaraokeData();
