import { SQSClient, SendMessageCommand, SendMessageCommandInput } from '@aws-sdk/client-sqs';

const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;

// Extract region from SQS URL or fallback to env
const getSqsRegion = () => {
    if (!QUEUE_URL) return process.env.AWS_REGION || 'eu-central-1';
    const match = QUEUE_URL.match(/sqs\.([\w-]+)\.amazonaws\.com/);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return match ? match[1] : (process.env.AWS_REGION || 'eu-central-1');
};

export const sqsClient = new SQSClient({
    region: getSqsRegion(),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const QueueService = {
    /**
     * Sends a track for processing
     * @param trackId The UUID of the track to process
     */
    async triggerProcessing(trackId: string) {
        if (!QUEUE_URL) {
            console.warn('AWS_SQS_QUEUE_URL is not set. Skipping queue trigger.');
            return;
        }

        const isFifo = QUEUE_URL.endsWith('.fifo');

        const params: SendMessageCommandInput = {
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify({ trackId, action: 'PROCESS_TRACK' }),
        };

        if (isFifo) {
            params.MessageGroupId = 'audio-processing';
            params.MessageDeduplicationId = trackId;
        }

        const command = new SendMessageCommand(params);

        try {
            const response = await sqsClient.send(command);
            console.log(`Queued track ${trackId} for processing. MessageId: ${response.MessageId}`);
            return response;
        } catch (error) {
            console.error('Failed to queue processing job:', error);
            throw error;
        }
    }
};
