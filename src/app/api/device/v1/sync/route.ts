
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/db/admin-client';

// Define types for the response
interface SyncResponse {
    success: boolean;
    timestamp: string;
    config?: {
        venue_id: string;
        venue_name: string;
        schedule_id: string;
        schedule_name: string;
        volume_limit: number;
    };
    playlist?: {
        id: string;
        name: string;
        items: PlaylistItem[];
    };
    error?: string;
}

interface PlaylistItem {
    id: string; // track_id
    title: string;
    artist: string;
    file_url: string;
    file_hash: string;
    duration: number;
    tuning_freq: string; // e.g., "440hz"
}

export async function POST(req: NextRequest) {
    const supabase = createAdminClient();

    // 1. Extract Headers
    const hardwareId = req.headers.get('x-hardware-id');
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!hardwareId || !authToken) {
        return NextResponse.json({ success: false, error: 'Missing authentication headers' }, { status: 401 });
    }

    try {
        // 2. Authenticate Device
        const { data: device, error: deviceError } = await supabase
            .from('devices')
            .select('id, tenant_id, venue_id, status:sync_status, auth_token')
            .eq('hardware_id', hardwareId)
            .single();

        if (deviceError || !device) {
            console.error('Device Auth Error:', deviceError);
            return NextResponse.json({ success: false, error: 'Device not found or invalid' }, { status: 403 });
        }

        // Verify token (In production, use bcrypt compare. Here we assume simple connection since it's an MVP migration)
        if (device.auth_token !== authToken) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 });
        }

        // 3. Update Heartbeat
        const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip');

        await supabase
            .from('devices')
            .update({
                last_heartbeat: new Date().toISOString(),
                ip_address: ipAddress
            })
            .eq('id', device.id);

        // 4. Get Active Schedule
        // Logic: Find the highest priority schedule for this venue that includes "now"
        const now = new Date();
        const currentTime = now.toTimeString().split(' ')[0];
        const currentDay = now.getDay(); // 0 = Sunday

        if (!device.venue_id) {
            return NextResponse.json({
                success: true,
                timestamp: now.toISOString(),
                error: 'Device not assigned to a venue'
            });
        }

        const { data: schedule, error: scheduleError } = await supabase
            .from('venue_schedules')
            .select('id, name, playlist_id') // playlist_id is new
            .eq('venue_id', device.venue_id)
            .lte('start_time', currentTime)
            .gte('end_time', currentTime)
            .contains('day_of_week', [currentDay])
            .order('priority', { ascending: false }) // priority is new
            .limit(1)
            .single();

        // If no schedule found, return empty config (Silence)
        if (scheduleError || !schedule || !schedule.playlist_id) {
            return NextResponse.json({
                success: true,
                timestamp: now.toISOString(),
                message: 'No active schedule found'
            });
        }

        // 5. Fetch Playlist & Items
        const { data: playlistItems, error: itemsError } = await supabase
            .from('playlist_items')
            .select(`
            track:tracks (
                id,
                title,
                artist,
                duration_sec,
                track_files (
                    s3_key,
                    file_type,
                    tuning,
                    file_hash
                )
            )
        `)
            .eq('playlist_id', schedule.playlist_id)
            .order('position', { ascending: true });

        if (itemsError) {
            console.error('Playlist Fetch Error:', itemsError);
            return NextResponse.json({ success: false, error: 'Failed to fetch playlist' }, { status: 500 });
        }

        // 6. Transform for Device
        // Currently, we'll just mock the URL signing or use a helper if available. 
        // Since S3 signing is complex, we assume the helper `S3Service` is available or we return keys for client to sign if possible.
        // For now, let's return a simplified structure.

        // Note: In a real implementation, we would call S3Service.getDownloadUrl() here for each item.
        // To keep this response fast, we might want to return pre-signed URLs or have the device request them individually.
        // For the "Starbucks" store-and-forward model, the device downloads files.

        const validItems: PlaylistItem[] = [];

        if (playlistItems) {
            for (const item of playlistItems) {
                // Supabase join returns an array or object depending on relation, cast to any to simplify for MVP
                const track = (item as any).track;
                if (!track) continue;

                // handle cases where track might be an array (if schema is interpreted differently)
                const actualTrack = Array.isArray(track) ? track[0] : track;
                if (!actualTrack) continue;

                const files = actualTrack.track_files || [];
                const bestFile = files.find((f: any) => f.file_type === 'stream_aac' && f.tuning === '440hz')
                    || files.find((f: any) => f.file_type === 'stream_aac')
                    || files[0];

                if (bestFile) {
                    validItems.push({
                        id: actualTrack.id,
                        title: actualTrack.title,
                        artist: actualTrack.artist,
                        file_url: `https://cdn.aurastream.com/${bestFile.s3_key}`, // Placeholder
                        file_hash: bestFile.file_hash || 'pending',
                        duration: actualTrack.duration_sec,
                        tuning_freq: bestFile.tuning || '440hz'
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            config: {
                venue_id: device.venue_id,
                venue_name: "Venue Name Lookup Todo",
                schedule_id: schedule.id,
                schedule_name: schedule.name,
                volume_limit: 100
            },
            playlist: {
                id: schedule.playlist_id,
                name: "Associated Playlist Name Todo",
                items: validItems
            }
        });

    } catch (err: any) {
        console.error('Sync API Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
