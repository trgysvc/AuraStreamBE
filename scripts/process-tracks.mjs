
console.log('Script init started...');
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

        // SKIP if already processed
        if (s3Key.startsWith('processed/')) {
            console.log(` [Skip] Already processed: ${track.title}`);
            continue;
        }

        const tempFiles = [];

        try {
            // 1. Download from S3 (Raw) - Save as input file preserving extension
            // We need to know the extension to help ffmpeg/librosa if needed, but we'll convert to WAV anyway.
            const rawExt = path.extname(s3Key);
            const inputPath = path.join(__dirname, `temp_input_${track.id}${rawExt}`);
            const pcmPath = path.join(__dirname, `temp_pcm_${track.id}.wav`);
            const outputPath = path.join(__dirname, `temp_output_${track.id}.mp3`);

            tempFiles.push(inputPath, pcmPath, outputPath);

            // Clean up any previous run leftovers
            tempFiles.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p) });

            const response = await s3Client.send(new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET_RAW, Key: s3Key }));
            const writer = fs.createWriteStream(inputPath);

            await new Promise((res, rej) => {
                response.Body.pipe(writer);
                response.Body.on('finish', res);
                response.Body.on('error', rej);
            });

            // 2. Decode to PCM WAV (16-bit, 44.1kHz) for predictable Steganography
            // -y: Overwrite output
            // -ar 44100: Set sample rate to 44.1kHz
            // -ac 2: Set channels to 2 (Stereo)
            console.log(` Decoding to PCM WAV...`);
            execSync(`ffmpeg -y -i "${inputPath}" -ar 44100 -ac 2 "${pcmPath}"`, { stdio: 'ignore' });

            // 3. Analyze & Watermark (Python overwrites pcmPath with watermarked WAV)
            console.log(` Analyzing & Embedding Watermark...`);
            const analysisRaw = execSync(`python3 "${path.join(__dirname, 'audio_analyzer.py')}" "${pcmPath}" "${track.id}"`).toString();
            const analysis = JSON.parse(analysisRaw);

            if (analysis.error) throw new Error(analysis.error);

            // 4. Encode to High-Quality MP3 (CBR 320kbps) with Normalization (-14 LUFS)
            console.log(` Transcoding & Normalizing to 320kbps MP3...`);
            // -b:a 320k : Constant Bit Rate 320kbps
            // -codec:a libmp3lame : Use LAME encoder
            // -af loudnorm=I=-14:LRA=11:TP=-1.5 : EBU R128 Normalization
            execSync(`ffmpeg -y -i "${pcmPath}" -af "loudnorm=I=-14:LRA=11:TP=-1.5" -codec:a libmp3lame -b:a 320k "${outputPath}"`, { stdio: 'ignore' });

            // 5. Upload Master MP3 to S3
            const processedKey = `processed/${track.id}/master.mp3`;
            console.log(` Uploading Master MP3...`);

            const fileBuffer = fs.readFileSync(outputPath);

            await s3Client.send(new PutObjectCommand({
                Bucket: env.AWS_S3_BUCKET_PROCESSED || env.AWS_S3_BUCKET_RAW,
                Key: processedKey,
                Body: fileBuffer,
                ContentType: 'audio/mpeg', // Correct MIME type for MP3
                ContentLength: fileBuffer.length
            }));

            // --- UPLOAD ACOUSTIC MATRIX TO BUCKET ---
            const matrixLocalPath = analysis.matrix_file_path;
            const bucketPath = `${track.id}.json`;
            let acousticMatrixUrl = null;

            if (matrixLocalPath && fs.existsSync(matrixLocalPath)) {
                console.log(` Uploading Acoustic Matrix to Supabase Storage...`);
                const matrixFileBody = fs.readFileSync(matrixLocalPath);

                const { data: uploadData, error: uploadError } = await supabase
                    .storage
                    .from('acoustic-data')
                    .upload(bucketPath, matrixFileBody, {
                        contentType: 'application/json',
                        upsert: true
                    });

                if (uploadError) {
                    console.error(` [ERROR] Failed to upload Acoustic Matrix for ${track.id}:`, uploadError);
                } else {
                    const { data: publicUrlData } = supabase
                        .storage
                        .from('acoustic-data')
                        .getPublicUrl(bucketPath);

                    acousticMatrixUrl = publicUrlData.publicUrl;
                }
            }

            // 6. Update Database
            console.log(` Updating Database...`);
            await supabase.from('tracks').update({
                bpm: analysis.bpm,
                key: analysis.key,
                duration_sec: analysis.duration,
                metadata: {
                    technical: { bpm: analysis.bpm, key: analysis.key },
                    vibe: { energy_level: analysis.energy },
                    waveform: analysis.waveform,
                    ...(acousticMatrixUrl ? { acoustic_matrix_url: acousticMatrixUrl } : {}),
                    steganography: "LSB_V1_MP3_320K"
                }
            }).eq('id', track.id);

            await supabase.from('track_files').upsert({
                track_id: track.id,
                file_type: 'stream_mp3', // Tag as streamable MP3 for the player
                s3_key: processedKey,
                tuning: '440hz'
            }, { onConflict: 'track_id,file_type,tuning' });

            // 7. Cleanup Original S3 File
            if (processedKey !== s3Key) {
                console.log(` Purging original raw file: ${s3Key}`);
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: env.AWS_S3_BUCKET_RAW,
                    Key: s3Key
                })).catch(e => console.warn("Failed to delete original, but master is secure."));
            }

            console.log(` Done.`);

        } catch (err) {
            console.error(` Error processing track ${track.id} (${track.title}):`, err.message);
        } finally {
            // Temp Cleanup
            tempFiles.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p) });
        }
    }
}

processAllTracks();
