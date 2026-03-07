import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envPath = '/Users/trgysvc/Developer/AuraStreamBE/.env.local';
const env = {};
if (fs.existsSync(envPath)) {
    const file = fs.readFileSync(envPath, 'utf-8');
    file.split('\n').forEach(line => {
        const [key, ...val] = line.split('=');
        if (key && val) env[key.trim()] = val.join('=').trim();
    });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function calculateAuraScores() {
    console.log('--- Aura Score Engine: Re-calculating global engagement ---');

    // 1. Fetch all tracks and their durations
    const { data: tracks, error: tracksError } = await supabase
        .from('tracks')
        .select('id, duration_sec')
        .eq('status', 'active');

    if (tracksError) throw tracksError;

    // 2. Fetch playback session aggregations (last 30 days for relevance)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessions, error: sessionsError } = await supabase
        .from('playback_sessions')
        .select('track_id, duration_listened, skipped')
        .gte('played_at', thirtyDaysAgo.toISOString());

    if (sessionsError) throw sessionsError;

    // 3. Fetch likes count per track
    const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select('track_id');

    if (likesError) throw likesError;

    const likesMap = {};
    likes.forEach(l => {
        likesMap[l.track_id] = (likesMap[l.track_id] || 0) + 1;
    });

    const sessionsMap = {};
    sessions.forEach(s => {
        if (!sessionsMap[s.track_id]) {
            sessionsMap[s.track_id] = { total: 0, total_duration: 0, skips: 0 };
        }
        sessionsMap[s.track_id].total += 1;
        sessionsMap[s.track_id].total_duration += (s.duration_listened || 0);
        if (s.skipped || s.duration_listened < 10) sessionsMap[s.track_id].skips += 1;
    });

    // 4. Calculate & Update
    for (const track of tracks) {
        const stats = sessionsMap[track.id] || { total: 0, total_duration: 0, skips: 0 };
        const likeCount = likesMap[track.id] || 0;
        
        let score = 0;

        if (stats.total > 0) {
            // Formula: (Avg Listen % * 0.6) + (Like Impact * 0.3) - (Skip Penalty * 0.1)
            const avgListenRatio = Math.min((stats.total_duration / (stats.total * (track.duration_sec || 180))), 1);
            const likeImpact = Math.min(likeCount / (stats.total * 0.1 || 1), 1); // Max impact if 10% of listeners liked it
            const skipPenalty = stats.skips / stats.total;

            score = (avgListenRatio * 0.6) + (likeImpact * 0.3) + ((1 - skipPenalty) * 0.1);
        }

        // Clamp 0-1 and round to 2 decimals
        const finalScore = Math.max(0, Math.min(1, Math.round(score * 100) / 100));

        await supabase
            .from('tracks')
            .update({ popularity_score: finalScore })
            .eq('id', track.id);
            
        console.log(`Updated [${track.id}]: Score ${Math.round(finalScore * 100)}%`);
    }

    console.log('--- Aura Score Update Completed ---');
}

calculateAuraScores().catch(console.error);
