import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/_next/',
                '/auth/v1/callback',
            ],
        },
        sitemap: 'https://sonaraura.com/sitemap.xml',
    }
}
