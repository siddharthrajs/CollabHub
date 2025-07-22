create table public.profiles (
  created_at timestamp with time zone not null default now(),
  username text not null default ''::text,
  name text null,
  bio text null,
  skills text[] null,
  linkedin_link text null,
  github_link text null,
  twitter_link text null,
  branch text null,
  batch_year integer null,
  portfolio_url text null,
  avatar_url text null,
  id uuid not null,
  profile_completed boolean not null default false,
  constraint profiles_pkey primary key (id),
  constraint profiles_github_link_key unique (github_link),
  constraint profiles_linkedin_link_key unique (linkedin_link),
  constraint profiles_twitter_link_key unique (twitter_link),
  constraint profiles_username_key unique (username),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for Profiles
-- Allow users to view all profiles
create policy "Allow users to view all profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

-- Allow users to insert their own profile
create policy "Allow users to insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Allow users to update their own profile
create policy "Allow users to update own profile" on public.profiles
  for update using (auth.uid() = id);