import { createClient } from '@/lib/db/server';
import { Search, Filter, Layers, ListMusic, Plus } from 'lucide-react';
import { CatalogTrackRow } from '@/components/dashboard/CatalogTrackRow';
import { S3Service } from '@/lib/services/s3';

async function getCatalogTracks() {
    const supabase = await createClient();
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Catalog Error:', error);
        return [];
    }

    if (!tracks) return [];

    // Sign cover images
    const tracksWithSignedUrls = await Promise.all(tracks.map(async (track) => {
        let finalCoverImage = track.cover_image_url;
        if (finalCoverImage && finalCoverImage.includes('amazonaws.com')) {
            try {
                const urlParts = finalCoverImage.split('.com/');
                if (urlParts.length > 1) {
                    const s3Key = decodeURIComponent(urlParts[1]);
                    finalCoverImage = await S3Service.getDownloadUrl(s3Key, process.env.AWS_S3_BUCKET_RAW!);
                }
            } catch (e) {
                console.error("Failed to sign cover image URL", e);
            }
        }
        return { ...track, cover_image_url: finalCoverImage };
    }));

    return tracksWithSignedUrls;
}

export default async function CatalogMgmtPage() {
    const tracks = await getCatalogTracks();

    return (
        <div className="space-y-8 md:space-y-12 pb-24 md:pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
                <div className="space-y-1 md:space-y-0">
                    <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Catalog Management</h1>
                    <p className="text-zinc-500 font-medium text-sm md:text-[15px]">The Master Repository: Controlling the global flow.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative group flex-1 sm:flex-none">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            className="bg-[#1E1E22] border border-white/5 rounded-full pl-12 pr-6 py-3 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-all w-full sm:w-64 placeholder:text-zinc-700"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
                            <Filter size={18} />
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 md:px-8 h-10 md:h-12 bg-white text-black rounded-full font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl whitespace-nowrap">
                            <Plus size={14} strokeWidth={3} /> Add Track
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <StatCard icon={ListMusic} label="Total Assets" value={tracks.length} color="text-indigo-500" />
                <StatCard icon={Layers} label="Genres" value={new Set(tracks.map(t => t.genre)).size} color="text-pink-500" />
                <StatCard icon={Plus} label="New This Week" value={tracks.filter(t => new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} color="text-green-500" />
            </div>

            {/* Main Data Table */}
            <div className="bg-[#1E1E22] rounded-2xl md:rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in duration-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px] md:min-w-0">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.03] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                <th className="p-5 md:p-8">Audio Asset</th>
                                <th className="p-5 md:p-8">Duration</th>
                                <th className="p-5 md:p-8">Technical Mapping</th>
                                <th className="p-5 md:p-8">Vibe Profile</th>
                                <th className="p-5 md:p-8">Engagement</th>
                                <th className="p-5 md:p-8 text-right">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {tracks.map((track) => (
                                <CatalogTrackRow key={track.id} track={track} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Helper Note */}
            <p className="md:hidden text-center text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                Scroll horizontally to view technical data
            </p>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-[#1E1E22] p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 flex items-center gap-4 md:gap-6">
            <div className={`h-10 w-10 md:h-12 md:w-12 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center ${color}`}><Icon size={20} /></div>
            <div>
                <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
                <p className="text-xl md:text-2xl font-black text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}
