import Link from 'next/link';

interface FooterProps {
    variant?: 'light' | 'dark';
}

export function Footer({ variant = 'light' }: FooterProps) {
    const isDark = variant === 'dark';

    return (
        <footer className={`py-24 px-6 md:px-12 transition-colors duration-300 border-t ${isDark
            ? 'bg-[#111111] text-white border-white/10'
            : 'bg-[#F5F5F0] text-black border-zinc-200'
            }`}>
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Logo & Lang */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                            <span className="text-2xl font-black tracking-tighter uppercase italic">AuraStream</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded text-sm font-medium cursor-pointer transition-colors ${isDark
                            ? 'border-white/20 text-white hover:bg-white/10'
                            : 'border-zinc-300 text-black hover:bg-zinc-100'
                            }`}>
                            English (US) ▾
                        </div>
                    </div>

                    {/* Links */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Product</h4>
                            <ul className={`space-y-4 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-800'}`}>
                                <li><Link href="#" className="hover:text-white transition-opacity">Royalty-free music</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Sound effects</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">AI voiceovers</Link></li>
                                <li><Link href="/pricing" className="hover:text-white transition-opacity">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Aura Tailor</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Learn More</h4>
                            <ul className={`space-y-4 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-800'}`}>
                                <li><Link href="#" className="hover:text-white transition-opacity">How it works</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Use cases</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">For businesses</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Enterprise</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Blog</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">About</h4>
                            <ul className={`space-y-4 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-800'}`}>
                                <li><Link href="#" className="hover:text-white transition-opacity">Help center</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">About us</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Press</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Careers</Link></li>
                                <li><Link href="#" className="hover:text-white transition-opacity">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={`pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'border-white/10 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
                    <div className="flex gap-4">
                        <p>Copyright © AuraStream</p>
                        <Link href="#" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Legal</Link>
                        <Link href="#" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Privacy</Link>
                        <Link href="#" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}>Cookie</Link>
                    </div>
                    <div className={`flex gap-8 ${isDark ? 'text-white/40' : 'text-black opacity-40'}`}>
                        <span>Instagram</span>
                        <span>YouTube</span>
                        <span>Twitter</span>
                        <span>Facebook</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
