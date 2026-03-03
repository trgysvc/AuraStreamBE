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

function getAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, fileList);
        } else if (file.endsWith('.txt')) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

console.log('Deep scanning metadata files...');
const allTxtFiles = searchDirs.flatMap(d => getAllFiles(d));

allTxtFiles.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        for (const target of targetTitles) {
            // Very flexible check: look for the title string anywhere in the first 500 chars
            if (content.substring(0, 1000).toLowerCase().includes(target.toLowerCase())) {
                const jsonMatch = content.match(/--- Raw API Response ---\s*({.*})/s);
                if (jsonMatch) {
                    const metadata = JSON.parse(jsonMatch[1]);
                    const genre = metadata.display_tags || '';
                    if (genre && genre.toLowerCase() !== 'ambient') {
                        results[target] = genre;
                    }
                } else {
                    // Try regex for Genre: line
                    const genreMatch = content.match(/Genre: (.*)/);
                    if (genreMatch) {
                        results[target] = genreMatch[1].trim();
                    }
                }
            }
        }
    } catch (e) {}
});

console.log('\n--- DEEP SCAN RESULTS ---');
targetTitles.forEach(t => {
    console.log(`${t} | ${results[t] || 'Ambient'}`);
});
