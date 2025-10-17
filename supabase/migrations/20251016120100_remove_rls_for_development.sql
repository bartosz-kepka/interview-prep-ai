-- migration: 20251016120100_remove_rls_for_development.sql
-- description: Removes restrictive RLS policies and applies permissive policies for development.
--
-- This migration facilitates a more open development environment by:
-- 1. Dropping all existing RLS policies on the 'questions' and 'ai_generation_logs' tables.
-- 2. Creating new, permissive RLS policies that grant full access (SELECT, INSERT, UPDATE, DELETE)
--    to both 'authenticated' and 'anon' roles for these tables.
--
-- WARNING: This migration is intended for development purposes only and significantly
-- reduces data security. Do not apply in a production environment.

--
-- Step 1: Drop Existing RLS Policies for 'questions' table
--
drop policy if exists "Allow authenticated read access" on public.questions;
drop policy if exists "Allow authenticated insert access" on public.questions;
drop policy if exists "Allow authenticated update access" on public.questions;
drop policy if exists "Allow authenticated delete access" on public.questions;
drop policy if exists "Disallow anonymous read access" on public.questions;
drop policy if exists "Disallow anonymous insert access" on public.questions;
drop policy if exists "Disallow anonymous update access" on public.questions;
drop policy if exists "Disallow anonymous delete access" on public.questions;

--
-- Step 2: Drop Existing RLS Policies for 'ai_generation_logs' table
--
drop policy if exists "Allow authenticated read access" on public.ai_generation_logs;
drop policy if exists "Allow authenticated insert access" on public.ai_generation_logs;
drop policy if exists "Disallow authenticated update access" on public.ai_generation_logs;
drop policy if exists "Disallow authenticated delete access" on public.ai_generation_logs;
drop policy if exists "Disallow anonymous read access" on public.ai_generation_logs;
drop policy if exists "Disallow anonymous insert access" on public.ai_generation_logs;
drop policy if exists "Disallow anonymous update access" on public.ai_generation_logs;
drop policy if exists "Disallow anonymous delete access" on public.ai_generation_logs;

--
-- Step 3: Create Permissive RLS Policies for 'questions' table
-- These policies grant full access to all users for easier development.
--
create policy "Allow all access for development (anon)" on public.questions
for all to anon using (true) with check (true);

create policy "Allow all access for development (authenticated)" on public.questions
for all to authenticated using (true) with check (true);

--
-- Step 4: Create Permissive RLS Policies for 'ai_generation_logs' table
-- These policies grant full access to all users for easier development.
--
create policy "Allow all access for development (anon)" on public.ai_generation_logs
for all to anon using (true) with check (true);

create policy "Allow all access for development (authenticated)" on public.ai_generation_logs
for all to authenticated using (true) with check (true);

