create type public.app_role as enum ('admin', 'manager', 'cashier');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view their own role"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Demo staff accounts (passwords are demo-only; change before going live)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change, email_change_token_new
)
values
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'admin@venuevue.app', crypt('venue-admin', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Venue Admin"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'manager@venuevue.app', crypt('venue-manager', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Venue Manager"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
   'cashier@venuevue.app', crypt('venue-cashier', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Cashier Staff"}',
   now(), now(), '', '', '', '')
on conflict do nothing;

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'admin@venuevue.app'
on conflict do nothing;

insert into public.user_roles (user_id, role)
select id, 'manager' from auth.users where email = 'manager@venuevue.app'
on conflict do nothing;

insert into public.user_roles (user_id, role)
select id, 'cashier' from auth.users where email = 'cashier@venuevue.app'
on conflict do nothing;