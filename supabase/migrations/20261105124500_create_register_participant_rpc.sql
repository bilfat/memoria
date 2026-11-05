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
    v_participant_id, p_full_name, btrim(p_nim), p_study_program, p_faculty, btrim(p_phone), lower(btrim(p_email)),
    p_ticket_type_id, v_ticket_number, p_qr_token, p_ticket_access_token,
    'active', p_idempotency_key, v_now, v_now
  );

  -- 7. Enqueue Initial Email Job
  INSERT INTO public.email_jobs (
    kind, participant_id, recipient_email, dedupe_key, status, run_after
  ) VALUES (
    'ticket_initial', v_participant_id, lower(btrim(p_email)),
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

GRANT EXECUTE ON FUNCTION public.register_participant TO service_role, anon, authenticated;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

