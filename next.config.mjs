/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
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
