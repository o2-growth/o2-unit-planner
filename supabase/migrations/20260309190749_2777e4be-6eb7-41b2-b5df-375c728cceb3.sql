
-- Remove unique constraint on user_id to allow multiple simulations per user
ALTER TABLE public.simulations DROP CONSTRAINT IF EXISTS simulations_user_id_key;

-- Add is_active column
ALTER TABLE public.simulations ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Index for fast lookup of active simulation
CREATE INDEX IF NOT EXISTS idx_simulations_user_active ON public.simulations(user_id, is_active) WHERE is_active = true;
