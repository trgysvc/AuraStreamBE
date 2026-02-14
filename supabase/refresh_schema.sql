
-- Re-apply grants to trigger schema cache refresh
GRANT ALL ON TABLE public.feedbacks TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Re-apply RLS just in case
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own feedback" ON feedbacks;
CREATE POLICY "Users can insert their own feedback" ON feedbacks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON feedbacks;
CREATE POLICY "Users can view their own feedback" ON feedbacks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON feedbacks;
CREATE POLICY "Admins can view all feedback" ON feedbacks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update feedback status" ON feedbacks;
CREATE POLICY "Admins can update feedback status" ON feedbacks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger a schema change notification
COMMENT ON TABLE public.feedbacks IS 'Feedback collection table - Last Pokered: ' || now();
