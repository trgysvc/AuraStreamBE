import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

// Load env vars manually or assume they are set in the shell when running
const client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_RAW || 'aurastream-raw-storage-v1';

async function updateCors() {
    console.log(`Updating CORS for bucket: ${BUCKET_NAME}`);

    const command = new PutBucketCorsCommand({
        Bucket: BUCKET_NAME,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ['*'],
                    AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
                    AllowedOrigins: ['*'], // For dev simplicity. In prod, list specific domains.
                    ExposeHeaders: ['ETag'],
                    MaxAgeSeconds: 3600
                }
            ]
        }
    });

    try {
        await client.send(command);
        console.log('✅ CORS configuration updated successfully!');
    } catch (err) {
        console.error('❌ Failed to update CORS:', err);
    }
}

updateCors();
