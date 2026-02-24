import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Calendar, ArrowUpRight } from 'lucide-react';
import { getBlogPosts, BlogPost } from '@/app/actions/blog';
import { MainHeader } from '@/components/layout/MainHeader';
import { Footer } from '@/components/layout/Footer';
import { createClient } from '@/lib/db/server';
import { getTranslations } from 'next-intl/server';

export default async function BlogLandingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Blog');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch posts on the server
    const posts = await getBlogPosts(true, locale);

    const placeholderPosts: BlogPost[] = [
        {
            title: "What is Royalty-Free Music?",
            slug: "what-is-royalty-free-music",
            excerpt: "Understanding the essentials of royalty-free licensing and how Sonaraura protects your creative projects across all platforms.",
            content: "",
            cover_image_url: "/assets/blog/royalty_free.png",
            is_published: true,
            published_at: new Date().toISOString(),
        },
        {
            title: "The Science of Focus",
            slug: "science-of-focus",
            excerpt: "Explining how neuro-acoustic music patterns affect brain waves and accelerate the transition into deep work modes.",
            content: "",
            cover_image_url: "/assets/blog/science_of_focus.png",
            is_published: true,
            published_at: new Date().toISOString(),
        },
        {
            title: "Crafting Atmosphere for Spaces",
            slug: "crafting-atmosphere",
            excerpt: "How music design transforms customer experience in HORECA and strategies for creating a unique brand soul.",
            content: "",
            cover_image_url: "/assets/blog/crafting_atmosphere.png",
            is_published: true,
            published_at: new Date().toISOString(),
        }
    ];

    const displayPosts = posts.length > 0 ? posts : placeholderPosts;
    const featuredPost = displayPosts[0];
    const regularPosts = displayPosts.slice(1);

    return (
        <div className="min-h-screen bg-white text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
            <MainHeader initialUser={user} />

            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 pt-32 lg:pt-40">
                <div className="space-y-4 mb-16 lg:mb-24">
                    <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">
                        <span className="h-px w-8 bg-indigo-600" />
                        {t('ourJournal')}
                    </div>
                    <h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">
                        SONAR<span className="text-zinc-200 font-light not-italic">AURA</span> BLOG
                    </h1>
                    <p className="text-zinc-400 max-w-2xl text-lg lg:text-xl font-medium leading-relaxed mt-6">
                        {t('description')}
                    </p>
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="group block relative rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 mb-20 lg:mb-32 transition-all hover:shadow-2xl hover:shadow-zinc-100"
                    >
                        <div className="grid lg:grid-cols-2 gap-0">
                            <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden bg-white">
                                <Image
                                    src={featuredPost.cover_image_url}
                                    alt={featuredPost.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-contain p-8 lg:p-16 transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-8 lg:p-20 flex flex-col justify-center bg-white">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {t('editorsPick')}
                                    </span>
                                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                        <Calendar size={14} />
                                        {new Date(featuredPost.published_at!).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-black italic tracking-tight mb-8 leading-[1] group-hover:text-indigo-600 transition-colors uppercase text-balance">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-zinc-500 text-lg lg:text-xl mb-12 leading-relaxed">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-zinc-900 font-black uppercase tracking-widest text-[11px]">
                                    {t('readArticle')} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Grid Posts */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col"
                        >
                            <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-white border border-zinc-100 mb-8 transition-all hover:shadow-xl hover:shadow-zinc-100">
                                <Image
                                    src={post.cover_image_url}
                                    alt={post.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-contain p-6 lg:p-10 transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">{t('resources')}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-200" />
                                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        {new Date(post.published_at!).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black italic tracking-tight group-hover:text-indigo-600 transition-colors leading-[1.1] uppercase text-balance">
                                    {post.title}
                                </h3>
                                <p className="text-zinc-500 text-sm lg:text-base leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Large Featured Card (Alternative Style) */}
                <div className="mt-32 lg:mt-48 p-1px bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/20 rounded-[3rem]">
                    <div className="bg-zinc-50 rounded-[3rem] p-8 lg:p-24 overflow-hidden relative">
                        <div className="relative z-10 max-w-3xl space-y-8">
                            <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-zinc-900 leading-[0.9] uppercase">
                                {t.rich('subscribe', {
                                    br: () => <br />,
                                    spanTag: (chunks) => <span className="text-indigo-600">{chunks}</span>
                                })}
                            </h2>
                            <p className="text-zinc-500 text-lg lg:text-xl font-medium leading-relaxed">
                                {t('subscribeDesc')}
                            </p>
                            <form className="flex flex-col md:flex-row gap-4 max-w-md">
                                <input
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    className="flex-1 bg-white border border-zinc-200 rounded-2xl px-8 py-5 text-zinc-900 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-zinc-300 shadow-sm"
                                />
                                <button className="bg-zinc-900 text-white font-black uppercase tracking-widest text-xs px-10 py-5 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg">
                                    {t('joinNow')}
                                </button>
                            </form>
                        </div>

                        <div className="absolute top-1/2 right-[-10%] translate-y-[-50%] w-[50%] h-[80%] opacity-20 lg:opacity-100 hidden lg:block">
                            <Image
                                src="/assets/blog/royalty_free.png"
                                alt="Newsletter"
                                fill
                                sizes="50vw"
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer variant="white" />
        </div>
    );
}
