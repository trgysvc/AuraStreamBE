
-- STANDALONE FEEDBACK SYSTEM SETUP
-- Path: supabase/feedback_setup.sql

-- 1. Create Enums (Drop if exist to ensure fresh start)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_category') THEN
        CREATE TYPE public.feedback_category AS ENUM ('bug', 'feature', 'content', 'billing');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_severity') THEN
        CREATE TYPE public.feedback_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
        CREATE TYPE public.feedback_status AS ENUM ('new', 'in_progress', 'resolved', 'ignored');
    END IF;
END $$;

-- 2. Create Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category feedback_category NOT NULL,
    severity feedback_severity DEFAULT 'low',
    status feedback_status DEFAULT 'new',
    title TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 3. Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can insert their own feedback
DROP POLICY IF EXISTS "Users can insert their own feedback" ON public.feedbacks;
CREATE POLICY "Users can insert their own feedback" ON public.feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedbacks;
CREATE POLICY "Users can view their own feedback" ON public.feedbacks
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedbacks;
CREATE POLICY "Admins can view all feedback" ON public.feedbacks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Admins can update feedback
DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedbacks;
CREATE POLICY "Admins can update feedback" ON public.feedbacks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. Performance Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.feedbacks TO authenticated;
GRANT SELECT ON TABLE public.feedbacks TO anon;

