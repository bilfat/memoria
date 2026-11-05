# PHASE-2-EVIDENCE.md — Bukti Verifikasi Dua Lapis (2-Pass Gate) Phase 2
> **Tanggal Verifikasi:** 4 November 2026  
> **Status:** DONE_VERIFIED  
> **Verifikator:** Senior Full-Stack Engineer / Coding Agent

---

## Pass 1: Implementasi & Integrasi Auth Nyata
1. **Server Actions Auth (`src/app/actions/auth.ts`):**
   - `loginAction`: Mengautentikasi email & password via `supabase.auth.signInWithPassword`, memverifikasi profil di `staff_profiles`, dan menolak akun jika `is_active = false`.
   - `logoutAction`: Memanggil `supabase.auth.signOut` dan menginvalidasi session cache.
   - `getCurrentStaffSession`: Membaca sesi dari secure HTTP cookies SSR dan mengembalikan record profil internal panitia.
   - `listAccountsAction`: Mengambil daftar akun panitia dari `staff_profiles` terurut `created_at` (khusus role Admin).
   - `createAccountAction`: Mendaftarkan user baru di Supabase Auth via Admin API dan membuat profil staff otomatis.
   - `updateAccountAction`: Mengubah nama dan role, dengan proteksi atomik: **menolak penurunan role Admin terakhir**.
   - `toggleAccountStatusAction`: Mengaktifkan / menonaktifkan akun panitia, dengan proteksi atomik: **menolak penonaktifan Admin terakhir**.
   - `resetAccountPasswordAction`: Mengubah password user Auth via Admin API.
2. **Halaman Login Panitia (`src/app/panitia/login/page.tsx`):**
   - Menghapus tombol *demo quick credentials* palsu.
   - Mengganti login dummy mock adapter dengan pemanggilan `loginAction` Supabase Auth SSR.
   - Mengarahkan role `ADMIN_PANITIA` ke `/panitia` dan `PETUGAS_CHECKIN` ke `/panitia/check-in`.
3. **Route Guard & Layout Shell (`src/components/admin/AdminShell.tsx` & `AdminTopbar.tsx`):**
   - Menghapus tombol *quick switch role* palsu.
   - Membaca sesi nyata dari `getCurrentStaffSession()`; mengarahkan unauthenticated user ke `/panitia/login`.
   - Menampilkan status 403 Akses Ditolak bagi Petugas Check-in yang mengakses rute khusus Admin (`adminOnly = true`).
4. **Halaman Kelola Akun (`src/app/panitia/akun/page.tsx`):**
   - Terhubung penuh ke Server Actions riil (`listAccountsAction`, `createAccountAction`, `updateAccountAction`, `toggleAccountStatusAction`, `resetAccountPasswordAction`).
   - Modal tambah, edit, reset password, dan status aktif/nonaktif berfungsi dengan umpan balik toast nyata.

---

## Pass 2: Cross-Check Independen & Validasi Ketat
1. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - Seluruh modul auth dan dashboard panitia terverifikasi dengan **exit code 0** (0 errors).
2. **Perlindungan Role:**
   - Tidak ada lagi bypass role dummy di sisi client. Semua otorisasi divalidasi ganda: di komponen `AdminShell` dan di setiap Server Action melalui `getCurrentStaffSession()`.
3. **Konfirmasi Gate:**
   - Semua checklist PHASE 2 telah lengkap dan terverifikasi.
   - Gerbang PHASE 2 dinyatakan **PASS**.

