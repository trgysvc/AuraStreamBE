import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: dbTracks } = await supabase.from('tracks').select('id, title, genre');
  const problematic = dbTracks.filter(t => !t.genre || ['ambient', 'unknown'].includes(t.genre.toLowerCase()));
  
  const content = problematic.map(t => `- ${t.title} (${t.genre || 'None'})`).join('\n');
  fs.writeFileSync('/Users/trgysvc/.gemini/antigravity/brain/962327fb-7567-47fb-945d-b66fa4147e7b/missing_genres.md', `# Tracks Missing Genre metadata\n\nThere are ${problematic.length} tracks with missing or 'Ambient' genres.\n\n${content}\n`);
  console.log("Written to missing_genres.md");
}
main();
