-- blog_translations tablosunu oluştur
CREATE TABLE IF NOT EXISTS blog_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    locale TEXT NOT NULL,
    title TEXT,
    excerpt TEXT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blog_id, locale)
);

-- RLS ayarları (Public okunabilir, Service Role yazabilir)
ALTER TABLE blog_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to blog_translations"
ON blog_translations FOR SELECT
USING (true);

-- Not: Webhook ayarlarını Supabase dashboard üzerinden yapmanız gerekmektedir.
-- URL: projeniz/api/translate-blog
-- Events: INSERT, UPDATE (blogs tablosu için)
