
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, cover_image_url')
        .limit(20);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('--- TRACK IMAGES IN DATABASE ---');
    data.forEach(t => {
        console.log(`[${t.title}]: ${t.cover_image_url || 'NULL'}`);
    });
}

checkImages();
