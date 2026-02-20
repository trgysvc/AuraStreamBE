
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifpbhptcnlndhwujprhn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmcGJocHRjbmxuZGh3dWpwcmhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxOTEwMCwiZXhwIjoyMDgzOTk1MTAwfQ.cANxZzZxbqQh5TM8tvK3U05Vzhk3C5kQ-S77eHfNHog';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTable(tableName) {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);
    if (error) {
        console.log(`Table '${tableName}': ERROR - ${error.message}`);
        return false;
    }
    console.log(`Table '${tableName}': EXISTS`);
    if (data && data.length > 0) {
        console.log(`  - Sample keys: ${Object.keys(data[0]).join(', ')}`);
    } else {
        console.log(`  - (Table is empty)`);
    }
    return true;
}

async function inspect() {
    console.log('--- Inspecting Supabase Schema ---');
    await checkTable('devices');
    await checkTable('playlists');
    await checkTable('playlist_items');
    await checkTable('schedules');
    await checkTable('venue_schedules');
    await checkTable('tracks');
    await checkTable('tenants');
}

inspect();
