-- =============================================================================
-- Migration: 0001_create_qr_codes
-- Creates the qr_codes table with RLS, trigger, index, and RPC function.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE public.qr_codes (
  id             uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug           text        NOT NULL UNIQUE,
  label          text        NOT NULL,
  platform       text        NOT NULL CHECK (platform IN ('whatsapp', 'sms', 'telegram')),
  contact_target text        NOT NULL,
  default_message text,
  is_active      boolean     NOT NULL DEFAULT true,
  scan_count     integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- INDEX: Partial index for fast proxy lookups (slug WHERE is_active = true)
-- -----------------------------------------------------------------------------
CREATE INDEX idx_qr_codes_slug_active ON public.qr_codes (slug) WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- TRIGGER: Auto-update updated_at on every row UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER qr_codes_updated_at
  BEFORE UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- RLS: Enable row-level security
-- -----------------------------------------------------------------------------
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- RLS POLICIES: Owner CRUD (4 policies) + Public SELECT for scanner proxy
-- -----------------------------------------------------------------------------

-- Owners can SELECT their own rows
CREATE POLICY "owner_select" ON public.qr_codes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Owners can INSERT rows for themselves
CREATE POLICY "owner_insert" ON public.qr_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owners can UPDATE their own rows
CREATE POLICY "owner_update" ON public.qr_codes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owners can DELETE (soft-delete) their own rows
CREATE POLICY "owner_delete" ON public.qr_codes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Unauthenticated users can SELECT active rows (scanner proxy)
-- Postgres RLS uses OR logic — either owner_select or this policy passes.
CREATE POLICY "public_select_active" ON public.qr_codes
  FOR SELECT
  USING (is_active = true);

-- -----------------------------------------------------------------------------
-- RPC: Atomic scan count increment (SECURITY DEFINER to bypass RLS safely)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_scan_count(qr_slug text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1
  WHERE slug = qr_slug AND is_active = true;
END;
$$;
