import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    const results: Record<string, string> = {};

    try {
        const body = await req.json();
        const { record } = body;

        if (!record || !record.id) {
            return NextResponse.json({ message: 'Geçerli bir kayıt bulunamadı.' }, { status: 400 });
        }

        const { id, title, content, excerpt } = record;
        const locales = ['tr', 'el', 'de', 'ru', 'fr'];

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        for (const locale of locales) {
            try {
                // Small delay between calls to avoid Gemini rate limits (429)
                if (locales.indexOf(locale) > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
                const prompt = `Translate the following blog post into ${locale} language. Return ONLY a valid JSON object (no markdown, no code blocks) with exactly these keys: "title", "excerpt", "content".
Title: ${title}
Excerpt: ${excerpt}
Content: ${content}`;

                const geminiResponse = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { response_mime_type: "application/json" }
                        })
                    }
                );

                if (!geminiResponse.ok) {
                    results[locale] = `Gemini HTTP error: ${geminiResponse.status}`;
                    console.error(`[translate-blog] Gemini error for ${locale}:`, geminiResponse.status);
                    continue;
                }

                const data = await geminiResponse.json();
                let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!rawText) {
                    results[locale] = 'No text from Gemini';
                    console.error(`[translate-blog] No text from Gemini for ${locale}`);
                    continue;
                }

                // Strip markdown code blocks if Gemini wraps response in ```json ... ```
                rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

                let translated: { title: string; excerpt: string; content: string };
                try {
                    translated = JSON.parse(rawText);
                } catch (parseErr) {
                    results[locale] = `JSON parse error: ${String(parseErr)}`;
                    console.error(`[translate-blog] JSON parse error for ${locale}:`, rawText.substring(0, 200));
                    continue;
                }

                if (!translated.title || !translated.content || !translated.excerpt) {
                    results[locale] = 'Missing required keys in translation';
                    console.error(`[translate-blog] Missing keys for ${locale}:`, Object.keys(translated));
                    continue;
                }

                const { error: upsertError } = await supabase
                    .from('blog_translations')
                    .upsert(
                        {
                            blog_id: id,
                            locale,
                            title: translated.title,
                            excerpt: translated.excerpt,
                            content: translated.content
                        },
                        { onConflict: 'blog_id,locale' }
                    );

                if (upsertError) {
                    results[locale] = `DB error: ${upsertError.message}`;
                    console.error(`[translate-blog] DB upsert error for ${locale}:`, upsertError);
                } else {
                    results[locale] = 'ok';
                }
            } catch (localeErr: any) {
                results[locale] = `Unexpected error: ${localeErr.message}`;
                console.error(`[translate-blog] Unexpected error for ${locale}:`, localeErr);
            }
        }

        const hasFailures = Object.values(results).some(r => r !== 'ok');
        return NextResponse.json({
            success: !hasFailures,
            message: hasFailures ? 'Bazı çeviriler başarısız.' : 'Çeviriler başarıyla tamamlandı.',
            results
        });
    } catch (error: any) {
        console.error('[translate-blog] Fatal error:', error);
        return NextResponse.json({ error: error.message, results }, { status: 500 });
    }
}