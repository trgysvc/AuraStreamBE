'use server'

import { createClient } from '@/lib/db/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { AITaxonomyService, TaxonomyPrediction } from '@/lib/services/ai-taxonomy';
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Updates comprehensive track metadata including the new Sonaraura Taxonomy.
 */
export async function updateTrackMetadata_Action(trackId: string, data: {
    title?: string;
    artist?: string;
    bpm?: number;
    key?: string;
    genre?: string;
    sub_genres?: string[];
    mood_tags?: string[];
    theme_tags?: string[];
    character_tags?: string[];
    venue_tags?: string[];
    vibe_tags?: string[];
    vocal_type?: string;
    is_instrumental?: boolean;
    popularity_score?: number;
    lyrics?: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tracks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', trackId);

    if (error) {
        console.error('Metadata Update Error:', error);
        throw error;
    }

    revalidatePath('/admin/catalog');
    return { success: true };
}

/**
 * Permanently deletes a track and its associated file records.
 * Also cleans up any foreign key references (playback_sessions, playlist_items, likes, etc.)
 */
export async function deleteTrack_Action(trackId: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Missing Supabase environment variables');
    }

    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        }
    );

    await supabaseAdmin.from('playback_sessions').delete().eq('track_id', trackId);
    await supabaseAdmin.from('playlist_items').delete().eq('track_id', trackId);
    await supabaseAdmin.from('likes').delete().eq('track_id', trackId);
    await supabaseAdmin.from('track_reviews').delete().eq('track_id', trackId);
    await supabaseAdmin.from('track_files').delete().eq('track_id', trackId);
    await supabaseAdmin.from('licenses').delete().eq('track_id', trackId);
    await supabaseAdmin.from('custom_requests').update({ delivery_track_id: null } as any).eq('delivery_track_id', trackId);

    const { error } = await supabaseAdmin
        .from('tracks')
        .delete()
        .eq('id', trackId);

    if (error) {
        console.error('Delete Track Error:', error);
        throw error;
    }

    revalidatePath('/admin/catalog');
    return { success: true };
}

/**
 * Enhanced AutoTag Logic using a Hybrid Approach (Gemini + Heuristics).
 * Securely handles errors and ensures data is never wiped if AI fails.
 */
export async function autoTagTrack_Action(trackId: string, options?: { previewOnly?: boolean }) {
    const supabase = await createClient();

    const { data: track, error: fetchError } = await supabase
        .from('tracks')
        .select('title, artist, genre, sub_genres, vibe_tags, theme_tags, character_tags, venue_tags, ai_metadata')
        .eq('id', trackId)
        .single();

    if (fetchError || !track) {
        throw new Error('Track not found');
    }

    const currentData = {
        genre: track.genre || 'Ambient',
        vibe_tags: track.vibe_tags || [],
        theme_tags: track.theme_tags || [],
        character_tags: track.character_tags || [],
        venue_tags: track.venue_tags || [],
        sub_genres: track.sub_genres || []
    };

    let predictions: TaxonomyPrediction & { genre?: string };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key missing');

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const aiMetadata = track.ai_metadata as any;
        const promptContext = aiMetadata?.prompt || aiMetadata?.tags || '';
        
        const systemPrompt = `
            You are Aura AI, a professional music curator for the Sonaraura Ecosystem.
            Your goal is to validate and refine track metadata.

            Current Data:
            - Title: ${track.title}
            - Artist: ${track.artist}
            - Assigned Genre: ${track.genre || 'None'}
            - Production Context: ${promptContext}

            Instructions:
            1. GENRE VALIDATION: The "Assigned Genre" usually comes from the file's ID3 tags. 
               - If the Assigned Genre is specific and accurate, KEEP IT.
               - If it is generic (e.g., "Other", "Unknown") or clearly mismatched based on the Production Context, suggest a more accurate Primary Genre.
            2. TAGGING: Select the best tags from the lists below based on the track's vibe and context.
            
            Available Vibe Tags: Angry, Busy & Frantic, Chill, Dark, Dreamy, Epic, Euphoric, Focus, Happy, Hopeful, Laid Back, Melancholic, Mysterious, Peaceful, Quirky, Relaxing, Romantic, Sad, Scary, Sentimental, Sexy, Smooth, Sneaking, Suspense, Weird, Workout.
            Available Theme Tags: Cinematic, Corporate, Vlog, Fashion, Sci-Fi, Travel.
            Available Character Tags: Acoustic, Synthetic, Percussive, Minimal, Orchestral.
            Available Venue Tags: Hotel Lobby, Lounge & Bar, Rooftop / Terrace, Airport / Lounge, Coffee Shop, Fine Dining, Bistro & Brasserie, Cocktail Bar, Fast Casual, Luxury Boutique, Streetwear Store, Shopping Mall, Showroom / Gallery, Spa & Massage, Yoga & Pilates, Gym & CrossFit, Hair Salon / Barber, Coworking Space, Corporate Office.

            Return ONLY a valid JSON object:
            {
                "genre": "Refined or Existing Genre",
                "vibe_tags": ["tag1", "tag2"],
                "theme_tags": ["tag1"],
                "character_tags": ["tag1"],
                "venue_tags": ["tag1"],
                "sub_genres": ["tag1", "tag2"]
            }
        `;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
            predictions = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Invalid AI response format');
        }
    } catch (e) {
        console.warn('Gemini AI failed/skipped, falling back to Heuristics:', e instanceof Error ? e.message : 'Unknown Error');
        predictions = AITaxonomyService.predictTags({
            title: track.title || '',
            artist: track.artist || '',
            genre: track.genre || '',
            sub_genres: track.sub_genres || []
        });
    }

    const finalUpdate: any = {
        genre: predictions.genre || currentData.genre,
        vibe_tags: predictions.vibe_tags.length > 0 ? predictions.vibe_tags : currentData.vibe_tags,
        theme_tags: predictions.theme_tags.length > 0 ? predictions.theme_tags : currentData.theme_tags,
        character_tags: predictions.character_tags.length > 0 ? predictions.character_tags : currentData.character_tags,
        venue_tags: predictions.venue_tags.length > 0 ? predictions.venue_tags : currentData.venue_tags,
        sub_genres: predictions.sub_genres.length > 0 ? predictions.sub_genres : currentData.sub_genres,
        updated_at: new Date().toISOString()
    };

    if (options?.previewOnly) {
        return { success: true, predictions: finalUpdate };
    }

    const { error: updateError } = await supabase
        .from('tracks')
        .update(finalUpdate)
        .eq('id', trackId);

    if (updateError) {
        console.error('AutoTag Update Error:', updateError);
        throw updateError;
    }

    revalidatePath('/admin/catalog');
    return { success: true, predictions: finalUpdate };
}

/**
 * Bulk updates the entire active catalog using the AI Ingestion Engine.
 */
export async function batchAutoTagTracks_Action() {
    const supabase = await createClient();

    const { data: tracks, error: fetchError } = await supabase
        .from('tracks')
        .select('id, title, artist, genre, sub_genres')
        .eq('status', 'active');

    if (fetchError || !tracks) {
        throw new Error('Could not fetch catalog');
    }

    const results = { total: tracks.length, updated: 0, errors: 0 };

    await Promise.all(tracks.map(async (track) => {
        try {
            await autoTagTrack_Action(track.id);
            results.updated++;
        } catch (e) {
            console.error(`Error auto-tagging track ${track.id}:`, e);
            results.errors++;
        }
    }));

    revalidatePath('/admin/catalog');
    return { success: true, results };
}

/**
 * One-time action to fix branding consistency.
 */
export async function fixBranding_Action() {
    const supabase = await createClient();
    const { error, count } = await supabase
        .from('tracks')
        .update({ artist: 'Sonaraura Studio' })
        .eq('artist', 'turgaysavaci');

    if (error) throw error;

    revalidatePath('/admin/catalog');
    revalidatePath('/dashboard/venue');
    return { success: true, count };
}
