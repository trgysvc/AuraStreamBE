'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/db/client';

export function MainHeader({ initialUser }: { initialUser?: any }) {
    const supabase = createClient();
    const [user, setUser] = useState<any>(initialUser);
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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 bg-black/90 backdrop-blur-sm transition-all duration-300 border-b border-white/10 h-20">
            <div className="flex items-center gap-12 h-full">
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-2 group leading-none">
                    <div className="h-8 w-8 bg-white text-black rounded flex items-center justify-center font-bold transition-transform group-hover:scale-110">S</div>
                    <span className="text-xl font-black italic tracking-widest text-white leading-none">
                        SONAR<span className="font-light text-zinc-300">AURA</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-400">
                    <span className="cursor-default hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">Music</span>
                    <span className="cursor-default hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300">Sound Effects</span>
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
                {!user ? (
                    <>
                        <Link href="/login" className="hidden sm:block text-sm font-bold hover:text-gray-300 transition-colors">
                            Log in
                        </Link>
                        <Link href="/signup" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                            Start free trial
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/dashboard" className="hidden sm:block text-sm font-bold hover:text-gray-300 transition-colors">
                            Dashboard
                        </Link>
                        <Link href="/account" className="h-10 px-6 flex items-center justify-center rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors">
                            Account
                        </Link>
                    </>
                )}
                <button className="lg:hidden text-white">
                    <Menu size={24} />
                </button>
            </div>
        </header>
    );
}
