'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/db/client';

export function MainHeader() {
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, [supabase]);

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
                <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-gray-300">
                    <Link href="/music" className="hover:text-white transition-colors">Music</Link>
                    <Link href="/sound-effects" className="hover:text-white transition-colors">Sound Effects</Link>
                    <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
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
