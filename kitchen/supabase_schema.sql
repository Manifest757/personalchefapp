-- Create tables for the Chef's Atelier app

-- Clients table
create table if not exists public.clients (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  weekly_rate numeric,
  color_idx integer,
  meals text[],
  notes text,
  updated_at timestamp with time zone default now()
);

-- Recipes table
create table if not exists public.recipes (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  day text,
  slot text,
  description text,
  emoji text,
  ingredients jsonb,
  assembly text[],
  steps text[],
  utensils text[],
  batch_size integer,
  updated_at timestamp with time zone default now()
);

-- Pantry table
create table if not exists public.pantry (
  id text primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount numeric,
  unit text,
  category text,
  updated_at timestamp with time zone default now()
);

-- Settings table
create table if not exists public.settings (
  id uuid primary key references auth.users not null,
  chef_info jsonb default '{"name": "", "email": "", "phone": "", "avatar_url": ""}'::jsonb,
  prices jsonb default '{}'::jsonb,
  stores jsonb default '[]'::jsonb,
  menu_offers text[] default '{}'::text[],
  shopping_done jsonb default '{}'::jsonb,
  prep_done jsonb default '{}'::jsonb,
  theme text default 'light',
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.clients enable row level security;
alter table public.recipes enable row level security;
alter table public.pantry enable row level security;
alter table public.settings enable row level security;

-- Create Policies
create policy "Users can only access their own clients" on public.clients
  for all using (auth.uid() = user_id);

create policy "Users can only access their own recipes" on public.recipes
  for all using (auth.uid() = user_id);

create policy "Users can only access their own pantry items" on public.pantry
  for all using (auth.uid() = user_id);

create policy "Users can only access their own settings" on public.settings
  for all using (auth.uid() = id);

-- Storage bucket setup (for avatars)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Avatar images are publicly accessible." 
  on storage.objects for select 
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload an avatar." 
  on storage.objects for insert 
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatar." 
  on storage.objects for update 
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Users can delete their own avatar." 
  on storage.objects for delete 
  using ( bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text );

-- Trigger to create settings on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.settings (id, chef_info, theme)
  values (
    new.id, 
    jsonb_build_object(
      'name', coalesce(split_part(new.email, '@', 1), 'Chef'),
      'email', coalesce(new.email, ''),
      'phone', '',
      'avatar_url', ''
    ), 
    'light'
  )
  on conflict (id) do update 
    set updated_at = now();
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
