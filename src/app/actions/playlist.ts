'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';
import { getSignedUrlWrapper } from '@/lib/services/s3';

export interface Playlist {
    id: string;
    tenant_id: string;
    name: string;
    description: string | null;
    created_by: string | null;
    created_at: string;
    item_count?: number;
}

export interface PlaylistItem {
    id: string;
    playlist_id: string;
    track_id: string;
    position: number;
    track?: {
        id: string;
        title: string;
        artist: string;
        duration_sec: number;
        cover_image_url: string;
    };
}

export async function getPlaylists_Action(tenantId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('playlists')
        .select(`
            *,
            items:playlist_items(count)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }

    return data.map((p: any) => ({
        ...p,
        item_count: p.items?.[0]?.count || 0
    })) as Playlist[];
}

export async function searchPlaylists_Action(query: string, userId: string) {
    try {
        const supabase = await createClient();

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', userId)
            .single();

        if (!profile?.tenant_id) return [];

        const { data, error } = await supabase
            .from('playlists')
            .select(`
                *,
                items:playlist_items(count)
            `)
            .eq('tenant_id', profile.tenant_id)
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false })
            .limit(12);

        if (error) {
            console.error('[playlist] Error searching playlists:', error);
            return [];
        }

        return data.map((p: any) => ({
            ...p,
            item_count: p.items?.[0]?.count || 0
        })) as Playlist[];
    } catch (e) {
        console.error('[playlist] Critical error in searchPlaylists_Action:', e);
        return [];
    }
}

export async function createPlaylist_Action(data: {
    tenantId: string;
    name: string;
    description?: string;
    userId: string;
}) {
    const supabase = await createClient();

    const { data: newPlaylist, error } = await supabase
        .from('playlists')
        .insert({
            tenant_id: data.tenantId,
            name: data.name,
            description: data.description,
            created_by: data.userId
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/playlists');
    return newPlaylist;
}
export async function deletePlaylist_Action(playlistId: string) {
    const supabase = await createClient();

    try {
        // 1. Delete associated tracks to prevent foreign key constraint violations
        const { error: itemsError } = await supabase
            .from('playlist_items')
            .delete()
            .eq('playlist_id', playlistId);

        if (itemsError) {
            console.error('Error deleting playlist items:', itemsError);
            throw new Error(itemsError.message);
        }

        // 2. Delete the playlist itself
        const { error } = await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistId);

        if (error) {
            console.error('Error deleting playlist:', error);
            throw new Error(error.message);
        }

        revalidatePath('/dashboard/playlists');
        revalidatePath(`/dashboard/playlists/${playlistId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Failed to delete playlist:', e);
        throw e;
    }
}

export async function updatePlaylist_Action(playlistId: string, data: { name?: string, description?: string }) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('playlists')
        .update({
            name: data.name,
            description: data.description
        })
        .eq('id', playlistId);

    if (error) {
        console.error('Error updating playlist:', error);
        throw new Error(error.message);
    }

    revalidatePath('/dashboard/playlists');
    revalidatePath(`/dashboard/playlists/${playlistId}`);
    return { success: true };
}
export async function getPlaylistDetails_Action(playlistId: string) {
    if (!playlistId || playlistId === 'undefined') {
        throw new Error('Playlist ID is required');
    }

    try {
        const supabase = await createClient();

        // Fetch Playlist Info
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw new Error(playlistError.message);

        // Fetch Items with Track Data
        const { data: items, error: itemsError } = await supabase
            .from('playlist_items')
            .select(`
                *,
                track:tracks(
                    id,
                    title,
                    artist,
                    duration_sec,
                    cover_image_url,
                    bpm,
                    genre,
                    lyrics,
                    metadata,
                    track_files (
                        s3_key,
                        file_type,
                        tuning
                    )
                )
            `)
            .eq('playlist_id', playlistId)
            .order('position', { ascending: true });

        if (itemsError) throw new Error(itemsError.message);

        const processedItems = await Promise.all(items.map(async (item: any) => {
            if (item.track) {
                // 1. Sign Cover Image
                if (item.track.cover_image_url && !item.track.cover_image_url.startsWith('http')) {
                    try {
                        item.track.cover_image_url = await getSignedUrlWrapper(item.track.cover_image_url);
                    } catch (e) {
                        console.error(`[playlist] Failed to sign cover image ${item.track.id}:`, e);
                    }
                }

                // 2. Sign and Extract Audio Source
                const files = (item.track.track_files as unknown as { file_type: string, s3_key: string, tuning: string }[]) || [];
                const streamFiles = files.filter((f) => f.file_type === 'stream_aac' || f.file_type === 'stream_mp3');

                let defaultSrc = '';
                const availableTunings: Record<string, string> = {};

                for (const file of streamFiles) {
                    try {
                        const url = await getSignedUrlWrapper(file.s3_key);
                        if (file.tuning) {
                            availableTunings[file.tuning] = url;
                            if (file.tuning === '440hz') defaultSrc = url;
                        }
                    } catch (e) {
                        console.error(`[playlist] Failed to sign URL for file ${file.s3_key}`, e);
                    }
                }

                if (!defaultSrc) {
                    const anyStream = Object.values(availableTunings)[0];
                    if (anyStream) defaultSrc = anyStream;
                }

                if (!defaultSrc) {
                    const rawFile = files.find((f) => f.file_type === 'raw');
                    if (rawFile) {
                        try {
                            defaultSrc = await getSignedUrlWrapper(rawFile.s3_key);
                        } catch { }
                    }
                }

                item.track.src = defaultSrc;

                // Serialization safe metadata
                if (item.track.metadata) {
                    item.track.metadata = JSON.parse(JSON.stringify(item.track.metadata));
                }
            }
            return JSON.parse(JSON.stringify(item)); // Deep clone to be serializable
        }));

        return {
            playlist: JSON.parse(JSON.stringify(playlist)),
            items: processedItems
        };
    } catch (e: any) {
        console.error('[playlist] Error in getPlaylistDetails_Action:', e);
        throw e;
    }
}

export async function addTrackToPlaylist_Action(playlistId: string, trackId: string) {
    const supabase = await createClient();

    // Get current max position
    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

    const nextPosition = (maxPosData?.position || 0) + 1;

    const { error } = await supabase
        .from('playlist_items')
        .insert({
            playlist_id: playlistId,
            track_id: trackId,
            position: nextPosition
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/playlists/${playlistId}`);
}

export async function removeTrackFromPlaylist_Action(itemId: string, playlistId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('id', itemId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/playlists/${playlistId}`);
}
export async function reorderPlaylistTracks_Action(playlistId: string, orderedItemIds: string[]) {
    const supabase = await createClient();

    // Perform updates sequentially to ensure correctness and avoid constraint issues with bulk upsert
    for (let i = 0; i < orderedItemIds.length; i++) {
        const { error } = await supabase
            .from('playlist_items')
            .update({ position: i + 1 })
            .eq('id', orderedItemIds[i])
            .eq('playlist_id', playlistId);

        if (error) {
            console.error(`Error updating position for item ${orderedItemIds[i]}:`, error);
            throw new Error(error.message);
        }
    }

    revalidatePath(`/dashboard/playlists/${playlistId}`);
    return { success: true };
}

export async function addTracksToPlaylist_Action(playlistId: string, trackIds: string[]) {
    const supabase = await createClient();

    // Get current max position
    const { data: maxPosData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

    let nextPosition = (maxPosData?.position || 0) + 1;

    const items = trackIds.map((trackId, index) => ({
        playlist_id: playlistId,
        track_id: trackId,
        position: nextPosition + index
    }));

    const { error } = await supabase
        .from('playlist_items')
        .insert(items);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/playlists/${playlistId}`);
    return { success: true };
}
