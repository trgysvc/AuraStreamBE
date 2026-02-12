-- Migration: Add Enhanced Metadata and Embedding for Smart Search
-- Date: 2026-02-12

-- 1. Add metadata column for rich technical and vibe data
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Add embedding column for vector search (niyet araması)
-- We use 1536 dimensions for compatibility with OpenAI text-embedding-3-small
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create an index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_tracks_embedding ON public.tracks 
USING ivfflat (embedding cosine) WITH (lists = 100);

-- 4. Set existing tracks to 'active' so they show up on the dashboard
UPDATE public.tracks 
SET status = 'active' 
WHERE status IN ('processing', 'pending_qc');

-- 5. Add a helper function for similarity search
CREATE OR REPLACE FUNCTION match_tracks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  artist text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tracks.id,
    tracks.title,
    tracks.artist,
    1 - (tracks.embedding <=> query_embedding) AS similarity
  FROM tracks
  WHERE 1 - (tracks.embedding <=> query_embedding) > match_threshold
  ORDER BY tracks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
