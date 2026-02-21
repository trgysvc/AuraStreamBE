/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
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
        ],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Fixes npm packages that depend on `fs` module or other Node.js built-ins
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        // Specific ignore for jsmediatags react-native issue
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-native-fs': false,
        };
        return config;
    },
};

export default nextConfig;
