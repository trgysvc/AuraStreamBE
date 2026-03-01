import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createAdminClient } from '../src/lib/db/admin-client';
import { S3Service } from '../src/lib/services/s3';

async function cleanup() {
    console.log('--- Redundant Tuning Cleanup Started ---');
    const { createAdminClient } = await import('../src/lib/db/admin-client');
    const { S3Service } = await import('../src/lib/services/s3');
    const supabase = createAdminClient();

    // 1. Find all 432hz and 528hz entries
    const { data: files, error } = await supabase
        .from('track_files')
        .select('*')
        .in('tuning', ['432hz', '528hz']);

    if (error) {
        console.error('Error fetching files:', error);
        return;
    }

    if (!files || files.length === 0) {
        console.log('No redundant tuning files found.');
        return;
    }

    console.log(`Found ${files.length} redundant tuning entries. Starting cleanup...`);

    for (const file of files) {
        try {
            console.log(`[CLEANUP] Deleting ${file.tuning} for track ${file.track_id}...`);

            // Delete from S3
            if (process.env.AWS_S3_BUCKET_PROCESSED) {
                await S3Service.deleteFile(file.s3_key, process.env.AWS_S3_BUCKET_PROCESSED);
                console.log(` -> Deleted from S3: ${file.s3_key}`);
            }

            // Delete from DB
            await supabase
                .from('track_files')
                .delete()
                .eq('id', file.id);

            console.log(` -> Deleted from Database record.`);

        } catch (err) {
            console.error(` [ERROR] Failed to cleanup file ${file.id}:`, err);
        }
    }

    console.log('--- Cleanup Finished ---');
}

cleanup();
