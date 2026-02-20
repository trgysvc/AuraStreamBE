
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });
    return env;
}

const env = loadEnv();
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']!;
const SUPABASE_SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']!;

async function inspectPolicies() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('--- Inspecting RLS Policies ---');

    // Querying pg_policies requires some privileges, usually service_role has it via RPC or if direct access is allowed
    // In Supabase, we can use a raw query if we have an RPC, or try to use the REST API on pg_catalog if exposed (rarely)
    // Alternatively, we can check if RLS is enabled on specific tables by trying to query them with anon key

    const tables = ['profiles', 'tracks', 'likes', 'playlists', 'playlist_items', 'tenants', 'venue_schedules'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        // We can check if RLS is enabled via information_schema or just try to query with anon key
    }

    // Try to run a query that might fail if RLS is on and no policies exist (anon key)
    const anonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
    const anonSupabase = createClient(SUPABASE_URL, anonKey);

    for (const table of tables) {
        const { data, error } = await anonSupabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`[Anon] ${table}: Error - ${error.message} (${error.code})`);
        } else {
            console.log(`[Anon] ${table}: Success - returned ${data.length} rows`);
        }
    }
}

inspectPolicies();
