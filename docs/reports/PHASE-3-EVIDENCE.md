# PHASE-3-EVIDENCE.md — Bukti Verifikasi Dua Lapis (2-Pass Gate) Phase 3
> **Tanggal Verifikasi:** 4 November 2026  
> **Status:** DONE_VERIFIED  
> **Verifikator:** Senior Full-Stack Engineer / Coding Agent

---

## Pass 1: Implementasi Storage, Upload & Kompresi
1. **Utility Kompresi Browser (`src/lib/imageCompression.ts`):**
   - Validasi ketat ukuran file asli: **maksimal 10 MB**. File > 10 MB langsung ditolak di sisi client sebelum diproses.
   - Whitelist MIME: `image/jpeg`, `image/png`, `image/webp`.
   - Menggunakan HTML5 Canvas untuk resize adaptif (maksimal sisi panjang 2000px).
   - **Mempertahankan Alpha Channel (Transparansi):** Gambar PNG & WebP di-encode ke format `image/webp` transparan sehingga model fashion dan aset siluet tidak memiliki latar belakang putih.
2. **Route Handler Otorisasi Upload (`src/app/api/uploads/authorize/route.ts`):**
   - Mengimplementasikan kontrak `POST /api/uploads/authorize`.
   - Memvalidasi sesi staf via `getCurrentStaffSession()` dan hanya mengizinkan peran `ADMIN_PANITIA`.
   - Membatasi purpose yang valid: `band`, `fashion`, `cms`.
   - Menghasilkan UUID path unik (`purpose/<timestamp>-<uuid>.<ext>`) pada bucket `memoria-media`.
   - Menghasilkan short-lived signed upload URL dan public URL permanen.
   - Tidak memproses payload biner pada Next.js API, melainkan mengizinkan browser mengunggah langsung ke Supabase Storage secara aman.

---

## Pass 2: Cross-Check Independen & Validasi Ketat
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - Endpoint `POST /api/uploads/authorize` dan modul `imageCompression.ts` lulus typecheck dengan **exit code 0**.
2. **Keamanan & Otorisasi:**
   - Permintaan tanpa sesi Admin ditolak dengan status HTTP 403 `FORBIDDEN`.
   - Ukuran payload kompresi dibatasi maksimal 5 MB di server.
3. **Konfirmasi Gate:**
   - Semua checklist PHASE 3 telah lengkap dan terverifikasi.
   - Gerbang PHASE 3 dinyatakan **PASS**.

