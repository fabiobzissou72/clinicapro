-- Database Schema for Clinica Estetica Pro

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (Profile extension for Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'professional',
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- PACIENTES
create table if not exists public.pacientes (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  email text,
  phone text,
  cpf text,
  birth_date date,
  observations text,
  created_at timestamp with time zone default now()
);

-- PROCEDIMENTOS (Treatments)
create table if not exists public.procedimentos (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  duration integer, -- in minutes
  price decimal(10,2),
  category text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- AGENDAMENTOS (Appointments)
create table if not exists public.agendamentos (
  id uuid default uuid_generate_v4() primary key,
  paciente_id uuid references public.pacientes(id) on delete cascade,
  procedimento_id uuid references public.procedimentos(id),
  professional_id uuid references public.profiles(id),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  notes text,
  created_at timestamp with time zone default now()
);

-- FINANCEIRO (Financial)
create table if not exists public.financeiro (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('income', 'expense')) not null,
  category text,
  amount decimal(10,2) not null,
  date date default current_date,
  description text,
  agendamento_id uuid references public.agendamentos(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ESTOQUE (Inventory)
create table if not exists public.estoque (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  quantity integer default 0,
  unit text,
  min_quantity integer default 5,
  price decimal(10,2),
  created_at timestamp with time zone default now()
);

-- RLS Policies (Row Level Security)
alter table public.profiles enable row level security;
alter table public.pacientes enable row level security;
alter table public.procedimentos enable row level security;
alter table public.agendamentos enable row level security;
alter table public.financeiro enable row level security;
alter table public.estoque enable row level security;

-- Basic Policies (Allow authenticated users to read/write)
-- Note: In a real app, you'd refine these based on roles.
create policy "All authenticated users can do everything" on public.profiles for all using (auth.role() = 'authenticated');
create policy "All authenticated users can do everything" on public.pacientes for all using (auth.role() = 'authenticated');
create policy "All authenticated users can do everything" on public.procedimentos for all using (auth.role() = 'authenticated');
create policy "All authenticated users can do everything" on public.agendamentos for all using (auth.role() = 'authenticated');
create policy "All authenticated users can do everything" on public.financeiro for all using (auth.role() = 'authenticated');
create policy "All authenticated users can do everything" on public.estoque for all using (auth.role() = 'authenticated');
