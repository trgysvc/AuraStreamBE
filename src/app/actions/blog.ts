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

    // Fetch the current user to set as the author
    const { data: { user }, error: userError } = await (supabase as any).auth.getUser();

    if (user) {
        post.author_id = user.id;
    } else {
        console.warn("User not found when creating blog post:", userError);
    }

    // Ensure published_at is set if published
    if (post.is_published && !post.published_at) {
        post.published_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
        .from('blog_posts')
        .insert([post])
        .select()
        .single();

    if (error) {
        console.error("Supabase Error creating blog post:", error);
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

export async function uploadBlogImage(formData: FormData) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await (supabase as any).auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const file = formData.get('image') as File;
    if (!file) throw new Error("No image provided");

    // Sanitize filename and create unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `blog/${fileName}`;

    // Upload to public-assets bucket
    const { error: uploadError } = await (supabase as any).storage
        .from('public-assets')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = (supabase as any).storage
        .from('public-assets')
        .getPublicUrl(filePath);

    return publicUrl;
}
