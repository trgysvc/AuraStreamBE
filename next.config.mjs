import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
    './src/i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: false,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'aurastream-raw-storage-v1.s3.us-east-1.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ifpbhptcnlndhwujprhn.supabase.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'gemini.google.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: https://tally.so; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: images.unsplash.com aurastream-raw-storage-v1.s3.us-east-1.amazonaws.com ifpbhptcnlndhwujprhn.supabase.co gemini.google.com https:; font-src 'self' data: https:; connect-src 'self' https: https://tally.so; media-src 'self' blob: data: aurastream-raw-storage-v1.s3.us-east-1.amazonaws.com https:; object-src 'none'; base-uri 'self'; form-action 'self' https://tally.so; frame-ancestors 'self' https://sonaraura.com https://www.sonaraura.com; frame-src 'self' https://sonaraura.com https://www.sonaraura.com https://tally.so; upgrade-insecure-requests;",
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=*, interest-cohort=()',
                    },
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                ],
            },
        ];
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }

        // Final fix for jsmediatags react-native issue in ALL builders
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-native-fs': false,
            'net': false,
            'tls': false
        };

        // Suppress dynamic import warnings from next-intl/jsmediatags
        config.module.exprContextCritical = false;

        return config;
    },
};

export default withNextIntl(nextConfig);

