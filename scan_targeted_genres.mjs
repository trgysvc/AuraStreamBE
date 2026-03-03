import fs from 'fs';
import path from 'path';

const searchDirs = [
    '/Users/trgysvc/Music/Suno',
    '/Users/trgysvc/Music/SunoV5',
    '/Users/trgysvc/Music/Suno_03_Social_Dining',
    '/Users/trgysvc/Music/Suno_03_Social_Cafe'
];

const targetTitles = [
    "Calm v. Disquiet", "My Light Will Go On", "3 Bandits", "A Jazzy Winter Scenery", 
    "Crowds and a Glass", "Shiny Sizzle", "A Veiled Spotlight", "Reaching High", 
    "Such is Life, Yet Shouldn't Be", "An Ode to A Capella", "A Passing Lo-fi Dream", 
    "Remembered to Save?", "Lagos Heatwave", "The Urban", "Midday Beginnings", 
    "Arpeggios Under Moonlight & Dusk", "O büyü bozuldu, ışıklar söndü artık", 
    "Mood Indigo", "Will You Remember Me?", "Soft Dim Shine", "Dreams of a Kindred Soul", 
    "Midnight in Marrakesh", "Sanctuary of Dust and Glass", 
    "(Solo Ride Cymbal rhythm starts)", "Velvet Latitude", "The Sweat & The Brass", 
    "Quiet Reflections", "Sonbahar Akşamı feat.Soul", "ChillFiJazz Vol2", 
    "Dancing Under Feint Colors", "Under Spotlight on Accident", 
    "Midday Lights Sprayed Across", "Smooth Transitions", "Matte Cyan Sofa", 
    "Işıklar süzülür camların üzerinden", "To Leave The Sea (Official Video) (Extend)", 
    "Bu ses ne?", "Midnight On The Blacktop", "Slow Snow", "Steam & Late Pages", 
    "Morning Roll", "Dancin' on the Clouds", "Right Here In The Moment", 
    "Soulful Strides", "The Dormitory", "Quiet Reflections beat", 
    "The Zenith of the Eclipse", "The Urban Pulse", "Velvet Neon Gravity"
];

const results = {};

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!file.includes('Processed')) scanDir(fullPath);
        } else if (file.endsWith('.txt')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const titleMatch = content.match(/Title: (.*)/);
                const jsonMatch = content.match(/--- Raw API Response ---\s*({.*})/s);
                
                if (titleMatch && jsonMatch) {
                    const title = titleMatch[1].trim();
                    const metadata = JSON.parse(jsonMatch[1]);
                    const genre = metadata.display_tags || '';
                    
                    // Check if it's one of our targets (fuzzy)
                    for (const target of targetTitles) {
                        if (title.toLowerCase() === target.toLowerCase() || 
                            target.toLowerCase().includes(title.toLowerCase()) ||
                            title.toLowerCase().includes(target.toLowerCase())) {
                            if (genre && genre.toLowerCase() !== 'ambient') {
                                results[target] = genre;
                            }
                        }
                    }
                }
            } catch (e) {}
        }
    }
}

console.log('Scanning for targeted genres...');
searchDirs.forEach(scanDir);

console.log('\n--- TARGETED GENRE RESULTS ---');
targetTitles.forEach(t => {
    console.log(`${t}: ${results[t] || 'NOT FOUND (Likely truly Ambient or no metadata)'}`);
});
