# PHASE-0-AUDIT.md — Laporan Audit Baseline, Inventaris Produk & Mock Sources
> **Tanggal Pelaksanaan:** 4 November 2026  
> **Status:** AUDIT COMPLETED — BASELINE VERIFIED  
> **Target:** Menyajikan inventaris rute aktual, mapping sumber data UI, klasifikasi file dummy, dan baseline kode sebelum implementasi backend.

---

## 1. Inventaris Rute Aktual (Next.js App Router)

### 1.1 Rute Publik (Phase 1 Scope)
- `/` (`src/app/page.tsx`): Beranda (Hero teater, Band spotlight, Teaser Fashion Show, Teaser Awarding).
- `/fashion-show` (`src/app/fashion-show/page.tsx`): Panggung Runway Fashion Show (Akan dikontrol via toggle `fashion_page_visible` / Coming Soon).
- `/awarding` (`src/app/awarding/page.tsx`): Golden Hall of Fame Awarding (Akan dikontrol via toggle `awarding_page_visible` / Coming Soon).
- `/daftar` (`src/app/daftar/page.tsx`): Pemilihan jenis tiket gratis publik.
- `/daftar/[ticketId]` (`src/app/daftar/[ticketId]/page.tsx`): Form registrasi mahasiswa (8 fakultas Telkom, prodi bebas, NIM unik).
- `/daftar/berhasil` (`src/app/daftar/berhasil/page.tsx`): Halaman sukses registrasi dan akses tiket.
- `/undangan/[inviteToken]` (`src/app/undangan/[inviteToken]/page.tsx`): Halaman personal undangan dosen (amplop, surat, QR).
- Target Baru: `/tiket/[token]` (akses personal e-ticket web).

### 1.2 Rute Internal / Dashboard Panitia (Phase 1 Scope)
- `/panitia/login` (`src/app/panitia/login/page.tsx`): Login Supabase Auth staff/admin.
- `/panitia` (`src/app/panitia/page.tsx`): Dashboard metrik & navigasi ringkas.
- `/panitia/website/beranda` (`src/app/panitia/website/beranda/page.tsx`): Editor CMS Beranda (Event & Countdown).
- `/panitia/website/band` (`src/app/panitia/website/band/page.tsx`): Editor CMS Band (Disederhanakan menjadi 1 band utama).
- `/panitia/website/fashion-show` (`src/app/panitia/website/fashion-show/page.tsx`): Teaser Fashion Show & toggle visibilitas.
- `/panitia/website/awarding` (`src/app/panitia/website/awarding/page.tsx`): Teaser Awarding & toggle visibilitas.
- `/panitia/tiket` (`src/app/panitia/tiket/page.tsx`): Daftar tiket, kuota terpakai, status.
- `/panitia/tiket/baru` (`src/app/panitia/tiket/baru/page.tsx`): Form tambah jenis tiket.
- `/panitia/tiket/[id]/edit` (`src/app/panitia/tiket/[id]/edit/page.tsx`): Form edit jenis tiket.
- `/panitia/peserta` (`src/app/panitia/peserta/page.tsx`): Kelola peserta, search, filter, arsip, ekspor Excel.
- `/panitia/peserta/[id]` (`src/app/panitia/peserta/[id]/page.tsx`): Detail peserta, edit 2-tahap, resend email.
- `/panitia/undangan/dosen` (`src/app/panitia/undangan/dosen/page.tsx`): Kelola daftar undangan dosen.
- `/panitia/undangan/template` (`src/app/panitia/undangan/template/page.tsx`): Kelola template surat undangan dosen.
- `/panitia/check-in` (`src/app/panitia/check-in/page.tsx`): Meja check-in scanner QR kamera & pencarian manual.
- `/panitia/akun` (`src/app/panitia/akun/page.tsx`): Kelola akun panitia & peran internal.

### 1.3 Rute Non-Phase 1 (`FUTURE_MODULE` - Ditunda ke Phase 2)
- `/vote/[voteToken]` (`src/app/vote/[voteToken]/page.tsx`): Private voting mahasiswa.
- `/panitia/voting` (`src/app/panitia/voting/page.tsx`): Kelola voting.
- `/panitia/voting/baru` (`src/app/panitia/voting/baru/page.tsx`): Tambah voting.
- `/panitia/voting/[id]/edit` (`src/app/panitia/voting/[id]/edit/page.tsx`): Edit voting.
- `/panitia/voting/[id]/hasil` (`src/app/panitia/voting/[id]/hasil/page.tsx`): Hasil perolehan voting.

---

## 2. Matriks UI -> Sumber Mock Saat Ini -> Sumber Supabase Riil

| Halaman / Fitur | Sumber Mock Saat Ini | Sumber Supabase Riil (Phase 1) | Target Mutasi / Read | Kategori Cleanup |
|---|---|---|---|---|
| **Beranda (Event & Countdown)** | `INITIAL_EVENT_CONTENT` + `mockStore` | `event_settings` (row tunggal) | Server Component / Action | `PENDING_INTEGRATION` |
| **Beranda (Band Spotlight)** | `INITIAL_BANDS` (array 3 band) + `mockStore` | `event_settings.band_*` (1 band) | Server Component / Action | `PENDING_INTEGRATION` |
| **Beranda (Teaser Fashion)** | `INITIAL_EVENT_CONTENT.fashionTeaser` | `event_settings.fashion_*` | Server Component / Action | `PENDING_INTEGRATION` |
| **Beranda (Teaser Awarding)**| `INITIAL_EVENT_CONTENT.awardingTeaser` | `event_settings.awarding_*` | Server Component / Action | `PENDING_INTEGRATION` |
| **Halaman `/fashion-show`** | `mockStore.getPublishedWinners('FASHION_SHOW')` | `event_settings.fashion_page_visible` (Coming Soon jika false) | Server Component | `PENDING_INTEGRATION` |
| **Halaman `/awarding`** | `mockStore.getPublishedWinners('AWARDING')` | `event_settings.awarding_page_visible` (Coming Soon jika false) | Server Component | `PENDING_INTEGRATION` |
| **Daftar & Detail Tiket** | `INITIAL_TICKETS` + `mockStore` | `ticket_types` (derived public status) | Server Component / Action | `PENDING_INTEGRATION` |
| **Registrasi Mahasiswa** | In-memory `mockStore` + `sessionStorage` | `POST /api/registrations` -> RPC `register_participant` -> `participants` + `email_jobs` | API Route Handler | `PENDING_INTEGRATION` |
| **E-Ticket Web & PDF** | Static generator dari `sessionStorage` / `mockStore` | `GET /api/tickets/[token]/pdf` & page query dari token personal | API Route Handler / Page | `PENDING_INTEGRATION` |
| **Data Peserta & Arsip** | `INITIAL_PARTICIPANTS` + `mockStore` | `participants` (soft-delete status `ACTIVE` / `ARCHIVED`) | Server Actions / Query | `PENDING_INTEGRATION` |
| **Ekspor Excel Peserta** | Client-side XLSX export dari `mockStore` | `GET /api/admin/participants/export` (Stream XLSX) | API Route Handler | `PENDING_INTEGRATION` |
| **Undangan Dosen & Template** | `INITIAL_LECTURER_INVITATIONS` + `mockStore` | `lecturer_invitations` + `event_settings.invitation_template` | Server Actions / Query | `PENDING_INTEGRATION` |
| **Check-in QR & Manual** | Mock client-side matching `mockStore` | `POST /api/checkins/resolve` & `POST /api/checkins/confirm` -> `checkins` | API Route Handlers | `PENDING_INTEGRATION` |
| **Akun Panitia & Login** | `INITIAL_ACCOUNTS` + `localStorage` session | Supabase Auth (`auth.users`) + `staff_profiles` | Supabase Auth SSR / Actions | `PENDING_INTEGRATION` |
| **Upload Foto 10 MB** | Base64 / Local URL dummy | `POST /api/uploads/authorize` -> Supabase Storage `memoria-media` | API Route Handler | `PENDING_INTEGRATION` |
| **Email Notifikasi** | Toast client "Email terkirim" palsu | `email_jobs` table + Brevo worker `GET /api/internal/email-worker` | Cron / Worker Handler | `PENDING_INTEGRATION` |
| **Voting & Pemenang** | `INITIAL_VOTINGS`, `INITIAL_CANDIDATES`, `INITIAL_WINNERS` | Ditunda ke Phase 2 (akses ditutup aman) | `FUTURE_MODULE` | `FUTURE_MODULE` |

---

## 3. Klasifikasi File & Rencana Penghapusan Dummy

### 3.1 `DUMMY_ONLY_FILE` (Wajib Dihapus Fisik via `git rm` setelah integrasi selesai)
1. `src/data/mock/seeds.ts`: Menyimpan data fiktif peserta, tiket, dosen, band, voting, dan pemenang dummy.
2. `src/data/mock/mockStore.ts`: Menyimpan class in-memory mock store, simulai localStorage, fake delay, fake auth, dan switch role.
3. `src/data/adapters/index.ts`: Adapter dummy yang saat ini menjadi perantara UI ke `mockStore`. Akan digantikan oleh Server Actions dan DB query riil.

### 3.2 `PRODUCTION_COMPONENT` & `DESIGN_ASSET` (Dilindungi, DILARANG Dihapus)
- Semua ilustrasi panggung: `public/images/theatre-concert-podium-hd-clean.png`, `band-silhouette.png`, asset runway, model SVG rig.
- Komponen GSAP, Layout, Navbar, Theatrical Rays, Footer.
- Desain amplop undangan dosen (`src/components/public/InvitationLetterEnvelope.tsx`).

### 3.3 `FUTURE_MODULE` (Dilindungi untuk Phase 2, Data Dummy Dimatikan)
- Komponen voting: `src/components/public/voting/*`.
- Rute admin voting: `src/app/panitia/voting/**/*`.
- Rute publik voting: `src/app/vote/**/*`.

---

## 4. Status Baseline Kode Saat Ini
- **TypeScript Check (`tsc --noEmit`):** PASS (Exit Code 0).
- **ESLint (`npm run lint`):** PASS pada kode inti, terdapat peringatan formatting & 1 aturan cascading renders di `PublicNavbar.tsx` (tidak menghalangi build).
- **Working Tree:** Bersih dan aman, siap untuk eksekusi Phase 1.

