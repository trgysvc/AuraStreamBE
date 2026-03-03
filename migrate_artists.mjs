import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateArtists() {
  console.log('--- Starting Artist Re-Branding Migration ---');

  const targets = ['turgay', 'Sonaraura', 'Sonaraura\n'];
  const newBrand = 'Sonaraura Studio';

  for (const oldArtist of targets) {
    process.stdout.write(`Migrating "${oldArtist}" to "${newBrand}"... `);
    
    const { data, error, count } = await supabase
      .from('tracks')
      .update({ artist: newBrand })
      .eq('artist', oldArtist)
      .select('id');

    if (error) {
      console.log('FAILED');
      console.error(error);
    } else {
      console.log(`OK (${data.length} tracks updated)`);
    }
  }

  // Final count check
  const { data: finalData } = await supabase.from('tracks').select('artist');
  const counts = finalData.reduce((acc, t) => {
    acc[t.artist] = (acc[t.artist] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n--- Final Artist Distribution ---');
  console.table(counts);
}

migrateArtists();
