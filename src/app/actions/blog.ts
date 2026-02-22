'use server';

import { createClient } from '@/lib/db/server';
import { revalidatePath } from 'next/cache';

export interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    cover_image_url: string;
    author_id?: string;
    is_published: boolean;
    published_at?: string;
    created_at?: string;
    updated_at?: string;
}

export async function getBlogPosts(onlyPublished = true) {
    const supabase = await createClient();

    let query = (supabase as any)
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (onlyPublished) {
        query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }

    return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string) {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching blog post with slug ${slug}:`, error);
        return null;
    }

    return data as BlogPost;
}

export async function createBlogPost(post: Partial<BlogPost>) {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create blog post: ${error.message}`);
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return data;
}

export async function updateBlogPost(id: string, post: Partial<BlogPost>) {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update blog post: ${error.message}`);
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${(data as any).slug}`);
    revalidatePath('/admin/blog');
    return data;
}

export async function deleteBlogPost(id: string) {
    const supabase = await createClient();

    const { error } = await (supabase as any)
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete blog post: ${error.message}`);
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    return true;
}
