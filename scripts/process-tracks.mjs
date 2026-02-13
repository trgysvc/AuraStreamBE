
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const s3Client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
});

async function processAllTracks() {
    console.log('--- Sonaraura Processing & Watermarking Engine: Started ---');

    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('id, title')
        .in('status', ['active', 'pending_qc']);

    if (error) return console.error(error);

    for (const track of tracks) {
        console.log(`\nProcessing [${track.title}]...`);

        const { data: files } = await supabase.from('track_files').select('s3_key, file_type').eq('track_id', track.id).eq('file_type', 'raw').limit(1);
        if (!files?.length) continue;

        const s3Key = files[0].s3_key;
        const tempPath = path.join(__dirname, `tmp_${track.id}${path.extname(s3Key)}`);

        try {
            // 1. Download from S3 (Raw)
            const response = await s3Client.send(new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_RAW, Key: s3Key }));
            const writer = fs.createWriteStream(tempPath);
            
            // Wait for pipe to complete
            await new Promise((res, rej) => {
                response.Body.pipe(writer);
                response.Body.on('finish', res);
                response.Body.on('error', rej);
            });

            // 2. Analyze & Watermark with Python
            // We use the Track ID as the UUID to embed in the signal
            console.log(` Analyzing features & Embedding Steganographic Watermark...`);
            const analysisRaw = execSync(`python3 "${path.join(__dirname, 'audio_analyzer.py')}" "${tempPath}" "${track.id}"`).toString();
            const analysis = JSON.parse(analysisRaw);

            if (analysis.error) throw new Error(analysis.error);

            // 3. Upload Watermarked File to S3
            const processedKey = `processed/${track.id}/master.wav`;
            console.log(` Uploading Watermarked Master...`);
            
            // Use Buffer for smaller files to avoid streaming header issues in some environments
            const fileBuffer = fs.readFileSync(tempPath);
            
            await s3Client.send(new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_PROCESSED || env.AWS_S3_BUCKET_RAW,
                Key: processedKey,
                Body: fileBuffer,
                ContentType: 'audio/wav',
                ContentLength: fileBuffer.length
            }));

            // 4. Update Supabase FIRST (Safety)
            console.log(` Updating Database...`);
            await supabase.from('tracks').update({
                bpm: analysis.bpm,
                key: analysis.key,
                metadata: {
                    technical: { bpm: analysis.bpm, key: analysis.key },
                    vibe: { energy_level: analysis.energy },
                    waveform: analysis.waveform,
                    steganography: "LSB_V1"
                }
            }).eq('id', track.id);

            await supabase.from('track_files').upsert({
                track_id: track.id,
                file_type: 'raw', 
                s3_key: processedKey,
                tuning: '440hz'
            }, { onConflict: 'track_id,file_type,tuning' });

            // 5. DELETE ORIGINAL RAW FILE ONLY IF DB IS UPDATED
            if (processedKey !== s3Key) {
                console.log(` Purging original raw file: ${s3Key}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: env.AWS_S3_BUCKET_RAW,
                    Key: s3Key
                })).catch(e => console.warn("Failed to delete original, but master is secure."));
            }

            console.log(` Done.`);
        } catch (err) {
            console.error(` Error:`, err.message);
        } finally {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
    }
}

processAllTracks();
