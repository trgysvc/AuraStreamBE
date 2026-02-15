'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Music, Mic2, User, Settings, LogOut } from 'lucide-react';
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

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        } else {
            router.push('/');
            router.refresh();
        }
    };

    return (
        <aside className="w-64 bg-black border-r border-white/10 h-[calc(100vh-64px)] fixed left-0 top-16 flex flex-col z-40">
            {/* Navigation */}
            <nav className="flex-1 space-y-1 pt-4">
                <SidebarItem
                    icon={Home}
                    label="Home"
                    href="/dashboard"
                    active={pathname === '/dashboard'}
                />
                <SidebarItem
                    icon={Music}
                    label="Music"
                    href="/dashboard/music"
                    active={pathname?.startsWith('/dashboard/music')}
                />
                <SidebarItem
                    icon={Mic2}
                    label="Sound Effects"
                    href="/dashboard/sfx"
                    active={pathname?.startsWith('/dashboard/sfx')}
                />

                <div className="mt-8 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Your Music
                </div>
                <SidebarItem
                    icon={User}
                    label="Me"
                    href="/dashboard/me"
                />
                <SidebarItem
                    icon={Settings}
                    label="Account"
                    href="/account"
                />
            </nav>

            {/* User Profile / Logout */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-2 text-gray-400 hover:text-white transition-colors"
                >
                    <LogOut size={18} />
                    <span className="text-sm font-medium">Log out</span>
                </button>
            </div>
            <div className="p-6 flex items-center gap-3">
                <div className="relative h-8 w-8">
                    <Image
                        src="/images/Logo.png"
                        alt="SonarAura"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="text-xl font-black italic tracking-widest text-white select-none">
                    SONAR<span className="font-light text-zinc-400">AURA</span>
                </span>
            </div>
        </aside>
    );
}
