-- Create blog_posts table
create table if not exists public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  cover_image_url text,
  author_id uuid references public.profiles(id),
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: Blog Posts
alter table public.blog_posts enable row level security;

-- Public can view published posts
create policy "Published blog posts are viewable by everyone"
  on blog_posts for select
  using ( is_published = true );

-- Admins can manage all posts
create policy "Admins can manage all blog posts"
  on blog_posts for all
  using ( is_admin() );

-- Trigger for updated_at
create trigger update_blog_posts_modtime before update on blog_posts for each row execute procedure update_updated_at();

-- Index for slug
create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_published on blog_posts(is_published, published_at desc);
