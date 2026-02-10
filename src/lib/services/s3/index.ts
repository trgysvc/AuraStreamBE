
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';

export const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const S3Service = {
    /**
     * Defines buckets based on environment
     */
    buckets: {
        raw: process.env.AWS_S3_BUCKET_RAW,
        processed: process.env.AWS_S3_BUCKET_PROCESSED,
        public: process.env.AWS_S3_BUCKET_PUBLIC,
    },

    /**
     * Generate a signed URL for uploading a file directly from the client
     */
    async getUploadUrl(key: string, contentType: string, bucket: string = process.env.AWS_S3_BUCKET_RAW!) {
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
        });
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    },

    /**
     * Generate a signed URL for downloading/streaming a private file
     */
    async getDownloadUrl(key: string, bucket: string = process.env.AWS_S3_BUCKET_PROCESSED!, options?: {
        responseContentDisposition?: string;
    }) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
            ResponseContentDisposition: options?.responseContentDisposition,
        });
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
    },

    /**
     * Download a file from S3 to a local temporary path
     */
    async downloadToTemp(key: string, bucket: string, tempPath: string) {
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        const response = await s3Client.send(command);
        if (!response.Body) throw new Error('S3 Response Body is empty');

        const writeStream = fs.createWriteStream(tempPath);
        await pipeline(response.Body as Readable, writeStream);
    },

    /**
     * Upload a local file to S3
     */
    async uploadFromPath(tempPath: string, key: string, bucket: string, contentType: string) {
        const fileStream = fs.createReadStream(tempPath);
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
        });

        return s3Client.send(command);
    },

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string, bucket: string) {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        return s3Client.send(command);
    }
};
