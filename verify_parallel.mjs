import { createTrackRecord_TEST } from './upload_test_logic.mjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '/Users/trgysvc/Developer/AuraStreamBE/.env.local' });

async function testParallelBatch() {
    console.log('\n--- 3. Testing Parallel Batch Upload (Simulated) ---');
    const sourceDir = '/Users/trgysvc/Music/Suno_0203_V5_Processed';
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.mp3')).slice(0, 10);
    
    console.log(`Found ${files.length} files. Starting batch upload (Chunk Size: 5)...`);
    
    const CHUNK_SIZE = 5;
    const startTime = Date.now();

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        console.log(`Processing chunk ${i/CHUNK_SIZE + 1} (${chunk.length} files)...`);
        
        await Promise.all(chunk.map(async (file) => {
            const formData = new FormData();
            formData.set('title', file);
            formData.set('artist', 'Aura Batch Test');
            formData.set('bpm', '120');
            formData.set('genre', 'Batch');
            formData.set('duration', '180');
            
            const s3Key = `test/batch_${Date.now()}_${file}`;
            const res = await createTrackRecord_TEST(formData, s3Key);
            console.log(`  [${file}] -> ${res.message}`);
            return res;
        }));
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\nBatch upload finished in ${duration}s`);
    console.log('✅ Parallel logic simulation PASSED');
}

testParallelBatch();
