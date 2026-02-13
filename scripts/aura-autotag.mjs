
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function autoTagCatalog() {
    console.log('--- Aura AI: Automatic Catalog Tagging Started ---');

    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*');

    if (error) return console.error(error);

    const THEMES = ['Cinematic', 'Corporate', 'Vlog', 'Fashion', 'Sci-Fi', 'Travel'];
    const CHARACTERS = ['Acoustic', 'Synthetic', 'Percussive', 'Minimal', 'Orchestral'];
    const VIBES = ['Angry', 'Busy & Frantic', 'Chill', 'Dark', 'Dreamy', 'Epic', 'Euphoric', 'Focus', 'Happy', 'Hopeful', 'Laid Back', 'Melancholic', 'Mysterious', 'Peaceful', 'Quirky', 'Relaxing', 'Romantic', 'Sad', 'Scary', 'Sentimental', 'Sexy', 'Smooth', 'Sneaking', 'Suspense', 'Weird', 'Workout'];
    const VENUE_TAGS = ['Hotel Lobby', 'Lounge & Bar', 'Rooftop / Terrace', 'Airport / Lounge', 'Coffee Shop', 'Fine Dining', 'Bistro & Brasserie', 'Cocktail Bar', 'Fast Casual', 'Luxury Boutique', 'Streetwear Store', 'Shopping Mall', 'Showroom / Gallery', 'Spa & Massage', 'Yoga & Pilates', 'Gym & CrossFit', 'Hair Salon / Barber', 'Coworking Space', 'Corporate Office'];

    for (const track of tracks) {
        console.log(`Processing: [${track.title}]`);

        // Aura AI Logic (Simulated based on title/artist/bpm)
        const title = track.title.toLowerCase();
        const artist = (track.artist || "").toLowerCase();
        const bpm = track.bpm || 120;

        let theme = [];
        let char = [];
        let vibes = [];
        let venues = [];

        // 1. Theme Logic
        if (title.includes('vlog') || title.includes('travel')) theme.push('Vlog', 'Travel');
        if (title.includes('cinematic') || title.includes('epic')) theme.push('Cinematic');
        if (title.includes('corporate') || title.includes('brand')) theme.push('Corporate');

        // 2. Character Logic
        if (bpm > 130) char.push('Percussive');
        if (title.includes('acoustic') || title.includes('piano') || title.includes('guitar')) char.push('Acoustic');
        else char.push('Synthetic');

        // 3. Vibe Logic
        if (bpm < 90) vibes.push('Chill', 'Relaxing', 'Peaceful');
        else if (bpm > 125) vibes.push('Epic', 'Energetic', 'Workout');
        else vibes.push('Smooth', 'Happy');

        if (title.includes('dark') || title.includes('noir')) vibes.push('Dark', 'Mysterious');

        // 4. Venue Logic
        if (vibes.includes('Chill')) venues.push('Coffee Shop', 'Hotel Lobby', 'Spa & Massage');
        if (vibes.includes('Workout')) venues.push('Gym & CrossFit');
        if (vibes.includes('Smooth')) venues.push('Lounge & Bar', 'Luxury Boutique');

        // Defaults if empty
        if (theme.length === 0) theme = ['Cinematic'];
        if (char.length === 0) char = ['Minimal'];
        if (vibes.length === 0) vibes = ['Chill'];
        if (venues.length === 0) venues = ['Showroom / Gallery'];

        // Apply to DB
        await supabase.from('tracks').update({
            theme: [...new Set(theme)],
            character: [...new Set(char)],
            vibe_tags: [...new Set(vibes)],
            venue_tags: [...new Set(venues)],
            updated_at: new Date().toISOString()
        }).eq('id', track.id);

        console.log(` -> Tagged as: ${theme[0]} | ${vibes.join(', ')}`);
    }

    console.log('--- Aura AI: Global Tagging Completed ---');
}

autoTagCatalog();
