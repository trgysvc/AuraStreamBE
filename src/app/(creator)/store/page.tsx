
import { Button } from '@/components/shared/Button';
import { getStoreTracks_Action } from '@/app/actions/store'; // Changed from getLatestTracks_Action
import { TrackCard } from '@/components/feature/store/TrackCard';

export default async function StoreHomepage() {
    const tracks = await getStoreTracks_Action();

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Search Section */}
            <section className="relative px-6 py-24 md:py-32 bg-gray-900 text-white overflow-hidden">
                {/* Abstract Background */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600 rounded-full blur-[120px]"></div>
                </div>

                <div className="container relative z-10 mx-auto text-center max-w-4xl">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                        Music that powers your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">story</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Royalty-free music powered by AI and curated by humans.
                        Safe for YouTube, Twitch, and Commercial use.
                    </p>

                    <div className="max-w-xl mx-auto flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search for 'Cinematic', 'Lo-Fi', 'Happy'..."
                                className="w-full h-12 px-5 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg shadow-xl"
                            />
                            <span className="absolute right-4 top-3 text-gray-400">🔍</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-400">
                        <span>Trending:</span>
                        <button className="hover:text-white underline decoration-dotted">Cyberpunk</button>
                        <button className="hover:text-white underline decoration-dotted">Relaxing Jazz</button>
                        <button className="hover:text-white underline decoration-dotted">Epic Trailer</button>
                    </div>
                </div>
            </section>

            {/* Featured Genres / Categories */}
            <section className="container mx-auto px-6">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-2xl font-bold">Browse by Mood</h2>
                    <Button variant="outline">View All</Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {['Happy', 'Dark', 'Energetic', 'Calm', 'Cinematic', 'Corporate'].map((mood) => (
                        <div key={mood} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative overflow-hidden">
                            <span className="font-semibold z-10 group-hover:scale-110 transition-transform">{mood}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Latest Tracks (Grid) */}
            <section className="container mx-auto px-6">
                <h2 className="text-2xl font-bold mb-6">Fresh Drops</h2>

                {tracks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-gray-500">No tracks available yet.</p>
                        <div className="mt-4 text-sm text-gray-400">
                            Upload content via Admin Panel to see it here.
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tracks.map((track) => (
                            <TrackCard key={track.id} track={track} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
