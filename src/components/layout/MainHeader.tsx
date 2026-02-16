'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/db/client';

export function MainHeader({ initialUser }: { initialUser?: any }) {
    const supabase = createClient();
    const [user, setUser] = useState<any>(initialUser);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        if (initialUser) return;
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, [supabase, initialUser]);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between px-6 bg-black/90 backdrop-blur-sm transition-all duration-300 border-b border-white/10 h-20">
                <div className="flex items-center gap-12 h-full">
                    {/* Logo Area */}
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-3 group leading-none z-[210]">
                        <div className="relative h-10 w-10">
                            <Image
                                src="/images/Logo.png"
                                alt="SonarAura"
                                fill
                                sizes="(max-w-768px) 40px, 40px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-black italic tracking-widest text-white select-none">
                            SONAR<span className="font-light text-zinc-300">AURA</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-400">
                        <span className="cursor-default hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">Venue</span>
                        <span className="cursor-default hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">Creators</span>
                        <Link
                            href="/pricing"
                            className={`transition-colors ${pathname === '/pricing' ? 'text-white' : 'hover:text-white'}`}
                        >
                            Pricing
                        </Link>
                        <span className="cursor-default hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">Blog</span>
                        <Link
                            href="/enterprise"
                            className={`transition-colors ${pathname === '/enterprise' ? 'text-white' : 'hover:text-white'}`}
                        >
                            Enterprise
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-6 h-full">
                    <div className="hidden lg:flex items-center gap-6">
                        {!user ? (
                            <>
                                <Link href="/login" className="text-sm font-bold hover:text-gray-300 transition-colors">
                                    Log in
                                </Link>
                                <Link href="/signup" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                                    Start free trial
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="text-sm font-bold hover:text-gray-300 transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/account" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                                    Account
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-white z-[210] p-2"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Overlay (Epidemic Style) */}
            <div className={`fixed inset-0 bg-black z-[190] transition-all duration-500 ease-in-out lg:hidden overflow-y-auto ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <nav className="flex flex-col items-center pt-32 pb-12 space-y-8 px-10 text-center min-h-full">
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white">Venue</Link>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white">Creators</Link>
                    <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white">Pricing</Link>
                    <Link href="/enterprise" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-white">Enterprise</Link>
                    <Link href="/about/ad" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black italic uppercase tracking-tighter text-indigo-400">Features</Link>

                    <div className="w-full h-px bg-white/10 my-4" />

                    {!user ? (
                        <div className="flex flex-col gap-6 w-full max-w-xs mx-auto">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-zinc-400 uppercase tracking-widest">Log In</Link>
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl">Start Free Trial</Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 w-full max-w-xs mx-auto">
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-zinc-400 uppercase tracking-widest">Dashboard</Link>
                            <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="py-5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-xl">Account Settings</Link>
                        </div>
                    )}
                </nav>
            </div>
        </>
    );
}
