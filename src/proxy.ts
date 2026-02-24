import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. Dil Ayarları Tanımlaması
const intlMiddleware = createIntlMiddleware({
    locales: ['en', 'tr', 'el', 'de', 'ru', 'fr'],
    defaultLocale: 'en',
    localeDetection: true
});

export async function proxy(request: NextRequest) {
    // ---------------------------------------------------------
    // ADIM 1: GÜVENLİK VE PORT TEMİZLİĞİ (EN BAŞA ALINDI!)
    // ---------------------------------------------------------
    const host = request.headers.get('host');
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');

    if (host && host.includes(':3000') && !isLocal) {
        const url = request.nextUrl.clone();
        url.host = host.split(':')[0];
        url.port = '';
        url.protocol = 'https:';

        // İstek arızalıysa hemen HTTPS'e zorla, aşağıya inme!
        return NextResponse.redirect(url, 301);
    }

    // ---------------------------------------------------------
    // ADIM 2: NEXT-INTL DİL YÖNLENDİRMESİ
    // ---------------------------------------------------------
    // Bu response, içinde dil bilgisi ve yönlendirme (örn: /tr) barındıran altın objemizdir.
    const intlResponse = intlMiddleware(request);

    // ---------------------------------------------------------
    // ADIM 3: SUPABASE OTURUM YÖNETİMİ (Güvenli Birleştirme)
    // ---------------------------------------------------------
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // 1. Gelen isteği güncelle (Supabase'in iç işleyişi için)
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

                    // 2. KRİTİK DÜZELTME: Yeni NextResponse OLUŞTURMA!
                    // Çerezleri doğrudan intlResponse objesinin üzerine yaz ki dil ayarları ezilmesin.
                    cookiesToSet.forEach(({ name, value, options }) =>
                        intlResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Oturumu yenile
    await supabase.auth.getUser()

    // İçinde hem Next-intl dil ayarları hem de Supabase çerezleri barındıran nihai yanıtı dön.
    return intlResponse
}

export const config = {
    matcher: [
        // i18n rotalarını kapsayacak ve statik dosyaları hariç tutacak matcher
        '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
