'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Music, Mic2, User, Settings, LogOut, ShieldCheck, Users } from 'lucide-react';
import { createClient } from '@/lib/db/client';

const SidebarItem = ({ icon: Icon, label, href, active }: { icon: React.ElementType, label: string, href: string, active?: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-4 px-6 py-3 transition-colors ${active
            ? 'text-white bg-white/10 border-l-4 border-white'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </Link>
);

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<any>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function loadSidebarContext() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('role, email')
                        .eq('id', user.id)
                        .single();
                    setProfile(data);
                }
            } catch (err) {
                console.error('Sidebar load error:', err);
            }
        }
        loadSidebarContext();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    if (!isClient) return null;

    const userRole = profile?.role;
    const userEmail = profile?.email;

    // Aggressive overrides for development/testing
    const isAdmin = userRole === 'admin' || userEmail === 'turgaysavaci@gmail.com' || userEmail === 'superjangofett@gmail.com';
    const isEnterprise = userRole === 'enterprise_admin' || userEmail === 'devran@ara.com.tr';
    const isStaff = userRole === 'staff' || userRole === 'venue' || userEmail === 'yusuf@ara.com.tr' || userEmail === 'alper@ara.com.tr';

    return (
        <aside className="w-64 bg-black border-r border-white/10 h-screen fixed left-0 top-0 flex flex-col z-50 shadow-2xl">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-white/5 mb-4 bg-black">
                <div className="relative h-8 w-8">
                    <Image src="/images/Logo.png" alt="SonarAura" fill sizes="32px" className="object-contain" />
                </div>
                <span className="text-xl font-black italic tracking-widest text-white select-none uppercase">
                    Sonar<span className="text-indigo-500">Aura</span>
                </span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pb-10 bg-black">
                <SidebarItem icon={Home} label="Home" href="/dashboard" active={pathname === '/dashboard'} />

                {/* Fleet Control - Enterprise & Admin */}
                {(isAdmin || isEnterprise) && (
                    <>
                        <div className="mt-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50 mb-2">
                            Fleet Intelligence
                        </div>
                        <SidebarItem
                            icon={ShieldCheck}
                            label="Enterprise Control"
                            href="/dashboard/enterprise"
                            active={pathname === '/dashboard/enterprise'}
                        />
                        <div className="ml-10 space-y-1 mb-4">
                            <Link
                                href="/dashboard/enterprise/venues"
                                className={`block py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${pathname === '/dashboard/enterprise/venues' ? 'text-indigo-400' : 'text-zinc-600 hover:text-white'}`}
                            >
                                • Branch Network
                            </Link>
                            <Link
                                href="/dashboard/enterprise/staff"
                                className={`block py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${pathname === '/dashboard/enterprise/staff' ? 'text-pink-400' : 'text-zinc-600 hover:text-white'}`}
                            >
                                • Personnel
                            </Link>
                        </div>
                        {isAdmin && (
                            <SidebarItem icon={Users} label="Super Admin" href="/admin/users" active={pathname?.startsWith('/admin/users')} />
                        )}
                    </>
                )}

                {/* Venue Ops */}
                {(isStaff || isEnterprise || isAdmin) && (
                    <>
                        <div className="mt-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-green-500/50 mb-2">
                            Live Operations
                        </div>
                        <SidebarItem
                            icon={ShieldCheck}
                            label="My Venue"
                            href="/dashboard/venue"
                            active={pathname?.startsWith('/dashboard/venue')}
                        />
                    </>
                )}

                <div className="mt-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-2">
                    Media Library
                </div>
                <SidebarItem icon={Music} label="Music" href="/dashboard/music" active={pathname?.startsWith('/dashboard/music')} />
                <SidebarItem icon={Mic2} label="Sound Effects" href="/dashboard/sfx" active={pathname?.startsWith('/dashboard/sfx')} />

                <div className="mt-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 mb-2">
                    Identity
                </div>
                <SidebarItem icon={User} label="Profile" href="/dashboard/me" active={pathname === '/dashboard/me'} />
                <SidebarItem icon={Settings} label="Settings" href="/account" active={pathname === '/account'} />
            </nav>

            <div className="p-6 border-t border-white/5 bg-black">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-white/5 text-zinc-400 hover:text-rose-500 transition-all border border-white/5">
                    <LogOut size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                </button>
            </div>
        </aside>
    );
}
