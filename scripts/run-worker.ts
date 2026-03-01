import * as dotenv from 'dotenv';
import path from 'path';

// Load variables before importing the rest of the application
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function init() {
    console.log("Starting background processing worker...");
    // Dynamic import to prevent premature evaluation of AWS credentials
    const { startWorker } = await import('../src/lib/processing/worker');

    startWorker().catch((error) => {
        console.error("Fatal worker error:", error);
        process.exit(1);
    });
}

init();
