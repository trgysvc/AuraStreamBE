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
    "deep house": {
        venue_tags: ["Cocktail Bar", "Lounge & Bar", "Rooftop / Terrace"],
        vibe_tags: ["Chill", "Smooth", "Sexy"],
        character_tags: ["Synthetic", "Minimal"],
        theme_tags: ["Fashion"]
    },
    "jazz": {
        venue_tags: ["Fine Dining", "Hotel Lobby", "Bistro & Brasserie", "Cocktail Bar"],
        vibe_tags: ["Smooth", "Relaxing", "Peaceful"],
        character_tags: ["Acoustic"],
        theme_tags: ["Corporate"]
    },
    "acid jazz": {
        venue_tags: ["Cocktail Bar", "Lounge & Bar"],
        vibe_tags: ["Cool Jazz", "Laid Back"],
        character_tags: ["Acoustic", "Synthetic"]
    },
    "ambient": {
        venue_tags: ["Spa & Massage", "Hotel Lobby", "Showroom / Gallery", "Yoga & Pilates"],
        vibe_tags: ["Dreamy", "Peaceful", "Relaxing", "Focus"],
        character_tags: ["Minimal", "Synthetic"],
        theme_tags: ["Cinematic", "Sci-Fi"]
    },
    "lo-fi hip hop": {
        venue_tags: ["Coffee Shop", "Coworking Space", "Streetwear Store"],
        vibe_tags: ["Chill", "Laid Back", "Focus"],
        character_tags: ["Percussive", "Minimal"],
        theme_tags: ["Vlog"]
    },
    "classical": {
        venue_tags: ["Fine Dining", "Showroom / Gallery", "Hotel Lobby"],
        vibe_tags: ["Peaceful", "Epic", "Romantic"],
        character_tags: ["Acoustic", "Orchestral"],
        theme_tags: ["Cinematic"]
    },
    "techno": {
        venue_tags: ["Gym & CrossFit", "Streetwear Store"],
        vibe_tags: ["Busy & Frantic", "Workout", "Dark"],
        character_tags: ["Synthetic", "Minimal"],
        theme_tags: ["Sci-Fi"]
    },
    "corporate": {
        venue_tags: ["Corporate Office", "Coworking Space", "Showroom / Gallery"],
        vibe_tags: ["Focus", "Hopeful", "Euphoric"],
        character_tags: ["Minimal"],
        theme_tags: ["Corporate"]
    },
    "acoustic": {
        venue_tags: ["Coffee Shop", "Bistro & Brasserie", "Hotel Lobby"],
        vibe_tags: ["Peaceful", "Chill", "Romantic"],
        character_tags: ["Acoustic"],
        theme_tags: ["Travel", "Vlog"]
    },
    "rock": {
        venue_tags: ["Gym & CrossFit", "Fast Casual", "Cocktail Bar"],
        vibe_tags: ["Epic", "Angry", "Workout"],
        character_tags: ["Acoustic", "Percussive"],
        theme_tags: ["Action"]
    },
    "funk": {
        venue_tags: ["Cocktail Bar", "Bistro & Brasserie", "Lounge & Bar"],
        vibe_tags: ["Happy", "Euphoric", "Sexy"],
        character_tags: ["Acoustic", "Percussive"],
        theme_tags: ["Fashion"]
    },
    "bossa nova": {
        venue_tags: ["Coffee Shop", "Fine Dining", "Hotel Lobby"],
        vibe_tags: ["Chill", "Smooth", "Peaceful"],
        character_tags: ["Acoustic"]
    },
    "industrial": {
        venue_tags: ["Showroom / Gallery", "Streetwear Store"],
        vibe_tags: ["Dark", "Mysterious", "Suspense"],
        character_tags: ["Synthetic", "Percussive"],
        theme_tags: ["Sci-Fi"]
    },
    "neoclassical": {
        venue_tags: ["Hotel Lobby", "Spa & Massage", "Fine Dining"],
        vibe_tags: ["Sentimental", "Dreamy", "Melancholic"],
        character_tags: ["Orchestral", "Acoustic"],
        theme_tags: ["Cinematic"]
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
    "dinner": { venue_tags: ["Fine Dining", "Bistro & Brasserie"], vibe_tags: ["Smooth"] },
    "night": { vibe_tags: ["Dark", "Mysterious"], venue_tags: ["Cocktail Bar"] },
    "morning": { vibe_tags: ["Hopeful", "Peaceful"], venue_tags: ["Coffee Shop"] },
    "dreamy": { vibe_tags: ["Dreamy", "Peaceful"], character_tags: ["Minimal"] },
    "epic": { vibe_tags: ["Epic", "Euphoric"], character_tags: ["Orchestral"], theme_tags: ["Cinematic"] },
    "lo-fi": { vibe_tags: ["Chill", "Focus"], venue_tags: ["Coffee Shop", "Coworking Space"] },
    "industrial": { character_tags: ["Synthetic", "Percussive"], vibe_tags: ["Dark"] },
    "rustic": { character_tags: ["Acoustic"], vibe_tags: ["Sentimental"] },
    "minimal": { character_tags: ["Minimal"], vibe_tags: ["Focus"] },
    "noir": { vibe_tags: ["Mysterious", "Dark", "Smooth"], theme_tags: ["Sci-Fi"] },
    "synth": { character_tags: ["Synthetic"], vibe_tags: ["Epic"] },
    "steampunk": { theme_tags: ["Sci-Fi"], character_tags: ["Percussive", "Synthetic"] },
    "bossa": { venue_tags: ["Coffee Shop", "Hotel Lobby"], vibe_tags: ["Smooth"] }
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

        // Normalization & Smart Splitting
        const normalize = (s: string) => s.toLowerCase().trim();
        const splitTags = (s: string) => s.split(/[,\/&|]/).map(normalize).filter(Boolean);

        const titleTokens = splitTags(metadata.title);
        const artistTokens = splitTags(metadata.artist);
        const genreTokens = splitTags(metadata.genre);
        const subGenreTokens = (metadata.sub_genres || []).flatMap(splitTags);

        const allTokens = Array.from(new Set([
            ...titleTokens,
            ...artistTokens,
            ...genreTokens,
            ...subGenreTokens
        ]));

        const searchString = allTokens.join(' ');

        // 1. Genre Based Mapping (Case-Insensitive)
        allTokens.forEach(token => {
            if (GENRE_MAP[token]) {
                const map = GENRE_MAP[token];
                if (map.vibe_tags) result.vibe_tags.push(...map.vibe_tags);
                if (map.theme_tags) result.theme_tags.push(...map.theme_tags);
                if (map.character_tags) result.character_tags.push(...map.character_tags);
                if (map.venue_tags) result.venue_tags.push(...map.venue_tags);
            }
        });

        // 2. Keyword Based Mapping (Check if keyword exists in any token or searchString)
        Object.keys(KEYWORD_MAP).forEach(kw => {
            if (searchString.includes(kw)) {
                const map = KEYWORD_MAP[kw];
                if (map.vibe_tags) result.vibe_tags.push(...map.vibe_tags);
                if (map.theme_tags) result.theme_tags.push(...map.theme_tags);
                if (map.character_tags) result.character_tags.push(...map.character_tags);
                if (map.venue_tags) result.venue_tags.push(...map.venue_tags);
            }
        });

        // Final result cleanup
        return {
            vibe_tags: Array.from(new Set(result.vibe_tags)).slice(0, 5),
            theme_tags: Array.from(new Set(result.theme_tags)).slice(0, 5),
            character_tags: Array.from(new Set(result.character_tags)).slice(0, 5),
            venue_tags: Array.from(new Set(result.venue_tags)).slice(0, 5),
            sub_genres: Array.from(new Set(allTokens)).slice(0, 10)
        };
    }
}
