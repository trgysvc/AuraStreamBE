
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Checking database for feedbacks table...');

    const { data, error } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error accessing feedbacks table:', error);
        if (error.code === 'PGRST116') {
            console.log('Table feedbacks DOES NOT EXIST.');
        } else {
            console.log('Table might exist but errored:', error.message);
        }
    } else {
        console.log('Table feedbacks EXISTS.');
    }

    // Check Columns
    console.log('Listing columns for feedbacks table...');
    const { data: columns, error: colError } = await supabase
        .rpc('get_table_columns', { t_name: 'feedbacks' }); // Might not have this RPC, let's use raw SQL if possible or just try to select

    if (colError) {
        console.log('RPC get_table_columns failed, trying alternative...');
        const { data: cols, error: e2 } = await supabase.from('feedbacks').select().limit(1);
        if (e2) console.log('Error selecting from feedbacks:', e2.message);
        else console.log('Sample data keys:', Object.keys(cols[0] || {}));
    } else {
        console.log('Columns:', columns);
    }

    // Check Foreign Keys
    console.log('Checking foreign keys...');
    const { data: fks, error: fkError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
    if (fkError) console.log('Error accessing profiles:', fkError.message);
    else console.log('Profiles table accessible.');

    // Check Enums
    console.log('Checking for feedback enums...');
    const { data: enums, error: enumError } = await supabase.rpc('get_enum_values', { enum_name: 'feedback_category' });
    if (enumError) {
        console.log('Enums probably do not exist or RPC failed:', enumError.message);
    } else {
        console.log('Enums exist:', enums);
    }
}

verify();
