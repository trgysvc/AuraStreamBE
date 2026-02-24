import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { record } = body;

        // SQL'den veri gelmemişse boşuna çalışma
        if (!record || !record.id) {
            return NextResponse.json({ message: 'Geçerli bir kayıt bulunamadı.' }, { status: 400 });
        }

        const { id, title, content, excerpt } = record;
        const locales = ['tr', 'el', 'de', 'ru', 'fr'];

        // SADECE SUNUCUDA ÇALIŞAN GÜVENLİ ANAHTAR (Service Role)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        for (const locale of locales) {
            const prompt = `Translate the following blog title, excerpt, and content into ${locale} language. Return only a JSON object with "title", "excerpt", and "content" keys. Do not use markdown blocks.
      Title: ${title}
      Excerpt: ${excerpt}
      Content: ${content}`;

            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: "application/json" }
                })
            });

            const data = await geminiResponse.json();

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const translated = JSON.parse(data.candidates[0].content.parts[0].text);

                await supabase
                    .from('blog_translations')
                    .upsert({
                        blog_id: id,
                        locale,
                        title: translated.title,
                        excerpt: translated.excerpt,
                        content: translated.content
                    }, { onConflict: 'blog_id,locale' });
            }
        }

        return NextResponse.json({ success: true, message: 'Çeviriler başarıyla tamamlandı.' });
    } catch (error: any) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}