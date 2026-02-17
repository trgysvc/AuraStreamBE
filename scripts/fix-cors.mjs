import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const client = new S3Client({
    region: env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = env.AWS_S3_BUCKET_RAW || 'aurastream-raw-storage-v1';

async function updateCors() {
    console.log(`Updating CORS for bucket: ${BUCKET_NAME}`);

    const command = new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
                    AllowedOrigins: ['*'],
                    ExposeHeaders: [
                        'ETag',
                        'Content-Range',
                        'Accept-Ranges',
                        'Content-Length',
                        'Range',
                        'Access-Control-Allow-Origin',
                        'Access-Control-Allow-Methods',
                        'Access-Control-Allow-Headers'
                    ],
                    MaxAgeSeconds: 3000
                }
            ]
        }
    });

    try {
        await client.send(command);
        console.log('✅ CORS configuration updated for Safari/Apple standards!');
    } catch (err) {
        console.error('❌ Failed to update CORS:', err);
    }
}

updateCors();
