-- Migration: Fixed SQL for pgvector with correct operator classes
-- Date: 2026-02-12

-- 1. Ensure extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Add metadata column for rich technical and vibe data
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Add embedding column for vector search (niyet araması)
ALTER TABLE public.tracks 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 4. Create an index for fast vector similarity search (FIXED: using vector_cosine_ops)
-- pgvector requires specific operator classes for indices.
CREATE INDEX IF NOT EXISTS idx_tracks_embedding ON public.tracks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. Set existing tracks to 'active' so they show up on the dashboard
UPDATE public.tracks 
SET status = 'active' 
WHERE status IN ('processing', 'pending_qc');

-- 6. Add a helper function for similarity search
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
