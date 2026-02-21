import { createClient } from '@/lib/db/server';
import { CheckCircle2 } from 'lucide-react';
import { QCAssetCard } from '@/components/dashboard/QCAssetCard';

async function getPendingTracks() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tracks')
        .select(`
            *,
            track_files (
                s3_key,
                file_type,
                tuning
            )
        `)
        .eq('status', 'pending_qc')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch QC Tracks Error:', error);
        return [];
    }
    return data || [];
}

export default async function QCStationPage() {
    const tracks = await getPendingTracks();

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">QC Station</h1>
                    <p className="text-zinc-500 font-medium mt-1">Review, Tag and Authorize newly ingested assets.</p>
                </div>
                <div className="px-6 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                    {tracks.length} Tracks in Queue
                </div>
            </div>

            {tracks.length === 0 ? (
                <div className="py-24 text-center bg-[#1E1E22] rounded-[3rem] border border-white/5 space-y-4 animate-in fade-in duration-700">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Queue is clear. No pending items.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {tracks.map((track) => (
                        <QCAssetCard key={track.id} track={track} />
                    ))}
                </div>
            )}
        </div>
    );
}
