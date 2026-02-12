-- Migration: Add youtube_channel_id to public.profiles
-- Created: 2026-02-12

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS youtube_channel_id text;

-- Add a comment for clarity
COMMENT ON COLUMN public.profiles.youtube_channel_id IS 'Stored YouTube Channel ID for creators';
