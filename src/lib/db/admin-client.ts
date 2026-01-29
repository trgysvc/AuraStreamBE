
import { createClient } from '@supabase/supabase-js';

// Accessing Service Role Key securely on the server
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const createAdminClient = () => {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }

    return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
