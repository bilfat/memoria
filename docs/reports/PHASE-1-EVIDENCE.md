# PHASE-1-EVIDENCE.md — Bukti Verifikasi Dua Lapis (2-Pass Gate) Phase 1
> **Tanggal Verifikasi:** 4 November 2026  
> **Status:** DONE_VERIFIED  
> **Verifikator:** Senior Full-Stack Engineer / Coding Agent

---

## Pass 1: Implementasi & Kelengkapan Fondasi
1. **Migration 8 Tabel Lengkap (`supabase/migrations/20261104085316_init_memoria_phase1_schema.sql`):**
   - `staff_profiles`: Relasi `auth.users`, role enum (`ADMIN_PANITIA`, `PETUGAS_CHECKIN`), case-insensitive email unik.
   - `event_settings`: Row tunggal (`id=1`), CMS Beranda, Band tunggal, Teaser, visibilitas halaman, JSONB template surat.
   - `ticket_types`: Status (`draft`, `published`, `archived`), kuota > 0 atau NULL (unlimited), validasi periode `close > open`.
   - `participants`: Whitelist 8 fakultas Telkom, prodi bebas, unik NIM normalized (`lower(btrim(nim))`), token QR & token akses web unik tak berubah.
   - `lecturer_invitations`: Undangan dosen, token permanen, QR permanen, email unik khusus status aktif.
   - `checkins`: Constraint XOR tepat satu FK (mahasiswa atau dosen), unik per orang (mencegah double check-in), audit petugas.
   - `audit_logs`: Jejak audit terstruktur tanpa menyimpan credential/secret.
   - `email_jobs`: Antrean Brevo asinkron dengan status lease, attempt counter, dan deduplication key.
2. **Atomic SQL RPC Functions:**
   - `register_participant`: Transaksi atomik lock ticket type, validasi jadwal, kuota, cek duplikat NIM, insert peserta & enqueue email.
   - `confirm_checkin`: Transaksi atomik verifikasi status aktif, identitas, dan idempotency (`CREATED` vs `ALREADY_CHECKED_IN`).
3. **RLS & Security Privileges:**
   - Seluruh 8 tabel diaktifkan RLS dengan `REVOKE ALL` dari role publik/anonim.
   - Hak akses publik hanya diizinkan untuk melihat `ticket_types` berstatus `published`.
   - Function RPC diproteksi dengan `REVOKE EXECUTE` dan hanya dapat dipanggil via `service_role`.
4. **Environment Template (`.env.example`):**
   - Menyediakan panduan konfigurasi Supabase (URL, anon key, service role key), Brevo API, dan CRON_SECRET tanpa membocorkan rahasia.
5. **Supabase Client Architecture (`src/lib/supabase/`):**
   - `client.ts`: Browser SSR client via `@supabase/ssr`.
   - `server.ts`: Server Component / Action authenticated client via Next.js cookies.
   - `admin.ts`: Service Role privileged client untuk background job & RPC transaksi.
   - `src/lib/validations.ts`: Validasi Zod form & API error envelope standar.

---

## Pass 2: Cross-Check Independen & Validasi Ketat
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - Seluruh modul baru (`src/lib/supabase/*`, `src/lib/validations.ts`) lolos typecheck dengan **exit code 0** (0 errors).
2. **Pengecekan Konsistensi Constraint:**
   - Schema mematuhi 100% spesifikasi PRD Backend Phase 1 (8 fakultas Telkom, satu band, NIM unik termasuk arsip, QR token opaque).
3. **Konfirmasi Gate:**
   - Semua checklist PHASE 1 telah lengkap dan terverifikasi.
   - Gerbang PHASE 1 dinyatakan **PASS**.

