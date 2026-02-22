import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Determine host and protocol
    // Note: We avoid protocol-based redirects (HTTP -> HTTPS) here because Coolify/Traefik handles it.
    // Doing it here can cause infinite redirect loops in some proxy configurations.
    let host = request.headers.get('host');

    // Sanitize host: Strip internal port 3000 if present in production/staging
    // This prevents redirects from leaking the internal container port
    // But keep it for local development on localhost
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');

    if (host && host.includes(':3000') && !isLocal) {
        const url = request.nextUrl.clone();
        url.host = host.split(':')[0];
        // Only redirect if the host actually changed to avoid loops
        if (url.host !== host) {
            return NextResponse.redirect(url, 301);
        }
    }

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

    // Refresh session if expired
    await supabase.auth.getUser()

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
