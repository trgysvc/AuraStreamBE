'use server'

import { createClient } from '@/lib/db/server';

export async function searchTracks_Action(query: string, limit: number = 20) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tracks')
        .select('id, title, artist, duration_sec, cover_image_url')
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(limit)
        .order('popularity_score', { ascending: false });

    if (error) {
        console.error('Error searching tracks:', error);
        return [];
    }

    return data;
}

export async function toggleLikeTrack_Action(trackId: string, userId: string, tenantId?: string) {
    const supabase = await createClient();
    console.log(`[toggleLikeTrack] trackId: ${trackId}, userId: ${userId}, tenantId: ${tenantId}`);

    try {
        // 1. Check if like exists
        const { data: existingLike, error: checkError } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('track_id', trackId)
            .maybeSingle();

        if (checkError) {
            console.error('[toggleLikeTrack] Check Error:', checkError);
            throw new Error(`DB Check Error: ${checkError.message}`);
        }

        if (existingLike) {
            // Remove like
            const { error: deleteError } = await supabase
                .from('likes')
                .delete()
                .eq('id', existingLike.id);

            if (deleteError) {
                console.error('[toggleLikeTrack] Delete Error:', deleteError);
                throw new Error(`DB Delete Error: ${deleteError.message}`);
            }

            return { liked: false };
        } else {
            // Add like
            const { error: insertError } = await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    track_id: trackId
                });

            if (insertError) {
                console.error('[toggleLikeTrack] Insert Error:', insertError);
                throw new Error(`DB Insert Error: ${insertError.message}`);
            }

            // 2. Auto-Playlist Logic: "Liked Songs"
            if (tenantId) {
                try {
                    // Find or Create "Liked Songs" playlist
                    let { data: likedPlaylist, error: playlistFetchError } = await supabase
                        .from('playlists')
                        .select('id')
                        .eq('tenant_id', tenantId)
                        .eq('name', 'Liked Songs')
                        .maybeSingle();

                    if (playlistFetchError) {
                        console.warn('[toggleLikeTrack] Playlist Fetch Error (non-fatal):', playlistFetchError);
                    }

                    if (!likedPlaylist) {
                        const { data: newPlaylist, error: createError } = await supabase
                            .from('playlists')
                            .insert({
                                tenant_id: tenantId,
                                name: 'Liked Songs',
                                description: 'Your favorite tracks, automatically collected here.',
                                created_by: userId
                            })
                            .select()
                            .single();

                        if (createError) {
                            console.error('[toggleLikeTrack] Error creating Liked Songs playlist:', createError);
                        } else {
                            likedPlaylist = newPlaylist;
                        }
                    }

                    if (likedPlaylist) {
                        // Add track to playlist (Check if already there first to avoid duplicates)
                        const { data: existingItem } = await supabase
                            .from('playlist_items')
                            .select('id')
                            .eq('playlist_id', likedPlaylist.id)
                            .eq('track_id', trackId)
                            .maybeSingle();

                        if (!existingItem) {
                            // Get next position
                            const { data: maxPosData } = await supabase
                                .from('playlist_items')
                                .select('position')
                                .eq('playlist_id', likedPlaylist.id)
                                .order('position', { ascending: false })
                                .limit(1)
                                .maybeSingle();

                            const nextPos = (maxPosData?.position || 0) + 1;

                            await supabase
                                .from('playlist_items')
                                .insert({
                                    playlist_id: likedPlaylist.id,
                                    track_id: trackId,
                                    position: nextPos
                                });
                        }
                    }
                } catch (playlistErr) {
                    console.error('[toggleLikeTrack] Internal Auto-playlist Error:', playlistErr);
                }
            }

            return { liked: true };
        }
    } catch (err: any) {
        console.error('[toggleLikeTrack] Global Catch:', err);
        throw err; // Re-throw to trigger 500 but with log info
    }
}

export async function isTrackLiked_Action(trackId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return false;
    }

    return !!data;
}

export async function getUserLikedTracks_Action(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('likes')
        .select(`
            track:tracks (
                id,
                title,
                artist,
                duration_sec,
                cover_image_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching liked tracks:', error);
        return [];
    }

    return data.map(item => (item.track as unknown as any));
}
