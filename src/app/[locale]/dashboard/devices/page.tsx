
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';
import { getDevices_Action } from '@/app/actions/device';
import { Plus, Monitor, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default async function DevicesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/login');
    }

    // specific foreign key might be needed if multiple relations exist, but usually tenant_id is enough
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">No Tenant Found</h1>
                <p>Please contact support or create a workspace.</p>
            </div>
        );
    }

    const devices = await getDevices_Action(profile.tenant_id);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-white/5 pb-8">
                <div className="space-y-4">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">Devices</h1>
                    <p className="text-zinc-500 font-medium">Manage your audio players and hardware.</p>
                </div>
                <button
                    disabled
                    className="px-8 py-4 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-2xl flex items-center gap-3 opacity-50 cursor-not-allowed"
                    title="Feature coming soon"
                >
                    <Plus size={16} />
                    Register New Device
                </button>
            </div>

            {/* Devices Grid */}
            {devices.length === 0 ? (
                <div className="bg-[#111] border border-white/5 rounded-3xl p-16 text-center space-y-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Monitor size={48} className="text-zinc-600" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">No Devices Connected</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            Connect your first player to start streaming music to your venue.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {devices.map((device: any) => (
                        <div key={device.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 space-y-6 hover:border-white/10 transition-colors group">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-white text-lg">{device.name}</h3>
                                        {device.sync_status === 'synced' && <span className="bg-green-500/10 text-green-500 text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider">Online</span>}
                                        {device.sync_status === 'downloading' && <span className="bg-blue-500/10 text-blue-500 text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><RefreshCw size={10} className="animate-spin" /> Syncing</span>}
                                        {device.sync_status === 'error' && <span className="bg-red-500/10 text-red-500 text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Error</span>}
                                    </div>
                                    <p className="text-xs text-zinc-500 font-mono tracking-wider">{device.hardware_id}</p>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${isOnline(device.last_heartbeat) ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 rounded-xl p-4 space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Venue</p>
                                    <p className="text-sm font-bold text-zinc-300 truncate">{device.venue?.business_name || 'Unassigned'}</p>
                                </div>
                                <div className="bg-black/50 rounded-xl p-4 space-y-1">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">App Version</p>
                                    <p className="text-sm font-bold text-zinc-300">{device.app_version || 'v1.0.0'}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className="text-xs text-zinc-600 font-medium">Last seen: {formatDate(device.last_heartbeat)}</span>
                                <button className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-white transition-colors">Manage</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function isOnline(lastHeartbeat: string | null) {
    if (!lastHeartbeat) return false;
    const diff = new Date().getTime() - new Date(lastHeartbeat).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
}
