import { NextRequest, NextResponse } from 'next/server';
import { SearchSync } from '@/lib/search/sync';

// This secret should be set in Supabase Database Webhook config as a query param or header
// e.g. https://api.aurastream.com/api/webhooks/db-sync?secret=YOUR_SECRET
const SYNC_SECRET = process.env.MEILISEARCH_SYNC_SECRET;

export async function POST(req: NextRequest) {
    // 1. Security Check
    const secret = req.nextUrl.searchParams.get('secret');
    if (secret !== SYNC_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Parse Webhook Value
        const body = await req.json();
        const { type, table, record, old_record } = body;

        // We only care about the 'tracks' table for now
        if (table !== 'tracks') {
            return NextResponse.json({ message: 'Ignored table' });
        }

        // 3. Handle Events
        switch (type) {
            case 'INSERT':
                if (record.status === 'active') {
                    await SearchSync.indexTrack(record);
                }
                break;

            case 'UPDATE':
                // Only index if it's active or became active
                if (record.status === 'active') {
                    await SearchSync.indexTrack(record);
                } else if (old_record && old_record.status === 'active' && record.status !== 'active') {
                    // If it was active and now isn't (e.g. suspended), remove it
                    await SearchSync.deleteTrack(record.id);
                }
                break;

            case 'DELETE':
                await SearchSync.deleteTrack(old_record.id);
                break;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
