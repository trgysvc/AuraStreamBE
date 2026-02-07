import { createAdminClient } from '@/lib/db/admin-client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createAdminClient();

    const { data: tracks, error } = await supabase
        .from('tracks')
        .select(`
            id, 
            title, 
            status, 
            created_at,
            track_files (
                id, s3_key, file_type
            )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ count: tracks.length, tracks });
}
