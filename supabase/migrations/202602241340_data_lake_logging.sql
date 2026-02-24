-- Migration: Data Lake Logging Architecture
-- Target: playback_sessions enhancement and track_blocks creation

-- 1. Enhance playback_sessions with granular metadata snapshots
ALTER TABLE public.playback_sessions 
ADD COLUMN IF NOT EXISTS bpm_at_play INTEGER,
ADD COLUMN IF NOT EXISTS energy_at_play FLOAT,
ADD COLUMN IF NOT EXISTS venue_type_at_play TEXT,
ADD COLUMN IF NOT EXISTS exact_skip_timestamp TIMESTAMPTZ;

COMMENT ON COLUMN public.playback_sessions.bpm_at_play IS 'Snapshot of track BPM at the time of playback.';
COMMENT ON COLUMN public.playback_sessions.energy_at_play IS 'Snapshot of track energy/intensity at the time of playback.';
COMMENT ON COLUMN public.playback_sessions.venue_type_at_play IS 'Snapshot of the venue industry/type at the time of playback.';
COMMENT ON COLUMN public.playback_sessions.exact_skip_timestamp IS 'Precision timestamp when the skip action occurred.';

-- 2. Create track_blocks for venue-specific blacklisting
CREATE TABLE IF NOT EXISTS public.track_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(venue_id, track_id)
);

-- 3. RLS Policies for track_blocks
ALTER TABLE public.track_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Venues can manage their own blocks" 
ON public.track_blocks 
FOR ALL 
USING (venue_id IN (SELECT id FROM public.venues WHERE owner_id = auth.uid()));

CREATE POLICY "Service role has full access to blocks" 
ON public.track_blocks 
FOR ALL 
TO service_role 
USING (true);

-- 4. Infinite Logging Enforcement (Prevent Hard Deletes on key tables)
-- Note: In a real environment, we'd use a 'deleted_at' column or a 'before delete' trigger that raises an error.
-- For this Phase, we'll implement a 'soft delete only' policy in our Server Actions.
