import { Play } from 'lucide-react';

const FeaturedCard = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="relative overflow-hidden rounded-lg aspect-video group cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors">
        <div className="absolute bottom-0 left-0 p-6 text-black">
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">{subtitle}</p>
            <h3 className="text-3xl font-bold tracking-tight">{title}</h3>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="h-16 w-16 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                <Play size={24} fill="currentColor" />
            </button>
        </div>
    </div>
);

const TrackCard = ({ title, artist, image }: { title: string, artist: string, image: string }) => (
    <div className="group cursor-pointer">
        <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-gray-100">
            {/* Placeholder for track image - Grayscale filter for aesthetic */}
            <div className="absolute inset-0 bg-gray-300 grayscale group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover' }} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform">
                    <Play size={20} fill="currentColor" />
                </button>
            </div>
        </div>
        <h4 className="font-bold text-sm text-gray-900 truncate">{title}</h4>
        <p className="text-xs text-gray-500 truncate mt-1">{artist}</p>
    </div>
);

export default function DashboardPage() {
    return (
        <div className="space-y-16 pb-20">
            {/* Featured Section */}
            <section>
                <div className="flex items-end justify-between mb-8">
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900">Discover</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeaturedCard title="Cinematic Landscapes" subtitle="Curated Playlist" />
                    <FeaturedCard title="Deep Focus" subtitle="Trending Now" />
                    <FeaturedCard title="Creator Essentials" subtitle="Staff Picks" />
                </div>
            </section>

            {/* Recent Tracks Section */}
            <section>
                <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">Fresh Finds</h2>
                    <button className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">View All</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
                    {/* Placeholder Data */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TrackCard
                            key={i}
                            title={`Track Title ${i}`}
                            artist={`Artist Name ${i}`}
                            image={`https://picsum.photos/seed/${i * 123}/300/300`}
                        />
                    ))}
                </div>
            </section>

            {/* Genres Section */}
            <section>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-8 border-b border-gray-100 pb-4">Browse by Genre</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {['Cinematic', 'Electronic', 'Acoustic', 'Pop', 'Rock', 'Ambient'].map((genre) => (
                        <div key={genre} className="aspect-[3/2] rounded-md bg-gray-100 relative overflow-hidden group cursor-pointer border border-transparent hover:border-black transition-colors">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-black font-medium text-sm tracking-wide">{genre}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
