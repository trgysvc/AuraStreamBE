import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getAllTxtFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('Trash')) {
        getAllTxtFiles(filePath, fileList);
      }
    } else if (file.endsWith('.txt')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function normalizeTitle(title) {
  if (!title) return '';
  return title.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

async function main() {
  const { data: dbTracks } = await supabase.from('tracks').select('id, title, genre');
  const problematic = dbTracks.filter(t => !t.genre || ['ambient', 'unknown'].includes(t.genre.toLowerCase()));
  const txtFiles = getAllTxtFiles('/Users/trgysvc/Music');
  
  const metadataMap = new Map();
  for (const filePath of txtFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const titleMatch = content.match(/Title:\s*(.+)/);
      if (!titleMatch) continue;
      const title = titleMatch[1].trim();
      let genre = '';
      const jsonMatch = content.match(/---\s*Raw API Response\s*---\s*(\{[\s\S]*?\})/);
      if (jsonMatch) {
        try { genre = JSON.parse(jsonMatch[1]).display_tags || ''; } catch (e) {}
      }
      
      // Also try to get genre from tags if display_tags is empty
      if (!genre && jsonMatch) {
         try { genre = JSON.parse(jsonMatch[1]).metadata?.tags || ''; } catch(e) {}
      }

      if (title && genre && genre.toLowerCase() !== 'ambient') {
        metadataMap.set(normalizeTitle(title), { genre, originalTitle: title, path: filePath });
      }
    } catch (e) {}
  }
  
  const suggestions = [];
  for (const track of problematic) {
    let dbTitle = track.title.toLowerCase().replace('v.', 'vs');
    const normDbTitle = normalizeTitle(dbTitle);
    
    let matched = false;
    for (const [key, value] of metadataMap.entries()) {
        if (key === normDbTitle || key.includes(normDbTitle) || normDbTitle.includes(key)) {
            suggestions.push({ id: track.id, db_title: track.title, matched_txt_title: value.originalTitle, current_genre: track.genre || 'None', suggested_genre: value.genre});
            matched = true;
            break;
        }
    }
  }
  
  fs.writeFileSync('genre_suggestions.json', JSON.stringify(suggestions, null, 2));
  console.log(`Found ${suggestions.length} matches out of ${problematic.length} problematic tracks. Saved to genre_suggestions.json`);
}
main();
