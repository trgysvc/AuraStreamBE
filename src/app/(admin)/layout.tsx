import { ReactNode } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    UploadCloud,
    Headphones,
    Library,
    Users,
    Settings,
    ArrowLeft,
    ShieldCheck,
    Bell,
    Sparkles,
    Activity,
    MessageSquare
} from 'lucide-react';
import { createClient } from '@/lib/db/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = createClient();

    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // 2. Check Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        // Log error but don't catch the redirect exception
        console.error('Admin Access Denied:', profileError?.message || 'Not an admin');
        redirect('/dashboard/venue');
    }

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar - Command Center Style */}
            <aside className="w-72 bg-[#0A0A0A] border-r border-white/5 hidden md:flex flex-col sticky top-0 h-screen">
                <div className="p-10">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] group-hover:scale-110 transition-transform">
                            <ShieldCheck size={22} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black italic tracking-widest text-white leading-none">
                                SONAR<span className="font-light text-zinc-500">AURA</span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-1">Command Center</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Operations</p>
                    <NavLink href="/admin" icon={<LayoutDashboard size={18} />}>Dashboard</NavLink>
                    <NavLink href="/admin/upload" icon={<UploadCloud size={18} />}>Ingest Engine</NavLink>
                    <NavLink href="/admin/qc" icon={<Headphones size={18} />}>QC Station</NavLink>
                    <NavLink href="/admin/catalog" icon={<Library size={18} />}>Catalog Mgmt</NavLink>
                    <NavLink href="/admin/requests" icon={<Sparkles size={18} />}>Request Hub</NavLink>
                    <NavLink href="/admin/telemetry" icon={<Activity size={18} />}>System Telemetry</NavLink>

                    <div className="pt-8">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Ecosystem</p>
                        <NavLink href="/admin/users" icon={<Users size={18} />}>User Intelligence</NavLink>
                        <NavLink href="/admin/feedback" icon={<MessageSquare size={18} />}>Feedback Triage</NavLink>
                        <NavLink href="/admin/settings" icon={<Settings size={18} />}>Global Config</NavLink>

                        <div className="pt-4 mt-4 border-t border-white/5">
                            <Link
                                href="/dashboard/venue"
                                className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
                            >
                                <ArrowLeft size={16} />
                                Back to Player
                            </Link>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Admin Top Header */}
                <header className="h-20 border-b border-white/5 px-10 flex items-center justify-between bg-black/50 backdrop-blur-xl sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Live Production Environment</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-500 rounded-full" />
                        </button>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center font-bold text-sm">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-10">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
        >
            <span className="text-zinc-600 group-hover:text-indigo-500 transition-colors">{icon}</span>
            <span className="tracking-tight">{children}</span>
        </Link>
    );
}
