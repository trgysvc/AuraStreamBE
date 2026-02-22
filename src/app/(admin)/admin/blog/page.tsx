'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, Calendar, User } from 'lucide-react';
import { getBlogPosts, deleteBlogPost, BlogPost } from '@/app/actions/blog';
import Image from 'next/image';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        const data = await getBlogPosts(false);
        setPosts(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this post?')) {
            await deleteBlogPost(id);
            loadPosts();
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight">BLOG <span className="text-zinc-500 font-light">MANAGER</span></h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage your editorial content and illustrations.</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    <Plus size={20} />
                    New Post
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-20 text-center">
                    <p className="text-zinc-500 font-medium">No blog posts found. Create your first one!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex items-center gap-6 hover:border-white/10 transition-all group"
                        >
                            <div className="h-20 w-32 relative rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                                {post.cover_image_url ? (
                                    <Image
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${post.is_published
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </span>
                                    {post.published_at && (
                                        <div className="flex items-center gap-1 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                            <Calendar size={12} />
                                            {new Date(post.published_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-zinc-500 text-sm truncate">{post.excerpt}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    target="_blank"
                                    className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                    title="View Post"
                                >
                                    <Eye size={18} />
                                </Link>
                                <Link
                                    href={`/admin/blog/edit/${post.id}`}
                                    className="p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                    title="Edit Post"
                                >
                                    <Edit2 size={18} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id!)}
                                    className="p-3 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                                    title="Delete Post"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
