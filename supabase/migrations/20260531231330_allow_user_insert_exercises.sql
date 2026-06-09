-- Migration: 20260531201500_allow_user_insert_exercises.sql
-- Description: Allow authenticated users to insert new exercises into the public.exercises table.

CREATE POLICY "Users can insert exercises"
ON public.exercises
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
