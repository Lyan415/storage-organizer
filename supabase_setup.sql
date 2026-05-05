
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Projects Table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  owner_id uuid references auth.users not null
);

-- Create Items Table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  image_url text,
  note text,
  parent_id uuid references public.items,
  project_id uuid references public.projects not null
);

-- Set up Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.items enable row level security;

-- Policies for Projects
create policy "Users can view their own projects"
  on public.projects for select
  using ( auth.uid() = owner_id );

create policy "Users can insert their own projects"
  on public.projects for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update their own projects"
  on public.projects for update
  using ( auth.uid() = owner_id );

create policy "Users can delete their own projects"
  on public.projects for delete
  using ( auth.uid() = owner_id );

-- Policies for Items (based on project ownership)
-- Note: This requires a join to check project ownership, which can be complex in RLS.
-- A simpler approach for now is to trust the project_id check if we ensure UI consistently passes it,
-- creates a risk if someone guesses a project_id.
-- A better secure approach:
create policy "Users can view items in their projects"
  on public.items for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = items.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can insert items in their projects"
  on public.items for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = items.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can update items in their projects"
  on public.items for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = items.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can delete items in their projects"
  on public.items for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = items.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- ============================================================
-- Shares Table (for public share links)
-- ============================================================
create table public.shares (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  token text not null unique,
  item_id uuid references public.items not null,
  project_id uuid references public.projects not null
);

alter table public.shares enable row level security;

create policy "Users can view shares for their projects"
  on public.shares for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = shares.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Anyone can view shares by token"
  on public.shares for select
  using (true);

create policy "Users can create shares for their projects"
  on public.shares for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = shares.project_id
      and projects.owner_id = auth.uid()
    )
  );

create policy "Users can delete shares for their projects"
  on public.shares for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = shares.project_id
      and projects.owner_id = auth.uid()
    )
  );

-- Allow anonymous users to read items that have a share link
create policy "Anyone can view shared items"
  on public.items for select
  using (
    exists (
      select 1 from public.shares
      where shares.project_id = items.project_id
    )
  );

-- ============================================================
-- Storage Setup
-- ============================================================
-- Run this in the Supabase Dashboard > Storage > Create bucket:
--   Name: item-images, Public: ON

-- Then run these policies in SQL Editor:
insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'item-images' and auth.role() = 'authenticated' );

create policy "Everyone can view images"
  on storage.objects for select
  using ( bucket_id = 'item-images' );

create policy "Users can update their own images"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'item-images' );

create policy "Users can delete their own images"
  on storage.objects for delete
  using ( auth.uid() = owner and bucket_id = 'item-images' );
