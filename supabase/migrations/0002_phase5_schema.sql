-- Phase 5 schema changes
-- Adds: app_role enum, profiles table, phone_usage table, qr_codes alterations, auto-profile trigger

-- ─── 1. app_role enum ────────────────────────────────────────────────────────

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- ─── 2. profiles table ───────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text,
  phone_number text,
  role         app_role NOT NULL DEFAULT 'user',
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ─── 3. Auto-profile trigger ─────────────────────────────────────────────────
-- Creates a profile row automatically whenever a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── 4. phone_usage table ────────────────────────────────────────────────────
-- No RLS — accessed exclusively via service-role admin client.

CREATE TABLE public.phone_usage (
  phone_number text PRIMARY KEY,
  usage_count  integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── 5. qr_codes alterations ─────────────────────────────────────────────────
-- Allow public (phone-verified) QR creation without a signed-in user account.

ALTER TABLE public.qr_codes
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.qr_codes
  ADD COLUMN phone_number text;

-- Partial index for efficient lookup of unlinked phone-created QR codes.
CREATE INDEX idx_qr_codes_phone_unlinked
  ON public.qr_codes (phone_number)
  WHERE user_id IS NULL;
