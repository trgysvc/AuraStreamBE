import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARCHIVE_DIR = '/Users/trgysvc/Music/Suno';

async function updateMetadata() {
  console.log('--- Starting Deep Metadata Synchronization ---');

  // 1. Fetch all tracks from DB
  const { data: dbTracks, error } = await supabase
    .from('tracks')
    .select('id, title, genre, artist, ai_metadata, vibe_tags, theme_tags, character_tags, venue_tags');

  if (error) {
    console.error('Error fetching tracks:', error);
    return;
  }

  console.log(`Fetched ${dbTracks.length} tracks from database.`);

  // 2. Scan Archive for .txt files
  const metadataFiles = fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.txt'));
  console.log(`Found ${metadataFiles.length} metadata files in archive.`);

  const titleToMeta = new Map();

  for (const filename of metadataFiles) {
    try {
      const content = fs.readFileSync(path.join(ARCHIVE_DIR, filename), 'utf-8');
      const jsonMatch = content.match(/--- Raw API Response ---\s*({.*})/s);
      
      if (jsonMatch) {
        const meta = JSON.parse(jsonMatch[1]);
        const title = meta.title?.trim().toLowerCase();
        if (title) {
          // Store multiple matches if they exist
          if (!titleToMeta.has(title)) titleToMeta.set(title, []);
          titleToMeta.get(title).push(meta);
        }
      }
    } catch (e) {}
  }

  console.log(`Mapped ${titleToMeta.size} unique titles from local metadata.`);

  const updates = [];
  const noMatch = [];

  // 3. Match Logic
  for (const track of dbTracks) {
    const dbTitle = track.title.toLowerCase();
    
    // Look for matches
    let potentialMetas = titleToMeta.get(dbTitle) || [];
    
    // If no exact match, try fuzzy (stripping (tag) from DB title)
    if (potentialMetas.length === 0) {
        const cleanDbTitle = dbTitle.replace(/\s*\(.*\)\s*/, '').trim();
        potentialMetas = titleToMeta.get(cleanDbTitle) || [];
    }

    if (potentialMetas.length > 0) {
      // Use the first match or find the best one
      const meta = potentialMetas[0];
      const newGenre = meta.display_tags || 'Ambient';
      
      // Compare and update if generic
      if (track.genre === 'Ambient' || !track.genre || track.genre.toLowerCase() === 'unknown') {
        updates.push({
          id: track.id,
          title: track.title,
          oldGenre: track.genre,
          newGenre: newGenre,
          ai_metadata: {
              ...(track.ai_metadata || {}),
              suno_id: meta.id,
              full_tags: meta.metadata?.tags,
              prompt: meta.metadata?.prompt
          }
        });
      }
    } else {
      noMatch.push(track.title);
    }
  }

  console.log(`\nFound ${updates.length} tracks to update.`);
  if (noMatch.length > 0) {
      console.log(`Could not find metadata for ${noMatch.length} tracks (e.g., ${noMatch.slice(0,3).join(', ')})`);
  }

  // 4. Execution
  if (updates.length > 0) {
    console.log('\n--- Applying Updates ---');
    for (const update of updates) {
      process.stdout.write(`Updating: ${update.title}... `);
      const { error: upError } = await supabase
        .from('tracks')
        .update({
          genre: update.newGenre,
          ai_metadata: update.ai_metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);

      if (upError) {
        console.log('FAILED');
        console.error(upError);
      } else {
        console.log('OK');
      }
    }
  }

  console.log('\n--- Sync Complete ---');
}

updateMetadata();
