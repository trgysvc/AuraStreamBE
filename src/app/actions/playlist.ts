'use server'

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

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

export async function getPlaylistDetails_Action(playlistId: string) {
    if (!playlistId || playlistId === 'undefined') {
        throw new Error('Playlist ID is required');
    }
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
                cover_image_url
            )
        `)
        .eq('playlist_id', playlistId)
        .order('position', { ascending: true });

    if (itemsError) throw new Error(itemsError.message);

    return { playlist, items };
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
