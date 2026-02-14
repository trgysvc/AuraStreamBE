'use client';

import React from 'react';
import { Info, Search, Music, Grid2X2, HelpCircle, FileText, User, CreditCard } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function HelpCenterPage() {
    return (
        <div className="flex flex-col font-sans selection:bg-indigo-500 selection:text-white">

            <main className="flex-1 w-full">
                {/* Hero Section */}
                <section className="relative py-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black z-0" />
                    <div className="relative z-10 max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                            How can we help?
                        </h1>

                        <div className="relative max-w-xl mx-auto w-full">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search for help articles..."
                                className="w-full bg-white text-black pl-14 pr-6 py-4 rounded-full font-medium text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-2xl transition-all"
                            />
                        </div>
                    </div>
                </section>

                {/* Categories Grid */}
                <section className="max-w-6xl mx-auto px-6 md:px-12 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <CategoryCard
                            icon={Info}
                            title="Getting Started"
                            desc="Start here for an overview of Sonaraura."
                            link="/about/howitworks?page=getting-started"
                        />
                        <CategoryCard
                            icon={Music}
                            title="Music & Licensing"
                            desc="Copyright, usage rights, and finding tracks."
                            link="/about/howitworks?page=direct-licensing"
                        />
                        <CategoryCard
                            icon={User}
                            title="Account & Profile"
                            desc="Managing your settings and preferences."
                            link="/about/howitworks?page=account-setup"
                        />
                        <CategoryCard
                            icon={CreditCard}
                            title="Billing & Subscription"
                            desc="Invoices, payment methods, and plans."
                            link="/pricing"
                        />
                        <CategoryCard
                            icon={Grid2X2}
                            title="Features & Tech"
                            desc="Learn about our AI and molecular sound."
                            link="/about/howitworks?page=technology"
                        />
                        <CategoryCard
                            icon={HelpCircle}
                            title="Technical Support"
                            desc="Troubleshooting playback and platform issues."
                            link="#"
                        />
                    </div>
                </section>

                {/* Popular Articles */}
                <section className="max-w-4xl mx-auto px-6 md:px-12 pb-24 space-y-8">
                    <h2 className="text-2xl font-black uppercase italic tracking-tight text-center">Popular Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ArticleLink title="Can I use this music on YouTube?" />
                        <ArticleLink title="How do I cancel my subscription?" />
                        <ArticleLink title="What is 432Hz tuning?" />
                        <ArticleLink title="Do you offer enterprise plans?" />
                        <ArticleLink title="How to create a custom playlist?" />
                        <ArticleLink title="Billing cycle and invoices" />
                    </div>
                </section>
            </main>

            <Footer variant="dark" />
        </div>
    );
}

function CategoryCard({ icon: Icon, title, desc, link }: { icon: any, title: string, desc: string, link: string }) {
    return (
        <Link href={link} className="bg-[#111] border border-white/5 p-8 rounded-2xl hover:bg-[#1a1a1a] hover:border-white/10 transition-all group text-left">
            <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                <Icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">{desc}</p>
        </Link>
    );
}

function ArticleLink({ title }: { title: string }) {
    return (
        <Link href="#" className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl hover:bg-[#1a1a1a] hover:border-indigo-500/30 transition-all group">
            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{title}</span>
            <FileText size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
        </Link>
    );
}
