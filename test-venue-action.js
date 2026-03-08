require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Minimal test to simulate getVenueTracks_Action fallback logic
async function test() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Testing fallback query...");
    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("Result:", data?.length, "Error:", error);
}

test();
