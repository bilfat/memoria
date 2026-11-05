-- ==============================================================================
-- MEMORIA ATOMIC 1-STEP QR CHECKIN RPC: scan_qr_checkin
-- Eksekusi instan pemindaian QR presensi dalam 1 kali round-trip database (<5ms)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.scan_qr_checkin(
  p_qr_token TEXT,
  p_method TEXT DEFAULT 'qr',
  p_staff_id UUID DEFAULT NULL
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
  v_safe_method checkin_method;
  v_operator_name TEXT := 'Petugas Check-in';
BEGIN
  -- Normalisasi method
  IF lower(COALESCE(p_method, '')) LIKE '%manual%' THEN
    v_safe_method := 'manual'::checkin_method;
  ELSE
    v_safe_method := 'qr'::checkin_method;
  END IF;

  -- Dapatkan nama operator jika p_staff_id ada
  IF p_staff_id IS NOT NULL THEN
    SELECT name INTO v_operator_name FROM public.staff_profiles WHERE id = p_staff_id;
    IF v_operator_name IS NULL OR v_operator_name = '' THEN
      v_operator_name := 'Petugas Check-in';
    END IF;
  END IF;

  -- 1. Cari di tabel MAHASISWA (participants) berdasarkan qr_token
  SELECT p.*, tt.name AS ticket_type_name
  INTO v_participant
  FROM public.participants p
  LEFT JOIN public.ticket_types tt ON tt.id = p.ticket_type_id
  WHERE p.qr_token = p_qr_token;

  IF FOUND THEN
    IF v_participant.status <> 'active' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'TICKET_ARCHIVED',
        'message', 'Tiket mahasiswa ini berstatus arsip / tidak aktif.'
      );
    END IF;

    -- Periksa apakah sudah pernah check-in
    SELECT c.*, sp.name AS op_name
    INTO v_existing_checkin
    FROM public.checkins c
    LEFT JOIN public.staff_profiles sp ON sp.id = c.checked_by
    WHERE c.participant_id = v_participant.id;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'attendee', jsonb_build_object(
          'targetType', 'PARTICIPANT',
          'id', v_participant.id,
          'name', v_participant.full_name,
          'identifier', v_participant.nim,
          'subtext', v_participant.study_program || ' — ' || v_participant.faculty,
          'ticketName', COALESCE(v_participant.ticket_type_name, 'Tiket Regular'),
          'isCheckedIn', true,
          'checkedAt', v_existing_checkin.checked_at,
          'firstCheckedInAt', v_existing_checkin.checked_at,
          'operatorName', COALESCE(v_existing_checkin.op_name, v_operator_name),
          'checkinMethod', v_existing_checkin.method
        )
      );
    END IF;

    -- Insert check-in baru secara aman (dengan penanganan race condition)
    v_new_id := gen_random_uuid();
    BEGIN
      INSERT INTO public.checkins (id, participant_id, checked_at, method, checked_by)
      VALUES (v_new_id, v_participant.id, v_now, v_safe_method, p_staff_id);

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'CREATED',
        'attendee', jsonb_build_object(
          'targetType', 'PARTICIPANT',
          'id', v_participant.id,
          'name', v_participant.full_name,
          'identifier', v_participant.nim,
          'subtext', v_participant.study_program || ' — ' || v_participant.faculty,
          'ticketName', COALESCE(v_participant.ticket_type_name, 'Tiket Regular'),
          'isCheckedIn', true,
          'checkedAt', v_now,
          'firstCheckedInAt', v_now,
          'operatorName', v_operator_name,
          'checkinMethod', v_safe_method
        )
      );
    EXCEPTION WHEN unique_violation THEN
      SELECT c.*, sp.name AS op_name
      INTO v_existing_checkin
      FROM public.checkins c
      LEFT JOIN public.staff_profiles sp ON sp.id = c.checked_by
      WHERE c.participant_id = v_participant.id;

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'attendee', jsonb_build_object(
          'targetType', 'PARTICIPANT',
          'id', v_participant.id,
          'name', v_participant.full_name,
          'identifier', v_participant.nim,
          'subtext', v_participant.study_program || ' — ' || v_participant.faculty,
          'ticketName', COALESCE(v_participant.ticket_type_name, 'Tiket Regular'),
          'isCheckedIn', true,
          'checkedAt', COALESCE(v_existing_checkin.checked_at, v_now),
          'firstCheckedInAt', COALESCE(v_existing_checkin.checked_at, v_now),
          'operatorName', COALESCE(v_existing_checkin.op_name, v_operator_name),
          'checkinMethod', COALESCE(v_existing_checkin.method, v_safe_method)
        )
      );
    END;
  END IF;

  -- 2. Cari di tabel DOSEN (lecturer_invitations) berdasarkan qr_token
  SELECT *
  INTO v_lecturer
  FROM public.lecturer_invitations
  WHERE qr_token = p_qr_token;

  IF FOUND THEN
    IF NOT v_lecturer.is_active THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVITATION_INACTIVE',
        'message', 'Undangan dosen ini telah dinonaktifkan oleh panitia.'
      );
    END IF;

    -- Periksa apakah sudah pernah check-in
    SELECT c.*, sp.name AS op_name
    INTO v_existing_checkin
    FROM public.checkins c
    LEFT JOIN public.staff_profiles sp ON sp.id = c.checked_by
    WHERE c.lecturer_id = v_lecturer.id;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'attendee', jsonb_build_object(
          'targetType', 'LECTURER',
          'id', v_lecturer.id,
          'name', v_lecturer.full_name,
          'identifier', v_lecturer.email,
          'subtext', 'Tamu Undangan Dosen Kehormatan',
          'ticketName', 'Undangan Dosen Kehormatan',
          'isCheckedIn', true,
          'checkedAt', v_existing_checkin.checked_at,
          'firstCheckedInAt', v_existing_checkin.checked_at,
          'operatorName', COALESCE(v_existing_checkin.op_name, v_operator_name),
          'checkinMethod', v_existing_checkin.method
        )
      );
    END IF;

    v_new_id := gen_random_uuid();
    BEGIN
      INSERT INTO public.checkins (id, lecturer_id, checked_at, method, checked_by)
      VALUES (v_new_id, v_lecturer.id, v_now, v_safe_method, p_staff_id);

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'CREATED',
        'attendee', jsonb_build_object(
          'targetType', 'LECTURER',
          'id', v_lecturer.id,
          'name', v_lecturer.full_name,
          'identifier', v_lecturer.email,
          'subtext', 'Tamu Undangan Dosen Kehormatan',
          'ticketName', 'Undangan Dosen Kehormatan',
          'isCheckedIn', true,
          'checkedAt', v_now,
          'firstCheckedInAt', v_now,
          'operatorName', v_operator_name,
          'checkinMethod', v_safe_method
        )
      );
    EXCEPTION WHEN unique_violation THEN
      SELECT c.*, sp.name AS op_name
      INTO v_existing_checkin
      FROM public.checkins c
      LEFT JOIN public.staff_profiles sp ON sp.id = c.checked_by
      WHERE c.lecturer_id = v_lecturer.id;

      RETURN jsonb_build_object(
        'success', true,
        'outcome', 'ALREADY_CHECKED_IN',
        'attendee', jsonb_build_object(
          'targetType', 'LECTURER',
          'id', v_lecturer.id,
          'name', v_lecturer.full_name,
          'identifier', v_lecturer.email,
          'subtext', 'Tamu Undangan Dosen Kehormatan',
          'ticketName', 'Undangan Dosen Kehormatan',
          'isCheckedIn', true,
          'checkedAt', COALESCE(v_existing_checkin.checked_at, v_now),
          'firstCheckedInAt', COALESCE(v_existing_checkin.checked_at, v_now),
          'operatorName', COALESCE(v_existing_checkin.op_name, v_operator_name),
          'checkinMethod', COALESCE(v_existing_checkin.method, v_safe_method)
        )
      );
    END;
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'NOT_FOUND',
    'message', 'QR Code tidak terdaftar pada sistem.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.scan_qr_checkin(TEXT, TEXT, UUID) TO anon, authenticated, service_role;

