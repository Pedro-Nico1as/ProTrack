-- Migration: 20260517125500_add_workout_partitions.sql
-- Description: Adds workout_partitions table and links it to session_exercises

-- 1. Create workout_partitions table
CREATE TABLE public.workout_partitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index for performance
CREATE INDEX idx_workout_partitions_plan_id ON public.workout_partitions(plan_id);

-- 3. RLS Policies for workout_partitions
ALTER TABLE public.workout_partitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partitions are viewable by everyone if plan is published" ON public.workout_partitions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.workout_plans 
        WHERE workout_plans.id = workout_partitions.plan_id 
        AND workout_plans.is_published = true
    )
);

-- 4. Alter session_exercises to replace session_id with partition_id
-- We drop the old policy that depended on session_id
DROP POLICY IF EXISTS "Session exercises are viewable by everyone" ON public.session_exercises;

-- Add partition_id
ALTER TABLE public.session_exercises ADD COLUMN partition_id UUID REFERENCES public.workout_partitions(id) ON DELETE CASCADE;

-- Drop old session_id to complete the replacement
ALTER TABLE public.session_exercises DROP COLUMN session_id CASCADE;

-- Create new policy for session_exercises using partition_id
CREATE POLICY "Session exercises are viewable by everyone via partition" ON public.session_exercises FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.workout_partitions
        JOIN public.workout_plans ON workout_partitions.plan_id = workout_plans.id
        WHERE workout_partitions.id = session_exercises.partition_id
        AND workout_plans.is_published = true
    )
);
