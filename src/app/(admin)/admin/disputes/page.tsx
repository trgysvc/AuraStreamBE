import { createClient } from '@/lib/db/server';
import { ShieldAlert } from 'lucide-react';
import { DisputeActionCard } from '@/components/dashboard/DisputeActionCard';
import { DisputeAsset } from '@/types/admin';

async function getDisputes(): Promise<DisputeAsset[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('disputes')
        .select('*, profiles(email, full_name), licenses(license_key, project_name, tracks(title))')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Disputes Error:', error);
        return [];
    }
    return (data as any) || [];
}

export default async function DisputeCenterPage() {
    const disputes = await getDisputes();

    return (
        <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Dispute Center</h1>
                    <p className="text-zinc-500 font-medium mt-1 text-[15px]">Protect our creators and resolve copyright claims.</p>
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="py-24 text-center bg-[#1E1E22] rounded-[3rem] border border-white/5 space-y-4 animate-in fade-in duration-700">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert size={32} className="text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No active disputes found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {disputes.map((dispute: DisputeAsset) => (
                        <DisputeActionCard key={dispute.id} dispute={dispute} />
                    ))}
                </div>
            )}
        </div>
    );
}
