import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Explore the latest sonic trends, legal guides, and tech releases in the world of royalty-free music and venue soundscapes.',
    openGraph: {
        title: 'SonarAura Blog | Sonic Trends & Tech',
        description: 'Latest insights into music licensing and atmospheric design.',
        type: 'website',
    }
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
