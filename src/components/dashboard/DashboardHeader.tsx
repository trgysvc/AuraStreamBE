'use client';

import Link from 'next/link';
import Image from 'next/image';
import { submitReferral } from '@/app/actions/referral';
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
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function DashboardHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isReferralOpen, setIsReferralOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [referralStatus, setReferralStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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

    async function handleReferralSubmit(formData: FormData) {
        setReferralStatus('submitting');
        const result = await submitReferral(formData);

        if (result?.success) {
            setReferralStatus('success');
            setTimeout(() => {
                setIsReferralOpen(false);
                setReferralStatus('idle');
            }, 2000);
        } else {
            setReferralStatus('error');
            setTimeout(() => setReferralStatus('idle'), 3000);
        }
    }

    return (
        <>
            <header className="h-16 border-b border-white/5 bg-black flex items-center justify-between px-8 sticky top-0 z-[100]">
                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-12">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/images/Logo.png"
                                alt="SonarAura"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl font-black italic tracking-widest text-white select-none">
                            SONAR<span className="font-light text-zinc-300">AURA</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8">
                        <Link
                            href="/dashboard/venue"
                            className={`text-[13px] font-bold transition-colors ${pathname === '/dashboard/venue' ? 'text-white' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            Venue
                        </Link>

                        {/* Music */}
                        <div className="flex items-center gap-2 cursor-default group">
                            <span className="text-[13px] font-bold text-zinc-500 group-hover:text-white transition-colors">Music</span>
                        </div>

                        {/* Sound Effects */}
                        <div className="flex items-center gap-2 cursor-default group">
                            <span className="text-[13px] font-bold text-zinc-500 group-hover:text-white transition-colors">Sound effects</span>
                        </div>

                        {/* AI Link with Badge */}
                        <div className="flex items-center gap-2 cursor-default group">
                            <span className="text-[13px] font-bold text-zinc-500 group-hover:text-white transition-colors">AI</span>
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded italic uppercase leading-none">Soon</span>
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
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsReferralOpen(true);
                                            // Keep menu open: do not call setIsMenuOpen(false)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Users size={16} />
                                        Refer a friend
                                    </button>
                                    <Link
                                        href="/account#billing"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <CreditCard size={16} />
                                        Pricing
                                    </Link>
                                    <div className="h-px bg-white/5 my-1" />
                                    <button
                                        onClick={() => setIsFeedbackOpen(true)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <MessageSquare size={16} />
                                        Help & Feedback
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

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />

            {/* Referral Modal */}
            {isReferralOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsReferralOpen(false)} />
                    <div className="relative bg-[#18181b] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Invite a Friend</h3>
                            <p className="text-zinc-500 text-sm">Spread the word about SonarAura.</p>
                        </div>

                        {referralStatus === 'success' ? (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                                <p className="text-green-400 font-bold">Invitation sent successfully!</p>
                            </div>
                        ) : (
                            <form action={handleReferralSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Friend's Name</label>
                                    <input
                                        name="friendName"
                                        type="text"
                                        required
                                        placeholder="e.g. Alex Smith"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Friend's Email</label>
                                    <input
                                        name="friendEmail"
                                        type="email"
                                        required
                                        placeholder="alex@example.com"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>

                                {referralStatus === 'error' && (
                                    <p className="text-red-400 text-xs font-bold">Something went wrong. Please try again.</p>
                                )}

                                <div className="pt-2 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsReferralOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-lg font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={referralStatus === 'submitting'}
                                        className="flex-1 px-4 py-3 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {referralStatus === 'submitting' ? 'Sending...' : 'Send Invite'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
