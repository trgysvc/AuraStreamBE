import { createClient } from '@/lib/db/server';
import {
    Users,
    UserPlus,
    Search,
    Shield,
    MapPin,
    Mail,
    MoreHorizontal,
    ChevronDown,
    ArrowRight
} from 'lucide-react';
import { Link } from '@/i18n/navigation';

async function getStaffData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) return { staff: [], venues: [] };

    // Parallel fetch for staff and venues (to allow assigning staff to venues)
    const [staffRes, venuesRes] = await Promise.all([
        supabase.from('profiles').select('*, venue:venues(*)').eq('tenant_id', profile.tenant_id).order('created_at', { ascending: false }),
        supabase.from('venues').select('*').eq('tenant_id', profile.tenant_id)
    ]);

    return {
        staff: staffRes.data || [],
        venues: venuesRes.data || [],
        tenantId: profile.tenant_id
    };
}

export default async function StaffManagementPage() {
    const data = await getStaffData();
    if (!data) return null;

    const { staff, venues } = data;

    return (
        <div className="space-y-12 pb-20 p-8 pt-16 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-8">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white text-glow">
                        Personnel <span className="text-pink-500">Logistics</span>
                    </h1>
                    <p className="text-zinc-500 font-medium text-lg">Command and control your authorized workforce.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Identify personnel..."
                            className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                    <button
                        className="px-6 py-3 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-xl"
                    >
                        <UserPlus size={14} strokeWidth={3} /> Invite Agent
                    </button>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-[#111] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Identity / Email</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Access Role</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Primary Assignment</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="p-8">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 border border-white/5 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-inner">
                                            <Users size={24} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-white uppercase italic">{member.full_name || 'Anonymous Agent'}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold lowercase">
                                                <Mail size={10} className="text-pink-500" />
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${(member.role as string) === 'enterprise_admin'
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                            : 'bg-zinc-500/10 border-white/5 text-zinc-400'
                                            }`}>
                                            <Shield size={10} />
                                            {member.role || 'Staff'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase italic tracking-wider">
                                            {(member as any).venue?.business_name || (member as any).venue?.name || 'Central Command'}
                                        </p>
                                        <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                                            <MapPin size={10} />
                                            {(member as any).venue?.city || 'HQ'}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8 text-right">
                                    <button className="p-3 text-zinc-600 hover:text-white transition-colors hover:bg-white/5 rounded-2xl">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Stats / Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#1E1E22] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Role Hierarchy</h4>
                        <p className="text-xs text-zinc-500 mt-1">Enterprise Admins have global access, while Venue Staff are locked to specific locations.</p>
                    </div>
                </div>

                <div className="bg-[#1E1E22] p-8 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="h-12 w-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-500 border border-pink-500/20">
                        <Users size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase italic">Active Operations</h4>
                        <p className="text-xs text-zinc-500 mt-1">{staff.length} agents currently authorized across the fleet.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-800 to-black p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Protocol Tip</p>
                    <p className="text-xs font-bold text-white italic mt-4 italic leading-relaxed">Assign users to specific venues to restrict their dashboard view to local operations only.</p>
                    <div className="mt-6 flex items-center gap-2 text-indigo-400 group cursor-pointer">
                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Safety Documentation</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}
