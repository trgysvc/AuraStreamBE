import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Creating bucket 'acoustic-data'...");
    const { data, error } = await supabase.storage.createBucket('acoustic-data', {
        public: true,
        allowedMimeTypes: ['application/json'],
        fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
        console.error("Error creating bucket:", error.message);
        if (error.message.includes("already exists") || error.message.includes("Duplicate")) {
            console.log("Bucket already exists. Updating it to be public...");
            const { data: updateData, error: updateError } = await supabase.storage.updateBucket('acoustic-data', {
                public: true,
                allowedMimeTypes: ['application/json'],
            });
            if (updateError) {
                console.error("Error updating bucket:", updateError);
            } else {
                console.log("Successfully updated bucket");
            }
        }
    } else {
        console.log("Successfully created bucket:", data);
    }
}

main();
