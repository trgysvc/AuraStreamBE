import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server'

// 1. Dil Ayarları Tanımlaması
const intlProxy = createIntlMiddleware({
    locales: ['en', 'tr', 'el', 'de', 'ru', 'fr'],
    defaultLocale: 'en',
    localeDetection: true
});

export async function proxy(request: NextRequest) {
    // ---------------------------------------------------------
    // ADIM 1: GÜVENLİK VE PORT TEMİZLİĞİ
    // ---------------------------------------------------------
    const headers = await request.headers;
    const host = headers.get('host');
    const isLocal = host?.includes('localhost') || host?.includes('127.0.0.1');

    if (host && host.includes(':3000') && !isLocal) {
        const url = request.nextUrl.clone();
        url.host = host.split(':')[0];
        url.port = '';
        url.protocol = 'https:';
        return NextResponse.redirect(url, 301);
    }

    // ---------------------------------------------------------
    // ADIM 2: NEXT-INTL DİL YÖNLENDİRMESİ
    // ---------------------------------------------------------
    return intlProxy(request);
}

export const config = {
    matcher: [
        '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
