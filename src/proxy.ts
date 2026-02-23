import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Fonksiyon adını Next.js'in istediği gibi 'proxy' yaptık
export async function proxy(request: NextRequest) {
    // 1. GÜVENLİK VE PORT TEMİZLİĞİ (Sonsuz döngüyü kıran kısım)
    const host = request.headers.get('host');
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');

    if (host && host.includes(':3000') && !isLocal) {
        const url = request.nextUrl.clone();
        url.host = host.split(':')[0];
        url.port = '';
        url.protocol = 'https:';

        return NextResponse.redirect(url, 301);
    }

    // 2. SUPABASE OTURUM YÖNETİMİ
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    await supabase.auth.getUser()

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
