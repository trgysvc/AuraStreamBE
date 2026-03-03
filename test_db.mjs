import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('tracks').select('id, title, genre').in('title', ['Calm v. Disquiet', 'My Light Will Go On', '3 Bandits', 'A Jazzy Winter Scenery', 'Crowds and a Glass']);
  console.log(data);
}
run();
