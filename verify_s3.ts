import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-central-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function main() {
    // Checking the first track from the list: Summer Curtain Bossa (Rhythmic)
    const trackId = "33ed9b63-995f-4c83-b948-ccda45b8728d";
    const processedKey = `processed/${trackId}/master.mp3`;
    
    console.log(`Checking S3 for ${processedKey}...`);
    try {
        await s3Client.send(new HeadObjectCommand({ 
            Bucket: process.env.AWS_S3_BUCKET_PROCESSED || process.env.AWS_S3_BUCKET_RAW, 
            Key: processedKey 
        }));
        console.log(`[FOUND] The mp3 already exists in S3!`);
    } catch (e) {
        if (e.name === 'NotFound') {
            console.log(`[NOT FOUND] No mp3 found in S3.`);
        } else {
            console.error(`Error checking S3:`, e);
        }
    }
}
main();
