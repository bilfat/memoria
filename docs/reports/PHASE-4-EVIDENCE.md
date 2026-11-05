# PHASE-4-EVIDENCE.md — Bukti Verifikasi Dua Lapis (2-Pass Gate) Phase 4
> **Tanggal Verifikasi:** 4 November 2026  
> **Status:** DONE_VERIFIED  
> **Verifikator:** Senior Full-Stack Engineer / Coding Agent

---

## Pass 1: Implementasi CMS Beranda, Band Tunggal, Teaser & Page Visibility
1. **Server Actions CMS (`src/app/actions/cms.ts`):**
   - `getPublicEventSettings`: Membaca proyeksi publik yang aman dari tabel `event_settings` (row tunggal `id=1`) tanpa mengekspos template surat internal.
   - `updateEventSettingsAction`: Memperbarui informasi event, countdown, band tunggal, teaser, dan toggle visibilitas halaman dengan proteksi role `ADMIN_PANITIA`. Melakukan revalidasi cache instan (`revalidatePath`) ke rute publik dan admin terkait.
2. **Editor CMS Beranda (`src/app/panitia/website/beranda/page.tsx`):**
   - Terhubung langsung ke `getPublicEventSettings` & `updateEventSettingsAction`.
   - Mengubah nama acara, tagline, deskripsi, tanggal/jam mulai (ISO WIB), venue, dan footer text secara persisten.
3. **Editor Band Tunggal (`src/app/panitia/website/band/page.tsx`):**
   - Menggantikan tabel multi-lineup menjadi satu form penampil band utama: Foto siluet, Nama Band, dan Deskripsi.
   - Menggunakan utility kompresi browser (`compressClientImage`) dan direct upload ke Supabase Storage via `/api/uploads/authorize`.
4. **Editor Teaser & Kontrol Visibilitas Halaman:**
   - **Fashion Show (`src/app/panitia/website/fashion-show/page.tsx`):** Mengelola judul teaser, deskripsi, upload foto model runway transparan, dan toggle visibilitas halaman `fashionPageVisible`.
   - **Awarding (`src/app/panitia/website/awarding/page.tsx`):** Mengelola judul teaser, deskripsi (tanpa field upload foto sesuai PRD), dan toggle visibilitas halaman `awardingPageVisible`.
5. **Halaman Publik `/`, `/fashion-show`, `/awarding`:**
   - **`/` (Beranda):** Mengambil data dari `getPublicEventSettings()`; panggung hero, countdown, panggung musik 1 band, dan teaser membaca data dinamis tanpa hardcode.
   - **`/fashion-show` & `/awarding`:** Menghilangkan kartu pemenang dummy fiktif. Jika toggle visibilitas dimatikan oleh admin, halaman menampilkan mode **Coming Soon** yang jujur dan elegan.

---

## Pass 2: Cross-Check Independen & Validasi Ketat
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - Seluruh halaman CMS admin dan publik lolos typecheck dengan **exit code 0** (0 errors).
2. **Konsistensi Data Lintas Layar:**
   - Perubahan data di CMS admin terbukti terhubung ke `event_settings` dan terefleksi langsung di Beranda, countdown, dan e-ticket.
   - Band tunggal mematuhi keputusan produk tanpa sistem reordering atau multi-band dummy.
3. **Konfirmasi Gate:**
   - Semua checklist PHASE 4 telah lengkap dan terverifikasi.
   - Gerbang PHASE 4 dinyatakan **PASS**.

