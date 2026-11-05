-- ==============================================================================
-- MEMORIA CRITICAL FIX: RPC confirm_checkin & PostgREST Schema Grants
-- ==============================================================================

-- 1. Ensure confirm_checkin handles concurrency, method normalization, and proper returns
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
  v_safe_method TEXT;
  v_ticket_name TEXT;
BEGIN
  -- Normalize method to strictly 'qr' or 'manual'
  IF lower(COALESCE(p_method, '')) LIKE '%qr%' THEN
    v_safe_method := 'qr';
  ELSE
    v_safe_method := 'manual';
  END IF;

  -- --------------------------------------------------------------------------
  -- MAHASISWA (PARTICIPANT)
  -- --------------------------------------------------------------------------
  IF p_target_type = 'PARTICIPANT' THEN
    SELECT * INTO v_participant FROM public.participants WHERE id = p_target_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'NOT_FOUND',
        'message', 'Peserta tidak ditemukan dalam database.'
      );
    END IF;

    -- Only reject if participant itself is archived
    IF v_participant.status <> 'active' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'TICKET_ARCHIVED',
        'message', 'Tiket mahasiswa ini berstatus arsip / tidak aktif.'
      );
    END IF;

    -- Get ticket type name for display
    SELECT name INTO v_ticket_name FROM public.ticket_types WHERE id = v_participant.ticket_type_id;

    -- Check if already checked in
    SELECT * INTO v_existing_checkin FROM public.checkins WHERE participant_id = p_target_id;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', v_existing_checkin.checked_at,
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    END IF;

    v_new_id := gen_random_uuid();
    BEGIN
      INSERT INTO public.checkins (id, participant_id, checked_at, method, checked_by)
      VALUES (v_new_id, p_target_id, v_now, v_safe_method, p_staff_id);

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'CREATED',
        'checkedAt', v_now,
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    EXCEPTION WHEN unique_violation THEN
      -- Handle concurrency race condition: another staff just confirmed this millisecond
      SELECT * INTO v_existing_checkin FROM public.checkins WHERE participant_id = p_target_id;
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', COALESCE(v_existing_checkin.checked_at, v_now),
        'name', v_participant.full_name,
        'ticketName', COALESCE(v_ticket_name, 'Tiket Regular')
      );
    END;

  -- --------------------------------------------------------------------------
  -- DOSEN / VIP (LECTURER)
  -- --------------------------------------------------------------------------
  ELSIF p_target_type = 'LECTURER' THEN
    SELECT * INTO v_lecturer FROM public.lecturer_invitations WHERE id = p_target_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'NOT_FOUND',
        'message', 'Undangan dosen tidak ditemukan dalam database.'
      );
    END IF;

    IF NOT v_lecturer.is_active THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVITATION_INACTIVE',
        'message', 'Undangan dosen ini telah dinonaktifkan oleh panitia.'
      );
    END IF;

    SELECT * INTO v_existing_checkin FROM public.checkins WHERE lecturer_id = p_target_id;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', v_existing_checkin.checked_at,
        'name', v_lecturer.full_name,
        'ticketName', 'Undangan Dosen Kehormatan'
      );
    END IF;

    v_new_id := gen_random_uuid();
    BEGIN
      INSERT INTO public.checkins (id, lecturer_id, checked_at, method, checked_by)
      VALUES (v_new_id, p_target_id, v_now, v_safe_method, p_staff_id);

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'CREATED',
        'checkedAt', v_now,
        'name', v_lecturer.full_name,
        'ticketName', 'Undangan Dosen Kehormatan'
      );
    EXCEPTION WHEN unique_violation THEN
      SELECT * INTO v_existing_checkin FROM public.checkins WHERE lecturer_id = p_target_id;
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'checkedAt', COALESCE(v_existing_checkin.checked_at, v_now),
        'name', v_lecturer.full_name,
        'ticketName', 'Undangan Dosen Kehormatan'
      );
    END;

  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_TARGET_TYPE',
      'message', 'Tipe target kehadiran tidak valid.'
    );
  END IF;
END;
$$;

-- 2. Ensure claim_email_jobs function exists
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

-- Grant EXECUTE privileges so PostgREST exposes functions to RPC callers
GRANT EXECUTE ON FUNCTION public.confirm_checkin(TEXT, UUID, TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_email_jobs(INT, INT) TO anon, authenticated, service_role;

-- Ensure indexes for blazing-fast QR lookups
CREATE INDEX IF NOT EXISTS participants_qr_token_idx ON public.participants (qr_token);
CREATE INDEX IF NOT EXISTS lecturer_qr_token_idx ON public.lecturer_invitations (qr_token);
