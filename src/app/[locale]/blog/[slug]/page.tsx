import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Clock, Calendar, User, Share2, ChevronLeft, ArrowRight } from 'lucide-react';
import { getBlogPostBySlug, BlogPost } from '@/app/actions/blog';
import { notFound } from 'next/navigation';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { getTranslations } from 'next-intl/server';

interface Props {
    params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Blog' });
    const post = await getBlogPostBySlug(slug, locale);

    if (!post) {
        return {
            title: t('postNotFound'),
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.cover_image_url],
            type: 'article',
            publishedTime: post.published_at,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.cover_image_url],
        }
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug, locale } = await params;
    const t = await getTranslations('Blog');
    const post = await getBlogPostBySlug(slug, locale);

    const placeholders: Record<string, any> = {
        'what-is-royalty-free-music': {
            title: "What is Royalty-Free Music?",
            excerpt: "Understanding the essentials of royalty-free licensing and how Sonaraura protects your creative projects across all platforms.",
            content: `
## What Does Royalty-Free Mean?
Contrary to common belief, royalty-free doesn't mean "free." It is a type of music licensing that allows the buyer to pay for a music license only once and use the music for as long as desired without having to pay additional royalties.

### How It Works at Sonaraura
We've simplified the process. When you use sound from Sonaraura, you're covered by our direct license. This means we own 100% of the rights, so you never have to worry about copyright claims or third-party disputes.

> "Music is the shorthand of emotion. Making it accessible and legally safe is our core mission."

### The Benefits of Direct Licensing
1. **Safety:** No copyright strikes on YouTube or Twitch.
2. **Global Rights:** Use your content anywhere in the world.
3. **Simplicity:** One license, unlimited possibilities.

![Royalty Free](/assets/blog/royalty_free.png)

### Summary
Choosing royalty-free music from a direct licensor is the smartest way to scale your content production without legal friction.
            `,
            cover_image_url: "/assets/blog/royalty_free.png",
            published_at: new Date().toISOString(),
        }
    };

    const displayPost = post || placeholders[slug];

    if (!displayPost) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-indigo-100">
            <MainHeader />

            {/* Secondary Metadata Header */}
            <header className="fixed top-20 inset-x-0 h-16 bg-white/90 backdrop-blur-xl border-b border-zinc-100 z-40 transition-all">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <Link href="/blog" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-indigo-600 transition-colors group">
                        <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                        {t('backToJournal')}
                    </Link>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                            <span>{t('resources')}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-200" />
                            <span>{t('safeContent')}</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
                            <Share2 size={12} />
                            {t('share')}
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-48 pb-24 px-6">
                <article className="max-w-4xl mx-auto">
                    <div className="space-y-12 mb-20 text-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">
                                <span className="h-px w-8 bg-indigo-600" />
                                {t('deepResearch')}
                            </div>
                            <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter leading-[0.9] uppercase max-w-5xl mx-auto text-balance">
                                {displayPost.title}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 pt-12 border-t border-zinc-100">
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
                                    <User size={24} className="text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">{t('writtenBy')}</p>
                                    <p className="text-sm font-bold text-zinc-900">Dr. Sonar Aura</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Calendar size={20} className="text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">{t('published')}</p>
                                    <p className="text-sm font-bold text-zinc-900">
                                        {new Date(displayPost.published_at!).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-left">
                                <div className="h-12 w-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Clock size={20} className="text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">{t('readTime')}</p>
                                    <p className="text-sm font-bold text-zinc-900">{t('minRead', { minutes: 8 })}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-video rounded-[3rem] overflow-hidden bg-white border border-zinc-100 mb-20 shadow-2xl shadow-zinc-100">
                        <Image
                            src={displayPost.cover_image_url}
                            alt={displayPost.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 80vw"
                            className="object-contain p-12 lg:p-24"
                            priority
                        />
                    </div>

                    <div className="prose prose-zinc prose-xl max-w-3xl mx-auto prose-headings:font-black prose-headings:italic prose-headings:tracking-tighter prose-headings:uppercase prose-headings:leading-[1] prose-a:text-indigo-600 prose-img:rounded-[2.5rem] prose-img:border prose-img:border-zinc-100">
                        <div className="text-zinc-600 leading-[1.8] space-y-12 font-medium">
                            {displayPost.content.split('\n').map((line: string, i: number) => {
                                if (line.startsWith('## ')) {
                                    return <h2 key={i} className="text-4xl lg:text-5xl border-l-4 border-indigo-600 pl-8 ml-[-2rem] mt-24 mb-12">{line.replace('## ', '')}</h2>;
                                }
                                if (line.startsWith('### ')) {
                                    return <h3 key={i} className="text-2xl lg:text-3xl mt-16 mb-8">{line.replace('### ', '')}</h3>;
                                }
                                if (line.startsWith('> ')) {
                                    return (
                                        <div key={i} className="relative py-12 px-12 bg-zinc-50 rounded-[2.5rem] my-16 overflow-hidden group border border-zinc-100">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                                            <p className="text-3xl lg:text-4xl font-black italic tracking-tighter text-zinc-900 leading-snug relative z-10">
                                                {line.replace('> ', '').replace(/"/g, '')}
                                            </p>
                                            <div className="mt-6 flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                                                <span className="h-px w-4 bg-indigo-600" />
                                                {t('coreInsights')}
                                            </div>
                                        </div>
                                    );
                                }
                                if (line.startsWith('* ')) {
                                    return (
                                        <div key={i} className="flex items-center gap-4 py-4 px-8 bg-white border border-zinc-100 rounded-2xl hover:border-indigo-200 transition-colors">
                                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                            <p className="text-base font-bold text-zinc-800">{line.replace('* ', '')}</p>
                                        </div>
                                    );
                                }
                                if (line.startsWith('![')) return null;
                                return line.trim() ? <p key={i} className="text-lg lg:text-xl text-zinc-500 leading-relaxed">{line}</p> : null;
                            })}
                        </div>
                    </div>

                </article>
            </main>

            {/* Read More Section - Exactly 2 posts */}
            <section className="bg-zinc-50 py-32 lg:py-48 border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-20">
                        <h2 className="text-4xl lg:text-6xl font-black italic tracking-tight uppercase leading-[0.9]">
                            {t('continueExploring')} <br /><span className="text-zinc-300 font-light not-italic">{t('exploring')}</span>
                        </h2>
                        <Link href="/blog" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-zinc-900 transition-colors group">
                            {t('fullJournal')} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                        <Link href="/blog/science-of-focus" className="group block">
                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 mb-8 transition-all hover:shadow-2xl hover:shadow-zinc-200">
                                <Image
                                    src="/assets/blog/science_of_focus.png"
                                    alt="Focus"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-4">
                                <span className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em]">02 / 2026</span>
                                <h4 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">The Science of Focus</h4>
                                <p className="text-zinc-500 text-sm lg:text-base leading-relaxed line-clamp-2">How neuro-acoustic patterns accelerate deep work...</p>
                            </div>
                        </Link>

                        <Link href="/blog/crafting-atmosphere" className="group block">
                            <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 mb-8 transition-all hover:shadow-2xl hover:shadow-zinc-200">
                                <Image
                                    src="/assets/blog/crafting_atmosphere.png"
                                    alt="Atmosphere"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-4">
                                <span className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em]">02 / 2026</span>
                                <h4 className="text-2xl lg:text-3xl font-black italic tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">Atmosphere Design</h4>
                                <p className="text-zinc-500 text-sm lg:text-base leading-relaxed line-clamp-2">Strategies for creating unique sonic brand souls...</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer variant="white" />
        </div>
    );
}
