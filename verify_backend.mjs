import { createTrackRecord_TEST } from './upload_test_logic.mjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDuplicate() {
    console.log('\n--- 1. Testing Duplicate Check ---');
    const title = 'Verification Test Track ' + Date.now();
    const artist = 'Aura Verification';
    
    const formData = new FormData();
    formData.set('title', title);
    formData.set('artist', artist);
    formData.set('bpm', '120');
    formData.set('genre', 'Test');
    formData.set('duration', '180');
    
    const s3Key = `test/verify_${Date.now()}.mp3`;

    console.log('Initial upload...');
    const res1 = await createTrackRecord_TEST(formData, s3Key);
    console.log('Result 1:', res1.message);

    console.log('Duplicate upload (Same Title & Artist)...');
    const res2 = await createTrackRecord_TEST(formData, s3Key);
    console.log('Result 2:', res2.message, res2.error);

    if (res2.error === 'Duplicate') {
        console.log('✅ Duplicate check PASSED');
    } else {
        console.error('❌ Duplicate check FAILED');
    }
    
    // Cleanup the first one
    if (res1.id) {
        await supabase.from('track_files').delete().eq('track_id', res1.id);
        await supabase.from('tracks').delete().eq('id', res1.id);
    }
}

async function testAtomicCleanup() {
    console.log('\n--- 2. Testing Atomic Cleanup (SQS Failure) ---');
    const title = 'SQS Failure Test Track ' + Date.now();
    const artist = 'Aura Verification';
    
    // Backup and Mess up SQS URL
    const originalSqs = process.env.AWS_SQS_QUEUE_URL;
    process.env.AWS_SQS_QUEUE_URL = 'https://sqs.eu-central-1.amazonaws.com/123456789012/invalid-queue';

    const formData = new FormData();
    formData.set('title', title);
    formData.set('artist', artist);
    formData.set('bpm', '120');
    formData.set('genre', 'Test');
    formData.set('duration', '180');
    const s3Key = `test/sqs_fail_${Date.now()}.mp3`;

    console.log('Attempting upload with invalid SQS URL...');
    const res = await createTrackRecord_TEST(formData, s3Key);
    console.log('Result:', res.message, res.error);

    // Verify DB
    const { data: track } = await supabase.from('tracks').select('id').eq('title', title).maybeSingle();
    
    if (res.error === 'SQS Error' && !track) {
        console.log('✅ Atomic cleanup PASSED (Record deleted after SQS failure)');
    } else {
        console.error('❌ Atomic cleanup FAILED', { hasTrackInDB: !!track });
        if (track) {
            await supabase.from('track_files').delete().eq('track_id', track.id);
            await supabase.from('tracks').delete().eq('id', track.id);
        }
    }

    // Restore SQS
    process.env.AWS_SQS_QUEUE_URL = originalSqs;
}

async function runTests() {
    console.log('--- Starting Backend Logic Verification ---');
    await testDuplicate();
    await testAtomicCleanup();
    console.log('\n--- Verification Complete ---');
}

runTests();
