'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Globe, Lock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { updateBlogPost, getBlogPosts, BlogPost } from '@/app/actions/blog';
import Image from 'next/image';
import { createClient } from '@/lib/db/client';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image_url: '',
        is_published: false
    });

    useEffect(() => {
        async function loadPost() {
            try {
                const supabase = createClient();
                const { data, error } = await (supabase as any)
                    .from('blog_posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setFormData(data);
                }
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPost();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateBlogPost(id, formData);
            router.push('/admin/blog');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error updating blog post');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/blog"
                        className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tight">EDIT <span className="text-zinc-500 font-light">POST</span></h1>
                        <p className="text-zinc-500 text-sm mt-1">Refine your content.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Post Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter a striking title..."
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Slug</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-3 text-zinc-400 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Excerpt</label>
                            <textarea
                                required
                                value={formData.excerpt}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="A brief summary for cards and SEO..."
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm min-h-[100px] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Content (Markdown)</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Write your story using markdown..."
                                className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm min-h-[400px] font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 space-y-6 sticky top-28">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Publishing</label>
                            <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_published: false }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.is_published ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    <Lock size={14} />
                                    Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_published: true }))}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.is_published ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
                                        }`}
                                >
                                    <Globe size={14} />
                                    Public
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Cover Image URL</label>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={formData.cover_image_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="w-full bg-black border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-xs"
                                />
                                <div className="aspect-video relative rounded-2xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group">
                                    {formData.cover_image_url ? (
                                        <Image
                                            src={formData.cover_image_url}
                                            alt="Preview"
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="text-zinc-700 flex flex-col items-center gap-2">
                                            <ImageIcon size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Image Preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl ${saving
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                        >
                            {saving ? (
                                <div className="h-4 w-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Update Post
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
