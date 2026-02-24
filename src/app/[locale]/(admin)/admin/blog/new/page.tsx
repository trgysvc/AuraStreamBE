'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Globe, Lock, UploadCloud } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { createBlogPost, BlogPost } from '@/app/actions/blog';
import Image from 'next/image';

export default function NewBlogPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image_url: '',
        is_published: false
    });

    const [previewImage, setPreviewImage] = useState('');

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createBlogPost(formData);
            router.push('/admin/blog');
        } catch (error) {
            console.error(error);
            alert('Error creating blog post');
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-black italic tracking-tight">CREATE <span className="text-zinc-500 font-light">POST</span></h1>
                        <p className="text-zinc-500 text-sm mt-1">Compose your next big idea.</p>
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
                                onChange={handleTitleChange}
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
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Cover Image</label>
                            <div className="space-y-4">
                                <label className="cursor-pointer block">
                                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group hover:border-indigo-500/50 transition-colors">
                                        {formData.cover_image_url ? (
                                            <>
                                                <Image
                                                    src={formData.cover_image_url}
                                                    alt="Preview"
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                                    className="object-cover group-hover:opacity-50 transition-opacity"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                                                    <span className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                                                        <UploadCloud size={16} /> Change Image
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-zinc-700 flex flex-col items-center gap-2 group-hover:text-indigo-400 transition-colors">
                                                <ImageIcon size={32} />
                                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <UploadCloud size={14} className="inline" /> Upload Image
                                                </span>
                                            </div>
                                        )}
                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                try {
                                                    setLoading(true);
                                                    const formData = new FormData();
                                                    formData.append('image', file);

                                                    // Dynamic import of the upload action to deal with client/server boundary
                                                    const { uploadBlogImage } = await import('@/app/actions/blog');
                                                    const url = await uploadBlogImage(formData);

                                                    setFormData(prev => ({ ...prev, cover_image_url: url }));
                                                } catch (error) {
                                                    console.error("Upload error:", error);
                                                    alert("Failed to upload image. Please check console.");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        />
                                    </div>
                                </label>
                                <p className="text-[9px] text-zinc-600 leading-relaxed">
                                    Upload a high-quality image. It will be stored in your Supabase <code className="text-indigo-400">public-assets</code> bucket.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all shadow-xl ${loading
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-zinc-200'
                                }`}
                        >
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Post
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
