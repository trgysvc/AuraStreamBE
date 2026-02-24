import { createClient } from '@/lib/db/server';
import { redirect, notFound } from 'next/navigation';
import { getPlaylistDetails_Action } from '@/app/actions/playlist';
import { PlaylistEditorClient } from '@/components/dashboard/PlaylistEditorClient';

export default async function PlaylistEditPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    try {
        const { playlist, items } = await getPlaylistDetails_Action(params.id);

        // Fetch some tracks for the search supply panel
        const { data: tracks } = await supabase
            .from('tracks')
            .select('id, title, artist, duration_sec, cover_image_url')
            .limit(20)
            .order('popularity_score', { ascending: false });

        return (
            <div className="h-full">
                <PlaylistEditorClient
                    playlist={playlist}
                    initialItems={items as any}
                    allTracks={(tracks || []) as any}
                />
            </div>
        );
    } catch (error) {
        console.error('Error loading playlist editor:', error);
        return notFound();
    }
}
