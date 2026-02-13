
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const migrationFile = path.join(__dirname, '../supabase/migrations/20260213_smart_scheduling.sql');
    const sql = fs.readFileSync(migrationFile, 'utf-8');

    try {
        await client.connect();
        console.log('Connected to database.');
        await client.query(sql);
        console.log('Migration applied: Smart Scheduling.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
