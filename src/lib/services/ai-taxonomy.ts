/**
 * AuraStream AI Taxonomy Service
 * Phase 1: Heuristic Keyword Mapping
 * This service predicts Sonic Taxonomy tags based on track metadata (genre, sub-genres, lyrics, etc.)
 */

export interface TaxonomyPrediction {
    vibe_tags: string[];
    theme_tags: string[];
    character_tags: string[];
    venue_tags: string[];
    sub_genres: string[];
}

const GENRE_MAP: Record<string, Partial<TaxonomyPrediction>> = {
    "Deep House": {
        venue_tags: ["Cocktail Bar", "Lounge & Bar", "Rooftop / Terrace"],
        vibe_tags: ["Chill", "Smooth", "Sexy"],
        character_tags: ["Synthetic", "Minimal"],
        theme_tags: ["Fashion"]
    },
    "Jazz": {
        venue_tags: ["Fine Dining", "Hotel Lobby", "Bistro & Brasserie", "Cocktail Bar"],
        vibe_tags: ["Smooth", "Relaxing", "Peaceful"],
        character_tags: ["Acoustic"],
        theme_tags: ["Corporate"]
    },
    "Acid Jazz": {
        venue_tags: ["Cocktail Bar", "Lounge & Bar"],
        vibe_tags: ["Cool Jazz", "Laid Back"],
        character_tags: ["Acoustic", "Synthetic"]
    },
    "Ambient": {
        venue_tags: ["Spa & Massage", "Hotel Lobby", "Showroom / Gallery", "Yoga & Pilates"],
        vibe_tags: ["Dreamy", "Peaceful", "Relaxing", "Focus"],
        character_tags: ["Minimal", "Synthetic"],
        theme_tags: ["Cinematic", "Sci-Fi"]
    },
    "Lo-fi Hip Hop": {
        venue_tags: ["Coffee Shop", "Coworking Space", "Streetwear Store"],
        vibe_tags: ["Chill", "Laid Back", "Focus"],
        character_tags: ["Percussive", "Minimal"],
        theme_tags: ["Vlog"]
    },
    "Classical": {
        venue_tags: ["Fine Dining", "Showroom / Gallery", "Hotel Lobby"],
        vibe_tags: ["Peaceful", "Epic", "Romantic"],
        character_tags: ["Acoustic", "Orchestral"],
        theme_tags: ["Cinematic"]
    },
    "Techno": {
        venue_tags: ["Gym & CrossFit", "Streetwear Store"],
        vibe_tags: ["Busy & Frantic", "Workout", "Dark"],
        character_tags: ["Synthetic", "Minimal"],
        theme_tags: ["Sci-Fi"]
    },
    "Corporate": {
        venue_tags: ["Corporate Office", "Coworking Space", "Showroom / Gallery"],
        vibe_tags: ["Focus", "Hopeful", "Euphoric"],
        character_tags: ["Minimal"],
        theme_tags: ["Corporate"]
    },
    "Acoustic": {
        venue_tags: ["Coffee Shop", "Bistro & Brasserie", "Hotel Lobby"],
        vibe_tags: ["Peaceful", "Chill", "Romantic"],
        character_tags: ["Acoustic"],
        theme_tags: ["Travel", "Vlog"]
    },
    "Rock": {
        venue_tags: ["Gym & CrossFit", "Fast Casual", "Cocktail Bar"],
        vibe_tags: ["Epic", "Angry", "Workout"],
        character_tags: ["Acoustic", "Percussive"],
        theme_tags: ["Action"]
    }
};

const KEYWORD_MAP: Record<string, Partial<TaxonomyPrediction>> = {
    "cinematic": { theme_tags: ["Cinematic"], vibe_tags: ["Epic"] },
    "workout": { vibe_tags: ["Workout"], venue_tags: ["Gym & CrossFit"] },
    "relax": { vibe_tags: ["Relaxing", "Chill"], venue_tags: ["Spa & Massage"] },
    "luxury": { venue_tags: ["Luxury Boutique", "Hotel Lobby"], theme_tags: ["Fashion"] },
    "dark": { vibe_tags: ["Dark", "Scary", "Suspense"], theme_tags: ["Sci-Fi"] },
    "happy": { vibe_tags: ["Happy", "Euphoric", "Hopeful"] },
    "office": { venue_tags: ["Corporate Office", "Coworking Space"], vibe_tags: ["Focus"] },
    "dinner": { venue_tags: ["Fine Dining", "Bistro & Brasserie"], vibe_tags: ["Smooth"] }
};

export class AITaxonomyService {
    /**
     * Heuristic-based tag prediction.
     * Analyzes genre, title, and artist to suggest Sonic Taxonomy tags.
     */
    static predictTags(metadata: {
        title: string;
        artist: string;
        genre: string;
        sub_genres?: string[];
    }): TaxonomyPrediction {
        const result: TaxonomyPrediction = {
            vibe_tags: [],
            theme_tags: [],
            character_tags: [],
            venue_tags: [],
            sub_genres: metadata.sub_genres || []
        };

        const searchString = `${metadata.title} ${metadata.artist} ${metadata.genre} ${result.sub_genres.join(' ')}`.toLowerCase();

        // 1. Genre Based Mapping
        const relevantGenres = [metadata.genre, ...result.sub_genres];
        relevantGenres.forEach(g => {
            if (GENRE_MAP[g]) {
                const map = GENRE_MAP[g];
                if (map.vibe_tags) result.vibe_tags.push(...map.vibe_tags);
                if (map.theme_tags) result.theme_tags.push(...map.theme_tags);
                if (map.character_tags) result.character_tags.push(...map.character_tags);
                if (map.venue_tags) result.venue_tags.push(...map.venue_tags);
            }
        });

        // 2. Keyword Based Mapping
        Object.keys(KEYWORD_MAP).forEach(kw => {
            if (searchString.includes(kw)) {
                const map = KEYWORD_MAP[kw];
                if (map.vibe_tags) result.vibe_tags.push(...map.vibe_tags);
                if (map.theme_tags) result.theme_tags.push(...map.theme_tags);
                if (map.character_tags) result.character_tags.push(...map.character_tags);
                if (map.venue_tags) result.venue_tags.push(...map.venue_tags);
            }
        });

        // Unique results
        return {
            vibe_tags: Array.from(new Set(result.vibe_tags)).slice(0, 5),
            theme_tags: Array.from(new Set(result.theme_tags)).slice(0, 5),
            character_tags: Array.from(new Set(result.character_tags)).slice(0, 5),
            venue_tags: Array.from(new Set(result.venue_tags)).slice(0, 5),
            sub_genres: Array.from(new Set(result.sub_genres)).slice(0, 10)
        };
    }
}
