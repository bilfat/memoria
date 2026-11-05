-- Migration: Drop event_end_at and related check constraint from event_settings
-- Sesuai keputusan terbaru: hanya ada satu patokan waktu acara (event_start_at), tanpa waktu selesai.
ALTER TABLE event_settings DROP CONSTRAINT IF EXISTS chk_event_end_after_start;
ALTER TABLE event_settings DROP COLUMN IF EXISTS event_end_at;

