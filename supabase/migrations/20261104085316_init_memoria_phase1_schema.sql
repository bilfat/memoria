-- ==============================================================================
-- MEMORIA 2026 — Phase 1 Database Migration
-- ==============================================================================
-- 8 Tabel Inti:
-- 1. staff_profiles
-- 2. event_settings
-- 3. ticket_types 
-- 4. participants
-- 5. lecturer_invitations
-- 6. checkins
-- 7. audit_logs
-- 8. email_jobs
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. STAFF PROFILES (Internal Accounts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN_PANITIA', 'PETUGAS_CHECKIN')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS staff_profiles_email_lower_uidx
  ON public.staff_profiles (lower(btrim(email)));

-- ------------------------------------------------------------------------------
-- 2. EVENT SETTINGS (Single-row CMS Event & Countdown)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  event_name TEXT NOT NULL DEFAULT 'MEMORIA',
  tagline TEXT DEFAULT 'Velvet Night — Diesnatalis SIKC 2026',
  description TEXT DEFAULT 'Satu malam istimewa perayaan Diesnatalis D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.',
  event_start_at TIMESTAMPTZ NOT NULL DEFAULT '2026-11-20T18:30:00+07:00',
  event_end_at TIMESTAMPTZ DEFAULT '2026-11-20T23:00:00+07:00',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  venue_name TEXT NOT NULL DEFAULT 'Grand Ballroom & Theatre Hall',
  venue_address TEXT DEFAULT 'Telkom University Landmark Hall, Gedung Selaru Lt. 4, Bandung',
  footer_text TEXT DEFAULT 'MEMORIA 2026 — Himpunan Mahasiswa D4 Sistem Informasi Kota Cerdas, Fakultas Ilmu Terapan.',
  band_name TEXT DEFAULT 'Fosca Band',
  band_description TEXT DEFAULT 'Band beraliran indie-pop orchestral yang membawakan harmoni melodi hangat bernuansa sinematik teater.',
  band_image_path TEXT DEFAULT '/images/band-silhouette.png',
  fashion_title TEXT DEFAULT 'Panggung Fashion Show',
  fashion_description TEXT DEFAULT 'Panggung runway berbalut beludru merah dengan parade busana haute couture & carnival theatrical yang memukau karya civitas akademika SIKC.',
  fashion_image_path TEXT DEFAULT '/images/fashion-model-clean.png',
  awarding_title TEXT DEFAULT 'The Golden Moment Awarding',
  awarding_description TEXT DEFAULT 'Penghargaan kehormatan tahunan untuk mahasiswa berprestasi, inovasi digital terunggul, dan kontributor terbaik SIKC.',
  fashion_page_visible BOOLEAN NOT NULL DEFAULT true,
  awarding_page_visible BOOLEAN NOT NULL DEFAULT true,
  invitation_template JSONB NOT NULL DEFAULT '{
    "subject": "Undangan Kehormatan Diesnatalis SIKC 2026 — MEMORIA: Velvet Night",
    "greeting": "Kepada Yth. Bapak/Ibu Dosen Pengajar SIKC, {{nama_dosen}}",
    "body": "Dengan penuh rasa hormat dan sukacita, Civitas Akademika D4 Sistem Informasi Kota Cerdas mengundang Bapak/Ibu untuk berkenan hadir sebagai Tamu Kehormatan pada malam puncak Diesnatalis SIKC 2026 MEMORIA — Velvet Night.",
    "closing": "Atas perhatian, bimbingan, dan kehadiran Bapak/Ibu, kami haturkan terima kasih yang sebesar-besarnya.",
    "senderName": "Panitia Pelaksana MEMORIA & Himpunan Mahasiswa SIKC 2026"
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_event_end_after_start CHECK (event_end_at IS NULL OR event_end_at >= event_start_at)
);

-- ------------------------------------------------------------------------------
-- 3. TICKET TYPES (Free tickets with dynamic derived status)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NULL CHECK (capacity IS NULL OR capacity > 0),
  registration_open_at TIMESTAMPTZ NOT NULL,
  registration_close_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_registration_period CHECK (registration_close_at > registration_open_at)
);

CREATE INDEX IF NOT EXISTS ticket_types_public_idx
  ON public.ticket_types (status, registration_open_at, registration_close_at);

-- ------------------------------------------------------------------------------
-- 4. PARTICIPANTS (Mahasiswa Telkom from 8 Faculties)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  nim TEXT NOT NULL,
  study_program TEXT NOT NULL,
  faculty TEXT NOT NULL CHECK (faculty IN (
    'Fakultas Ilmu Terapan',
    'Fakultas Komunikasi Sosial',
    'Fakultas Ekonomi Bisnis',
    'Fakultas Industri Kreatif',
    'Fakultas Informatika',
    'Fakultas Teknik Elektro',
    'Fakultas Kedokteran',
    'Fakultas Rekayasa Industri'
  )),
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
  ticket_number TEXT UNIQUE NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  ticket_access_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  idempotency_key TEXT UNIQUE NULL,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive trimmed unique NIM across active & archived participants
CREATE UNIQUE INDEX IF NOT EXISTS participants_nim_unique_idx
  ON public.participants (lower(btrim(nim)));

CREATE INDEX IF NOT EXISTS participants_type_status_idx
  ON public.participants (ticket_type_id, status);

CREATE INDEX IF NOT EXISTS participants_created_idx
  ON public.participants (created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. LECTURER INVITATIONS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lecturer_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  invitation_code TEXT UNIQUE NOT NULL,
  public_token TEXT UNIQUE NOT NULL,
  qr_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique email case-insensitive ONLY for ACTIVE invitations
CREATE UNIQUE INDEX IF NOT EXISTS lecturer_active_email_unique_idx
  ON public.lecturer_invitations (lower(btrim(email)))
  WHERE is_active = true;

-- ------------------------------------------------------------------------------
-- 6. CHECKINS (Single Check-in Attendance XOR Mahasiswa / Dosen)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  lecturer_id UUID NULL REFERENCES public.lecturer_invitations(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  method TEXT NOT NULL CHECK (method IN ('qr', 'manual')),
  checked_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  CONSTRAINT checkins_exactly_one_target CHECK (
    (participant_id IS NOT NULL AND lecturer_id IS NULL) OR
    (participant_id IS NULL AND lecturer_id IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS checkins_participant_once_idx
  ON public.checkins(participant_id) WHERE participant_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS checkins_lecturer_once_idx
  ON public.checkins(lecturer_id) WHERE lecturer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS checkins_checked_at_desc_idx
  ON public.checkins(checked_at DESC);

-- ------------------------------------------------------------------------------
-- 7. AUDIT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NULL REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_desc_idx
  ON public.audit_logs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 8. EMAIL JOBS (Asynchronous Brevo Delivery Queue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('ticket_initial', 'ticket_resend', 'lecturer_invitation')),
  participant_id UUID NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  lecturer_id UUID NULL REFERENCES public.lecturer_invitations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  dedupe_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'retry', 'sent', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0,
  run_after TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ NULL,
  lease_until TIMESTAMPTZ NULL,
  provider_message_id TEXT NULL,
  last_error_code TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS email_jobs_status_run_idx
  ON public.email_jobs (status, run_after);

CREATE INDEX IF NOT EXISTS email_jobs_lease_idx
  ON public.email_jobs (lease_until);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) & GRANTS
-- ------------------------------------------------------------------------------
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecturer_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

-- Revoke default public direct table access
REVOKE ALL ON public.staff_profiles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.event_settings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ticket_types FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.participants FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.lecturer_invitations FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.checkins FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.audit_logs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.email_jobs FROM PUBLIC, anon, authenticated;

-- Service role has full permissions for server-side trusted execution
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Public can read ticket_types (published only)
CREATE POLICY "Public can view published ticket types"
  ON public.ticket_types FOR SELECT
  TO anon, authenticated
  USING (status = 'published');
GRANT SELECT ON public.ticket_types TO anon, authenticated;

-- Staff profile policies: user can read their own profile
CREATE POLICY "Staff can view own profile"
  ON public.staff_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
GRANT SELECT ON public.staff_profiles TO authenticated;

-- ------------------------------------------------------------------------------
-- SQL ATOMIC TRANSACTION FUNCTIONS
-- ------------------------------------------------------------------------------

-- Sequence for Ticket Number: MEM-26-XXXX
CREATE SEQUENCE IF NOT EXISTS public.ticket_number_seq START WITH 1;

-- RPC: register_participant (Atomic transaction)
CREATE OR REPLACE FUNCTION public.register_participant(
  p_ticket_type_id UUID,
  p_full_name TEXT,
  p_nim TEXT,
  p_study_program TEXT,
  p_faculty TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_idempotency_key TEXT,
  p_qr_token TEXT,
  p_ticket_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ticket_type RECORD;
  v_active_count INTEGER;
  v_existing RECORD;
  v_ticket_number TEXT;
  v_participant_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_existing
    FROM public.participants
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'participantId', v_existing.id,
        'ticketNumber', v_existing.ticket_number,
        'ticketAccessToken', v_existing.ticket_access_token,
        'isIdempotentReplay', true
      );
    END IF;
  END IF;

  -- 2. Check Duplicate NIM (Normalized)
  SELECT * INTO v_existing
  FROM public.participants
  WHERE lower(btrim(nim)) = lower(btrim(p_nim));

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'DUPLICATE_NIM',
      'message', 'NIM ini sudah terdaftar untuk tiket MEMORIA (termasuk status arsip).'
    );
  END IF;

  -- 3. Lock & Validate Ticket Type
  SELECT * INTO v_ticket_type
  FROM public.ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TICKET_TYPE_NOT_FOUND',
      'message', 'Jenis tiket tidak ditemukan.'
    );
  END IF;

  IF v_ticket_type.status <> 'published' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TICKET_NOT_OPEN',
      'message', 'Pendaftaran untuk tiket ini tidak aktif.'
    );
  END IF;

  IF v_now < v_ticket_type.registration_open_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TICKET_NOT_YET_OPEN',
      'message', 'Pendaftaran untuk tiket ini belum dibuka.'
    );
  END IF;

  IF v_now > v_ticket_type.registration_close_at THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TICKET_REGISTRATION_CLOSED',
      'message', 'Pendaftaran tiket ini telah ditutup.'
    );
  END IF;

  -- 4. Check Capacity
  IF v_ticket_type.capacity IS NOT NULL THEN
    SELECT count(*) INTO v_active_count
    FROM public.participants
    WHERE ticket_type_id = p_ticket_type_id AND status = 'active';

    IF v_active_count >= v_ticket_type.capacity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'TICKET_SOLD_OUT',
        'message', 'Kuota tiket ini telah habis.'
      );
    END IF;
  END IF;

  -- 5. Generate Ticket Number
  v_ticket_number := 'MEM-26-' || lpad(nextval('public.ticket_number_seq')::text, 4, '0');
  v_participant_id := gen_random_uuid();

  -- 6. Insert Participant
  INSERT INTO public.participants (
    id, full_name, nim, study_program, faculty, phone, email,
    ticket_type_id, ticket_number, qr_token, ticket_access_token,
    status, idempotency_key, created_at, updated_at
  ) VALUES (
    v_participant_id, p_full_name, btrim(p_nim), p_study_program, p_faculty, p_phone, p_email,
    p_ticket_type_id, v_ticket_number, p_qr_token, p_ticket_access_token,
    'active', p_idempotency_key, v_now, v_now
  );

  -- 7. Enqueue Initial Email Job
  INSERT INTO public.email_jobs (
    kind, participant_id, recipient_email, dedupe_key, status, run_after
  ) VALUES (
    'ticket_initial', v_participant_id, p_email,
    'ticket_initial_' || v_participant_id::text,
    'pending', v_now
  );

  RETURN jsonb_build_object(
    'success', true,
    'participantId', v_participant_id,
    'ticketNumber', v_ticket_number,
    'ticketAccessToken', p_ticket_access_token,
    'isIdempotentReplay', false
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.register_participant FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_participant TO service_role;

-- RPC: confirm_checkin (Atomic transaction)
CREATE OR REPLACE FUNCTION public.confirm_checkin(
  p_target_type TEXT, -- 'PARTICIPANT' or 'LECTURER'
  p_target_id UUID,
  p_method TEXT,
  p_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_participant RECORD;
  v_lecturer RECORD;
  v_existing_checkin RECORD;
  v_new_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_target_type = 'PARTICIPANT' THEN
    SELECT * INTO v_participant FROM public.participants WHERE id = p_target_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Peserta tidak ditemukan.');
    END IF;
    IF v_participant.status <> 'active' THEN
      RETURN jsonb_build_object('success', false, 'error', 'TICKET_ARCHIVED', 'message', 'Tiket ini berstatus arsip / tidak aktif.');
    END IF;

    SELECT * INTO v_existing_checkin FROM public.checkins WHERE participant_id = p_target_id;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', v_existing_checkin.checked_at,
        'name', v_participant.full_name
      );
    END IF;

    v_new_id := gen_random_uuid();
    INSERT INTO public.checkins (id, participant_id, checked_at, method, checked_by)
    VALUES (v_new_id, p_target_id, v_now, p_method, p_staff_id);

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'CREATED',
      'checkedAt', v_now,
      'name', v_participant.full_name,
      'ticketName', (SELECT name FROM public.ticket_types WHERE id = v_participant.ticket_type_id)
    );

  ELSIF p_target_type = 'LECTURER' THEN
    SELECT * INTO v_lecturer FROM public.lecturer_invitations WHERE id = p_target_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'NOT_FOUND', 'message', 'Undangan dosen tidak ditemukan.');
    END IF;
    IF NOT v_lecturer.is_active THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVITATION_INACTIVE', 'message', 'Undangan ini telah dinonaktifkan.');
    END IF;

    SELECT * INTO v_existing_checkin FROM public.checkins WHERE lecturer_id = p_target_id;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', v_existing_checkin.checked_at,
        'name', v_lecturer.full_name
      );
    END IF;

    v_new_id := gen_random_uuid();
    INSERT INTO public.checkins (id, lecturer_id, checked_at, method, checked_by)
    VALUES (v_new_id, p_target_id, v_now, p_method, p_staff_id);

    RETURN jsonb_build_object(
      'success', true,
      'outcome', 'CREATED',
      'checkedAt', v_now,
      'name', v_lecturer.full_name,
      'ticketName', 'Undangan Dosen Kehormatan'
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_TARGET_TYPE', 'message', 'Tipe target tidak valid.');
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_checkin FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_checkin TO service_role;

-- ------------------------------------------------------------------------------
-- RPC: claim_email_jobs (Atomic queue leasing with SKIP LOCKED)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_email_jobs(
  p_limit INT DEFAULT 10,
  p_lease_seconds INT DEFAULT 300
)
RETURNS SETOF public.email_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.email_jobs
  SET status = 'processing',
      locked_at = now(),
      lease_until = now() + (p_lease_seconds || ' seconds')::interval,
      attempts = attempts + 1,
      updated_at = now()
  WHERE id IN (
    SELECT id FROM public.email_jobs
    WHERE status IN ('pending', 'retry')
      AND run_after <= now()
      AND (lease_until IS NULL OR lease_until < now())
    ORDER BY run_after ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_email_jobs FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_email_jobs TO service_role;


