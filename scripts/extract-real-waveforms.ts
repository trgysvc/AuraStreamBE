import { createClient } from '@supabase/supabase-js';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const execAsync = promisify(exec);

// Initialize Supabase Admin Client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION || 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_RAW || 'aurastream-raw-storage-v1';

const TMP_DIR = os.tmpdir();

async function processTracks() {
    console.log('🚀 Starting High-Res True Waveform Extraction Process (1000 points)...');

    // 1. Fetch all active tracks with their files
    const { data: allTracks, error } = await supabase
        .from('tracks')
        .select('id, title, metadata, track_files(s3_key, file_type)')
        .eq('status', 'active');

    if (error || !allTracks) {
        console.error('❌ Error fetching tracks:', error);
        return;
    }

    // Process only tracks that are missing the acoustic_matrix_url
    const tracks = allTracks.filter(t => !t.metadata?.acoustic_matrix_url);

    console.log(`🎵 Found ${tracks.length} active tracks missing acoustic matrix to process.`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        console.log(`\n-----------------------------------`);
        console.log(`[${i + 1}/${tracks.length}] Processing Track: ${track.title} (${track.id})`);

        try {
            // Find a streamable file (prefer MP3 or AAC over RAW for smaller download)
            const files = track.track_files || [];
            const targetFile = files.find(f => f.file_type === 'stream_mp3') ||
                files.find(f => f.file_type === 'stream_aac') ||
                files.find(f => f.file_type === 'raw');

            if (!targetFile) {
                console.warn(`⚠️ No suitable audio file found for ${track.title}, skipping.`);
                failCount++;
                continue;
            }

            console.log(`📥 Downloading S3 object: ${targetFile.s3_key}`);

            // 2. Download from S3
            const ext = path.extname(targetFile.s3_key) || '.mp3';
            const localFilePath = path.join(TMP_DIR, `${track.id}${ext}`);

            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: targetFile.s3_key,
            });

            const response = await s3.send(command);

            if (!response.Body) {
                throw new Error("S3 Object Body is empty.");
            }

            // Convert stream to buffer and write to disk
            const chunks = [];
            for await (const chunk of response.Body as any) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            fs.writeFileSync(localFilePath, buffer);
            console.log(`✅ File saved to ${localFilePath}`);

            // 3. Run Python analyzer with 1000 point argument
            console.log(`🐍 Running audio_analyzer.py for 1000 points...`);
            const pyScript = path.join(process.cwd(), 'scripts', 'audio_analyzer.py');

            // Pass the local file path, empty UUID for watermark, and 1000 for point resolution
            const { stdout, stderr } = await execAsync(`python3 "${pyScript}" "${localFilePath}" "" 1000`, { maxBuffer: 1024 * 1024 * 10 }); // 10MB buffer just in case

            if (stderr && !stderr.includes('Created a temporary directory')) {
                // Some librosa warnings are normal, but we log them if they look weird
            }

            // Find the JSON output block (last line usually)
            const outputLines = stdout.trim().split('\n');
            const jsonLine = outputLines[outputLines.length - 1];

            let analysisResult;
            try {
                analysisResult = JSON.parse(jsonLine);
            } catch (e) {
                console.error("Failed to parse python json output.", stdout);
                throw new Error("Invalid python output");
            }

            if (analysisResult.error) {
                throw new Error(`Python Script Error: ${analysisResult.error}`);
            }

            if (!analysisResult.matrix_file_path || !fs.existsSync(analysisResult.matrix_file_path)) {
                throw new Error("Analyzed matrix JSON file is missing!");
            }

            console.log(`📊 Successfully extracted Acoustic Matrix for ${track.title}!`);

            // 4. Read the Acoustic Matrix JSON and Upload to Supabase Bucket
            console.log(`📤 Uploading Acoustic Matrix to Supabase Storage...`);
            const matrixJsonPath = analysisResult.matrix_file_path;
            const matrixBuffer = fs.readFileSync(matrixJsonPath);

            const storagePath = `${track.id}.json`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('acoustic-data')
                .upload(storagePath, matrixBuffer, {
                    contentType: 'application/json',
                    upsert: true
                });

            if (uploadError) {
                throw new Error(`Supabase Storage Upload Error: ${uploadError.message}`);
            }

            const { data: publicUrlData } = supabase.storage
                .from('acoustic-data')
                .getPublicUrl(storagePath);

            const acousticMatrixUrl = publicUrlData.publicUrl;

            // 5. Update Supabase Database
            const newMetadata = {
                ...(track.metadata || {}),
                true_energy: analysisResult.energy,
                true_bpm: analysisResult.bpm,
                acoustic_matrix_url: acousticMatrixUrl
            };
            // Safely remove the legacy big waveform array from metadata to prevent DB bloat
            if (newMetadata.waveform) delete newMetadata.waveform;

            const { error: updateError } = await supabase
                .from('tracks')
                .update({
                    bpm: analysisResult.bpm,   // Critical: Sync true BPM directly into the column
                    metadata: newMetadata
                })
                .eq('id', track.id);

            if (updateError) {
                throw updateError;
            }

            console.log(`🚀 Supabase Metadata uniquely updated for ${track.title}!`);
            successCount++;

            // Cleanup temp file
            fs.unlinkSync(localFilePath);
            if (fs.existsSync(matrixJsonPath)) {
                fs.unlinkSync(matrixJsonPath);
            }

        } catch (err: any) {
            console.error(`❌ Failed to process track ${track.title}:`, err.message);
            failCount++;
        }
    }

    console.log(`\n🎉 Process Complete! Successfully patched ${successCount} tracks. Failed: ${failCount}`);
}

processTracks().catch(console.error);
