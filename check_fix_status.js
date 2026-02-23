
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    const content = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.join('=').trim();
        }
    });
    return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFunction() {
    // We can query information_schema or pg_proc
    const { data, error } = await supabase
        .rpc('is_staff'); // This will fail if it doesn't exist or doesn't return what we expect, but it's one way.

    if (error && error.message.includes('permission denied')) {
        console.log('is_staff exists (but failed due to lack of auth context in RPC call)');
    } else if (error && error.message.includes('does not exist')) {
        console.log('is_staff does NOT exist');
    } else {
        console.log('is_staff status:', data, error);
    }
}

async function checkTableInfo() {
    // Check if we can query pg_proc directly via the API? No, unless enabled.
    // Try to call it in a way that checks existence
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    console.log('DB Connection Test:', error ? 'Failed' : 'Success');
}

checkFunction();
