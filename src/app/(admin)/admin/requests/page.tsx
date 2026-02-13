import { createClient } from '@/lib/db/server';
import { Sparkles } from 'lucide-react';
import { RequestActionCard } from '@/components/dashboard/RequestActionCard';

async function getCustomRequests() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('custom_requests')
        .select('*, profiles(email, full_name)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Requests Error:', error);
        return [];
    }
    return data || [];
}

export default async function RequestHubPage() {
    const requests = await getCustomRequests();

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Request Hub</h1>
                    <p className="text-zinc-500 font-medium mt-1 text-[15px]">Manage high-ticket &quot;Music on Request&quot; custom orders.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                        {requests.length} Total Orders
                    </div>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="py-24 text-center bg-[#1E1E22] rounded-[3rem] border border-white/5 space-y-4">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles size={32} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No custom orders in the system.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((req) => (
                        <RequestActionCard key={req.id} req={req} />
                    ))}
                </div>
            )}
        </div>
    );
}
