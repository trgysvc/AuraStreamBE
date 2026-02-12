
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

const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
);

async function activateTracks() {
    console.log('--- Activating Existing Tracks ---');
    try {
        const { data, error } = await supabase
            .from('tracks')
            .update({ status: 'active' })
            .in('status', ['processing', 'pending_qc'])
            .select();
        
        if (error) throw error;
        
        console.log(`Successfully activated ${data?.length || 0} tracks.`);
        data?.forEach(t => console.log(` - Activated: ${t.title} (${t.id})`));

    } catch (err) {
        console.error('Error activating tracks:', err.message);
    }
}

activateTracks();
