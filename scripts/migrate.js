
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we can't depend on next/env here easily
const envPath = path.join(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const client = new Client({
    connectionString: env.POSTGRES_URL || env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        await client.query('ALTER TABLE tracks ADD COLUMN IF NOT EXISTS waveform_data JSONB;');
        console.log('Migration applied: Added waveform_data to tracks.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
