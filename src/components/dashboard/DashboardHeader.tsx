'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Search,
    Music,
    Mic2,
    Sparkles,
    User,
    LogOut,
    ChevronDown,
    Settings,
    CreditCard,
    Users,
    MessageSquare,
    LifeBuoy,
    Menu,
    LayoutGrid,
    ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/db/client';

export default function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(data?.role || 'creator');
            }
        };
        fetchRole();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const navItems = [
        { label: 'Venue', href: '/dashboard/venue' },
        { label: 'Music', href: '/dashboard/music' },
        { label: 'Sound effects', href: '/dashboard/sfx' },
    ];

    return (
        <header className="h-16 border-b border-white/5 bg-black flex items-center justify-between px-8 sticky top-0 z-50">
            {/* Left: Logo & Nav */}
            <div className="flex items-center gap-12">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-xl font-black italic tracking-widest text-white select-none">
                        SONAR<span className="font-light text-zinc-300">AURA</span>
                    </span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`text-[13px] font-bold transition-colors ${pathname === item.href ? 'text-white' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* AI Link with Badge */}
                    <div className="flex items-center gap-2 cursor-default group">
                        <span className="text-[13px] font-bold text-zinc-500 group-hover:text-white transition-colors">AI</span>
                        <span className="bg-[#1D9BF0] text-white text-[9px] font-black px-1.5 py-0.5 rounded italic uppercase leading-none">Soon</span>
                    </div>

                    {/* Music on Request (Active) */}
                    <Link 
                        href="/dashboard/request"
                        className="hidden xl:flex items-center gap-2 px-3 py-1 border border-indigo-500/30 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 transition-all group shadow-lg shadow-indigo-500/10"
                    >
                        <Sparkles size={12} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
                        <span className="text-[12px] font-bold text-white tracking-tight uppercase italic">Music on Request</span>
                    </Link>
                </nav>
            </div>

            {/* Right: Actions & User Menu */}
            <div className="flex items-center gap-8">
                {/* User Profile Dropdown / Settings */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 p-1 rounded-full transition-colors group"
                    >
                        <Menu size={22} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-56 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                <Link
                                    href="/account"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-pink-500"
                                >
                                    <Settings size={16} />
                                    Account
                                </Link>

                                {role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-black text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-indigo-500 italic uppercase"
                                    >
                                        <ShieldCheck size={16} />
                                        Admin Factory
                                    </Link>
                                )}
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <Users size={16} />
                                    Refer a friend
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <CreditCard size={16} />
                                    Pricing
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <MessageSquare size={16} />
                                    Send feedback
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
                                    <LifeBuoy size={16} />
                                    Contact support
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-pink-500 hover:bg-pink-500/10 transition-colors"
                                >
                                    <LogOut size={16} />
                                    Log out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
