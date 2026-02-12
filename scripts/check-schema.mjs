
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

async function checkColumns() {
    console.log('--- Checking tracks table structure ---');
    try {
        const { data, error } = await supabase
            .from('tracks')
            .select('metadata, embedding')
            .limit(1);
        
        if (error) {
            console.log('Columns might be missing. Error:', error.message);
        } else {
            console.log('Success! columns metadata and embedding exist.');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkColumns();
