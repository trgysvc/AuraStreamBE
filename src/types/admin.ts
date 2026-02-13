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
    artist: string;
    bpm: number;
    duration_sec: number;
    key: string;
    status: string;
    genre: string;
    mood_tags: string[];
    cover_image_url?: string;
    popularity_score?: number;
    created_at: string;
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
