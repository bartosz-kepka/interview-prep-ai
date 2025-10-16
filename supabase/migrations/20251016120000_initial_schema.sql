-- migration: 20251016120000_initial_schema.sql
-- description: Sets up the initial database schema for the InterviewPrep AI application.
--
-- This migration creates:
-- - Custom ENUM types: question_source, generation_status
-- - Tables: questions, ai_generation_logs
-- - Indexes for performance
-- - Row-Level Security (RLS) policies for data protection
-- - A trigger to automatically update the 'updated_at' timestamp on the 'questions' table.

--
-- Step 1: Create Custom ENUM Types
--

-- Used to track the origin of a question
create type public.question_source as enum ('user', 'ai', 'ai-edited');

-- Used to track the status of an AI generation task
create type public.generation_status as enum ('success', 'error');

--
-- Step 2: Create 'ai_generation_logs' Table
-- This table must be created before 'questions' because 'questions' has a foreign key reference to it.
--
create table public.ai_generation_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    finished_at timestamptz null,
    status public.generation_status null,
    prompt varchar(100000) not null,
    response varchar(100000) null,
    error_details text null
);

--
-- Step 3: Create 'questions' Table
--
create table public.questions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_log_id uuid null references public.ai_generation_logs(id) on delete set null,
    question varchar(10000) not null,
    answer varchar(10000) null,
    source public.question_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

--
-- Step 4: Create Indexes
--

-- Indexes on 'questions' table
create index on public.questions (user_id);
create index on public.questions (created_at desc);
create extension if not exists pg_trgm;
create index on public.questions using gin (question gin_trgm_ops);

-- Indexes on 'ai_generation_logs' table
create index on public.ai_generation_logs (user_id);

--
-- Step 5: Enable Row-Level Security (RLS)
--

-- RLS for 'questions' table
alter table public.questions enable row level security;

-- Policies for authenticated users
create policy "Allow authenticated read access" on public.questions
for select to authenticated using (auth.uid() = user_id);

create policy "Allow authenticated insert access" on public.questions
for insert to authenticated with check (auth.uid() = user_id);

create policy "Allow authenticated update access" on public.questions
for update to authenticated using (auth.uid() = user_id);

create policy "Allow authenticated delete access" on public.questions
for delete to authenticated using (auth.uid() = user_id);

-- Policies for anonymous users
create policy "Disallow anonymous read access" on public.questions
for select to anon using (false);

create policy "Disallow anonymous insert access" on public.questions
for insert to anon with check (false);

create policy "Disallow anonymous update access" on public.questions
for update to anon using (false);

create policy "Disallow anonymous delete access" on public.questions
for delete to anon using (false);


-- RLS for 'ai_generation_logs' table
alter table public.ai_generation_logs enable row level security;

-- Policies for authenticated users
create policy "Allow authenticated read access" on public.ai_generation_logs
for select to authenticated using (auth.uid() = user_id);

create policy "Allow authenticated insert access" on public.ai_generation_logs
for insert to authenticated with check (auth.uid() = user_id);

create policy "Disallow authenticated update access" on public.ai_generation_logs
for update to authenticated using (false);

create policy "Disallow authenticated delete access" on public.ai_generation_logs
for delete to authenticated using (false);

-- Policies for anonymous users
create policy "Disallow anonymous read access" on public.ai_generation_logs
for select to anon using (false);

create policy "Disallow anonymous insert access" on public.ai_generation_logs
for insert to anon with check (false);

create policy "Disallow anonymous update access" on public.ai_generation_logs
for update to anon using (false);

create policy "Disallow anonymous delete access" on public.ai_generation_logs
for delete to anon using (false);

--
-- Step 6: Create Trigger for 'updated_at'
--

-- 1. Create the trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 2. Attach the trigger to the 'questions' table
create trigger on_question_update
before update on public.questions
for each row
execute procedure public.handle_updated_at();
