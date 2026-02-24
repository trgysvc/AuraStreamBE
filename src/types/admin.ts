export interface AdminStats {
    pendingTracks: number;
    totalUsers: number;
    activeVenues: number;
    openDisputes: number;
    totalTracks: number;
    newUsersWeek: number;
}

export interface TrackAsset {
    id: string;
    title: string;
    artist: string | null;
    bpm: number | null;
    duration_sec: number | null;
    key: string | null;
    status: string | null;
    genre: string | null;
    mood_tags: string[] | null;
    cover_image_url: string | null;
    popularity_score: number | null;
    lyrics: string | null;
    created_at: string | null;
    track_files?: any[];
}

export interface DisputeAsset {
    id: string;
    status: 'pending' | 'resolved' | 'rejected';
    video_url: string;
    dispute_text: string;
    created_at: string;
    profiles: {
        email: string;
        full_name?: string;
    };
    licenses: {
        license_key: string;
        project_name: string;
        tracks: {
            title: string;
        };
    };
}
