# Laporan Implementasi Backend & Integrasi Sistem (BACKEND-IMPLEMENTATION-REPORT)

**Proyek:** MEMORIA — Diesnatalis SIKC 2026  
**Tanggal Rilis:** 2026-11-04  
**Arsitektur Target:** Next.js 16.4.3 (App Router, Turbopack, Partial Prerendering) + Supabase PostgreSQL (RLS, SQL RPC, Sequences) + Brevo Transactional Email  
**Status Gate Keseluruhan:** `DONE_VERIFIED` (Phase 0 – Phase 14)

---

## 1. Modul Implementasi & Arsitektur Sistem

Sistem backend MEMORIA Phase 1 dibangun dengan integritas ACID PostgreSQL, isolasi Row Level Security (RLS), pencegahan *race condition* melalui transaksi atomik, dan antrean *asynchronous job queue* untuk pengiriman email transaksional.

### A. Tabel Database & SQL Migrations
- **Migration Script:** [`supabase/migrations/20261104085316_init_memoria_phase1_schema.sql`](file:///d:/website%20latihan/memoria/supabase/migrations/20261104085316_init_memoria_phase1_schema.sql)
- **Tabel Domain (8 Tabel):**
  1. `staff_profiles`: Akun panitia internal (`id`, `full_name`, `email`, `role`, `is_active`, `created_at`, `updated_at`).
  2. `event_settings`: Singleton konfigurasi acara, tema, panggung band, teaser fashion/awarding, template undangan, visibilitas halaman.
  3. `ticket_types`: Kategori tiket gratis, kapasitas kuota, rentang buka/tutup pendaftaran, status (`draft`, `published`, `archived`).
  4. `participants`: Data mahasiswa Telkom University, tiket nomor unik (`MEM-26-XXXX`), token QR check-in, token akses web, status.
  5. `lecturer_invitations`: Undangan dosen VIP, kode undangan (`DOS-26-XXXX`), token QR check-in, token web personal, status aktif.
  6. `checkins`: Presensi kehadiran atomik di venue, foreign key tunggal XOR (`participant_id` vs `lecturer_id`), method, staff operator, timestamp WIB.
  7. `audit_logs`: Jejak audit perubahan data sensitif oleh panitia.
  8. `email_jobs`: Antrean pengiriman email Brevo berbasis leasing (`FOR UPDATE SKIP LOCKED`) dan *exponential backoff*.

### B. Transaksi Atomik SQL RPC
1. `register_participant`: Menjamin registrasi kuota aman dari *race condition*, keunikan NIM per kategori tiket, nomor urut tiket sekuensial (`public.ticket_number_seq`), serta otomatis mendaftarkan *initial email job*.
2. `confirm_checkin`: Presensi tunggal atomik berkecepatan tinggi, mendeteksi *duplicate check-in* (`ALREADY_CHECKED_IN`) tanpa menimpa timestamp awal, dan mengembalikan status `CREATED` untuk presensi pertama.
3. `claim_email_jobs`: Pengambilan batch antrean email dengan kuncian baris `SKIP LOCKED` untuk worker asinkron yang aman dari duplikasi pengiriman.

---

## 2. Kontrak 7 Route Handlers Minimum

| Route | HTTP Method | Hak Akses | Deskripsi & Kontrak Payload |
|---|---|---|---|
| `/api/registrations` | `POST` | Publik | Menerima data pendaftaran mahasiswa 8 fakultas Telkom, validasi Zod, memanggil RPC `register_participant`. Response 201 dengan `ticketAccessToken` atau 400 typed error. |
| `/api/tickets/[token]/pdf` | `GET` | Publik (Personal Token) | Menghasilkan streaming biner PDF resmi (`application/pdf`) dengan QR Code beresolusi tinggi dan stempel tiket. |
| `/api/checkins/resolve` | `POST` | Panitia / Petugas | Memverifikasi QR token kamera atau lookup manual (NIM/Email/Kode), menghasilkan `resolutionToken` HMAC SHA-256 (masa aktif 5 menit). |
| `/api/checkins/confirm` | `POST` | Panitia / Petugas | Memvalidasi HMAC resolution token dan mengeksekusi RPC `confirm_checkin`. Outcome `CREATED` atau `ALREADY_CHECKED_IN`. |
| `/api/uploads/authorize` | `POST` | Admin Panitia | Mengotorisasi upload gambar Storage Supabase yang telah dikompresi di client (< 10 MB). |
| `/api/admin/participants/export` | `GET` | Admin Panitia | Mengunduh berkas spreadsheet `.xlsx` tersanitasi formula injection dengan format string pada kolom NIM/telepon. |
| `/api/internal/email-worker` | `GET` | Cron Secret / Admin | Memproses batch antrean `email_jobs` dan mengirimkan email melalui API Brevo v3. |

---

## 3. Server Actions & Layanan Data

1. **Autentikasi & Akun ([`src/app/actions/auth.ts`](file:///d:/website%20latihan/memoria/src/app/actions/auth.ts)):**
   - `loginAction`, `logoutAction`, `getCurrentStaffSession`, `listAccountsAction`, `saveAccountAction`, `toggleAccountStatusAction`, `resetAccountPasswordAction`.
   - Proteksi Last Admin: Menolak deaktivasi akun Admin terakhir di sistem.
2. **CMS Website ([`src/app/actions/cms.ts`](file:///d:/website%20latihan/memoria/src/app/actions/cms.ts)):**
   - `getPublicCmsDataAction`, `getAdminCmsSettingsAction`, `saveBerandaCmsAction`, `saveBandCmsAction`, `saveFashionCmsAction`, `saveAwardingCmsAction`, `toggleModuleVisibilityAction`.
3. **Manajemen Tiket ([`src/app/actions/tickets.ts`](file:///d:/website%20latihan/memoria/src/app/actions/tickets.ts)):**
   - `getPublicTicketsAction`, `listAdminTicketsAction`, `getAdminTicketAction`, `saveTicketAction`, `toggleTicketPublishAction`, `archiveTicketAction`.
   - Perhitungan status otomatis: `UPCOMING`, `OPEN`, `SOLD_OUT`, `CLOSED` berbasis waktu server WIB dan kapasitas.
4. **Data Peserta ([`src/app/actions/participants.ts`](file:///d:/website%20latihan/memoria/src/app/actions/participants.ts)):**
   - `listAdminParticipantsAction`, `getAdminParticipantDetailAction`, `updateParticipantAction` (2-tahap verifikasi password), `archiveParticipantAction` (konfirmasi "HAPUS" & password), `restoreParticipantAction` (validasi kuota).
5. **Undangan Dosen ([`src/app/actions/invitations.ts`](file:///d:/website%20latihan/memoria/src/app/actions/invitations.ts)):**
   - `getInvitationTemplateAction`, `updateInvitationTemplateAction`, `listLecturerInvitationsAction`, `saveLecturerInvitationAction` (kode & token immutable), `toggleLecturerActiveAction`, `getPublicInvitationByTokenAction`.
6. **Presensi & Dashboard ([`src/app/actions/checkins.ts`](file:///d:/website%20latihan/memoria/src/app/actions/checkins.ts) & [`src/app/actions/dashboard.ts`](file:///d:/website%20latihan/memoria/src/app/actions/dashboard.ts)):**
   - `getCheckinHistoryAction`, `getDashboardMetricsAction` (agregat nyata DB, honest zero state).

---

## 4. Pemetaan 1:1 Halaman, Aksi, dan Sumber Data

| Halaman UI | Elemen / Tombol / Aksi | Handler / Action | Sumber Tabel DB | Status |
|---|---|---|---|---|
| `/` (Beranda) | Hero Countdown & Panggung Band | Server Component `getPublicCmsDataAction` | `event_settings` | `SUPPORTED` |
| `/fashion-show` | Status Tayang / Coming Soon | Server Component `getPublicCmsDataAction` | `event_settings.fashion_page_visible` | `SUPPORTED` |
| `/awarding` | Status Tayang / Coming Soon | Server Component `getPublicCmsDataAction` | `event_settings.awarding_page_visible` | `SUPPORTED` |
| `/daftar` | Daftar Tiket & Kuota Real-time | Server Component `getPublicTicketsAction` | `ticket_types`, `participants` | `SUPPORTED` |
| `/daftar/[ticketId]` | Submit Form Registrasi Mahasiswa | Client `fetch('/api/registrations')` | RPC `register_participant` | `SUPPORTED` |
| `/tiket/[token]` | Cetak & Unduh PDF Tiket | Client `fetch('/api/tickets/[token]/pdf')` | `participants`, `event_settings` | `SUPPORTED` |
| `/undangan/[inviteToken]`| Amplop 3D & E-Pass Dosen VIP | Server Action `getPublicInvitationByTokenAction` | `lecturer_invitations`, `event_settings` | `SUPPORTED` |
| `/panitia` | Ringkasan KPI & Riwayat Terkini | Server Action `getDashboardMetricsAction` | `participants`, `checkins`, `ticket_types` | `SUPPORTED` |
| `/panitia/login` | Form Login Admin / Petugas | Server Action `loginAction` | `staff_profiles` via Supabase Auth | `SUPPORTED` |
| `/panitia/tiket` | Tambah/Edit/Publish/Arsip Tiket | Server Action `saveTicketAction`, `toggle...` | `ticket_types` | `SUPPORTED` |
| `/panitia/peserta` | Edit 2-Tahap / Arsip / Ekspor | Server Action `updateParticipantAction`, Export API | `participants`, `checkins` | `SUPPORTED` |
| `/panitia/undangan/dosen` | Kelola Dosen, WA Draft, Email | Server Action `saveLecturerInvitationAction`, Brevo | `lecturer_invitations`, `email_jobs` | `SUPPORTED` |
| `/panitia/check-in` | Scan Kamera QR & Manual Presensi| `POST /api/checkins/resolve` & `/confirm` | `checkins`, RPC `confirm_checkin` | `SUPPORTED` |
| `/panitia/akun` | Buat & Kelola Akun Panitia | Server Action `saveAccountAction`, `toggle...` | `staff_profiles` | `SUPPORTED` |
| `/panitia/voting` | Modul Voting Calon Terfavorit | Antarmuka Informatif Phase 2 | — | `FUTURE_MODULE` |

---

## 5. Bukti Penghapusan Dummy & Integritas Git Tree

- **Berkas yang Telah Dihapus Fisik (`git rm`):**
  - `src/data/mock/seeds.ts`
  - `src/data/mock/mockStore.ts`
  - `src/data/adapters/index.ts`
  - Direktori `src/data` telah sepenuhnya hilang dari pohon repositori.
- **Audit Referensi:**
  `git grep -n -E "(@/data|src/data|mockStore)" src` mengembalikan **0 baris** di seluruh kode aplikasi.

---

## 6. Daftar Environment Keys yang Dibutuhkan

> *Peringatan: Seluruh nilai rahasia disimpan pada hosting environment, tidak di-commit ke repositori.*

- `NEXT_PUBLIC_SUPABASE_URL` (URL proyek Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Kunci publik aman untuk otentikasi client)
- `SUPABASE_SERVICE_ROLE_KEY` (Kunci administratif server untuk eksekusi terpercaya)
- `BREVO_API_KEY` (Kunci API v3 transactional email Brevo)
- `BREVO_SENDER_EMAIL` (Alamat email pengirim resmi panitia yang terverifikasi)
- `BREVO_SENDER_NAME` (Nama display pengirim, contoh: "MEMORIA 2026")
- `CRON_SECRET` (Token otentikasi worker background cron Vercel)
- `NEXT_PUBLIC_APP_URL` (Domain resmi aplikasi untuk pembentukan tautan web)

---

## 7. Instruksi Pengisian Data Awal (Event Provisioning)

1. **Jalankan Migrasi Database:** Eksekusi skrip `supabase/migrations/20261104085316_init_memoria_phase1_schema.sql` pada panel SQL Editor Supabase.
2. **Akun Administrator Utama:** Buat user baru di Supabase Auth, lalu daftarkan baris di tabel `staff_profiles` dengan `role = 'ADMIN_PANITIA'` dan `is_active = true`.
3. **Konfigurasi Awal Acara:** Baris default pada `event_settings` otomatis terisi melalui skrip migrasi. Admin dapat masuk ke `/panitia/website/beranda` untuk menyesuaikan nama acara, tanggal, venue, serta mengunggah poster bintang tamu.
4. **Kategori Tiket:** Masuk ke `/panitia/tiket/baru` untuk mempublikasikan kategori tiket gratis mahasiswa.

