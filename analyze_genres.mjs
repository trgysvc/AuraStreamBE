import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const processedDirs = [
  '/Users/trgysvc/Music/Suno_0203_V5_Processed',
  '/Users/trgysvc/Music/Suno_03_Social_Dining_Processed'
];

async function analyzeMissingGenres() {
  console.log('--- Analyzing Tracks for Missing/Generic Genre Information ---');

  // 1. Fetch all tracks from the DB (including those in pending_qc or processing)
  const { data: dbTracks, error } = await supabase
    .from('tracks')
    .select('id, title, genre, artist, status');

  if (error) {
    console.error('Error fetching DB tracks:', error);
    return;
  }

  console.log(`Fetched ${dbTracks.length} tracks from database.`);

  // 2. Scan local processed files for actual metadata
  const fileMetadataMap = new Map();

  for (const dir of processedDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));
    
    // We'll also need the original .txt files to be 100% sure about the genre if ID3 read is not enough
    // But since I just ran the tagging script, the local MP3s have the tags.
    // However, I can also look at the .txt files in the source directories if I want to be thorough.
    // For now, let's assume the .mp3 filename (which I cleaned) or the tags are the best source.
  }

  // Actually, let's look at the "genre" field in DB and see if it's "Ambient" (default) or empty
  const problematicTracks = dbTracks.filter(t => 
    !t.genre || 
    t.genre.toLowerCase() === 'ambient' || 
    t.genre.toLowerCase() === 'unknown'
  );

  console.log(`Found ${problematicTracks.length} tracks with generic/missing genre in DB.`);

  // 3. Prepare a mapping from titles to specific genres using local .txt files
  // Search recursively in the Music folder for any .txt metadata
  const searchDir = '/Users/trgysvc/Music';
  
  const titleToGenreMap = new Map();
  const sampleTxtTitles = [];

  const getAllTxtFiles = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!file.includes('Processed') && !file.includes('Trash')) { // Skip processed and trash
            getAllTxtFiles(filePath, fileList);
        }
      } else if (file.endsWith('.txt')) {
        fileList.push(filePath);
      }
    });
    return fileList;
  };

  console.log('Scanning for metadata files in', searchDir, '...');
  const allMetadataFiles = getAllTxtFiles(searchDir);
  console.log(`Found ${allMetadataFiles.length} potential metadata files.`);

  for (const filePath of allMetadataFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 1. Extract Title
        const titleMatch = content.match(/Title: (.*)/);
        let title = '';
        if (titleMatch) {
            title = titleMatch[1].trim();
        }

        // 2. Extract Genre (from JSON display_tags)
        const jsonMatch = content.match(/--- Raw API Response ---\s*({.*})/s);
        let genre = '';
        if (jsonMatch) {
            const metadata = JSON.parse(jsonMatch[1]);
            genre = metadata.display_tags || '';
        }
        
        if (title && genre) {
            if (sampleTxtTitles.length < 5) sampleTxtTitles.push(title);
            
            // We store the most specific genre found
            if (genre.toLowerCase() !== 'ambient' && genre !== '') {
                titleToGenreMap.set(title.toLowerCase(), genre);
            }
        }
    } catch (e) {
        // console.error(`Failed to parse ${filePath}:`, e.message);
    }
  }

  console.log('Sample DB Problematic Titles:', problematicTracks.slice(0, 5).map(t => t.title));
  console.log('First 20 Entries in titleToGenreMap:');
  console.log(Array.from(titleToGenreMap.entries()).slice(0, 20));

  console.log(`Total entries in titleToGenreMap: ${titleToGenreMap.size}`);

  // 4. Match and suggest updates
  const suggestions = [];
  for (const track of problematicTracks) {
      const dbTitle = track.title.toLowerCase();
      
      let match = null;
      
      // Try exact match first
      if (titleToGenreMap.has(dbTitle)) {
          match = titleToGenreMap.get(dbTitle);
      } else {
          // Try fuzzy match: strip parentheses from keys in map and compare
          for (const [txtTitle, genre] of titleToGenreMap.entries()) {
              const cleanTxtTitle = txtTitle.replace(/\s*\(.*\)\s*/, '').trim();
              if (cleanTxtTitle === dbTitle) {
                  match = genre;
                  break;
              }
          }
      }

      if (match && match !== track.genre) {
          suggestions.push({
              id: track.id,
              title: track.title,
              currentGenre: track.genre,
              suggestedGenre: match,
              status: track.status
          });
      }
  }

  console.log('\n--- Suggested Genre Updates ---');
  if (suggestions.length === 0) {
      console.log('No matches found to update.');
  } else {
      console.table(suggestions.map(s => ({
          Title: s.title,
          Current: s.currentGenre,
          Suggested: s.suggestedGenre,
          Status: s.status
      })));
      console.log(`\nTotal suggestions: ${suggestions.length}`);
  }
}

analyzeMissingGenres();
