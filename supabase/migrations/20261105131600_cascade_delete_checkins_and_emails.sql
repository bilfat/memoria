-- Migration: Ensure foreign keys have ON DELETE CASCADE
-- Fixes error: update or delete on table "participants" violates foreign key constraint "checkins_participant_id_fkey" on table "checkins"

ALTER TABLE public.checkins
  DROP CONSTRAINT IF EXISTS checkins_participant_id_fkey,
  ADD CONSTRAINT checkins_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;

ALTER TABLE public.checkins
  DROP CONSTRAINT IF EXISTS checkins_lecturer_id_fkey,
  ADD CONSTRAINT checkins_lecturer_id_fkey
    FOREIGN KEY (lecturer_id) REFERENCES public.lecturer_invitations(id) ON DELETE CASCADE;

ALTER TABLE public.email_jobs
  DROP CONSTRAINT IF EXISTS email_jobs_participant_id_fkey,
  ADD CONSTRAINT email_jobs_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;

ALTER TABLE public.email_jobs
  DROP CONSTRAINT IF EXISTS email_jobs_lecturer_id_fkey,
  ADD CONSTRAINT email_jobs_lecturer_id_fkey
    FOREIGN KEY (lecturer_id) REFERENCES public.lecturer_invitations(id) ON DELETE CASCADE;

