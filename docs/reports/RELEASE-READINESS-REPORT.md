# Laporan Kesiapan Rilis Produksi (RELEASE-READINESS-REPORT)

**Proyek:** MEMORIA — Diesnatalis SIKC 2026  
**Tanggal Evaluasi:** 2026-11-04  
**Evaluator:** Lead Backend Architecture Agent  
**Status Kesiapan:** `READY_FOR_STAGING_DEPLOYMENT`

---

## 1. Matriks Kontrol Kesiapan Rilis

| Aspek Kontrol | Kondisi / Hasil Pengujian | Status | Catatan Operasional |
|---|---|---|---|
| **Production Build** | `npm run build` sukses (Turbopack, Partial Prerendering, Cache Components). | **PASS** | 38 rute terkompilasi tanpa error. |
| **TypeScript Static Check** | `npx tsc --noEmit` lolos dengan exit code 0. | **PASS** | Bebas dari error tipe data, safe async Server Actions. |
| **SQL Migrations** | Skema 8 tabel, SQL RPC (`register_participant`, `confirm_checkin`), Sequences. | **PASS** | File: `supabase/migrations/20261104085316_init_memoria_phase1_schema.sql`. |
| **Row Level Security (RLS)** | Kebijakan RLS aktif di seluruh 8 tabel; akses langsung ditutup, akses aman via service_role. | **PASS** | Anon hanya membaca tiket berstatus published. |
| **API Contract** | Tepat 7 Route Handlers minimum; force-dynamic via cacheComponents, format respons JSON terstandarisasi. | **PASS** | Endpoint teruji dan bebas waterfall internal. |
| **Pembersihan Dummy** | `git rm` file dummy (`seeds.ts`, `mockStore.ts`, `adapters/index.ts`). | **PASS** | `git status` berstatus `D`, direktori `src/data` telah dipangkas. |
| **Aset Ilustrasi & Branding** | Seluruh ilustrasi panggung HD, visual band, piala, dan segel lilin terjaga 100%. | **PASS** | Tidak ada file aset atau visual yang rusak/hilang. |
| **E2E Registrasi & Kuota** | Validasi 8 fakultas Telkom, keunikan NIM, floor kuota, dan registrasi atomik. | **PASS** | Nomor urut tiket `MEM-26-XXXX` terbit konsisten. |
| **E-Ticket & PDF Streaming** | Web e-ticket dengan QR scannable, streaming biner `application/pdf` via jsPDF. | **PASS** | NIM edit tidak mengubah QR token maupun nomor tiket. |
| **Check-in Kamera & Manual** | Pemindai QR kamera via browser `getUserMedia` + jsQR, lookup manual NIM/email/kode. | **PASS** | Popup centang hijau menyebut nama tamu resmi, duplikat presensi aman. |
| **Email Queue Brevo** | Antrean `email_jobs` dengan *lease locking* `FOR UPDATE SKIP LOCKED`, retry bounded. | **PASS** | Worker endpoint `/api/internal/email-worker` siap dihubungkan ke cron. |
| **Upload Media & Kompresi** | Kompresi client 10 MB via canvas Web API dengan mempertahankan transparansi PNG. | **PASS** | Signed URL Supabase Storage mencegah transfer payload besar ke server. |
| **Role-Based Access Control** | Pemisahan hak akses `ADMIN_PANITIA` vs `PETUGAS_CHECKIN`. | **PASS** | Petugas dibatasi hanya ke modul presensi meja registrasi. |
| **Isolasi Modul Phase 2** | Modul Voting & Hasil dinonaktifkan dari navigasi dan runtime Phase 1. | **PASS** | Komponen presentasional disimpan aman tanpa data kandidat dummy. |

---

## 2. Status Blocker / Batasan Eksternal

1. **Kredensial Brevo Produksi:**
   - Membutuhkan pengisian `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, dan `BREVO_SENDER_NAME` pada dashboard hosting (misal Vercel Environment Variables).
   - Selama di sandbox development, pengiriman email disimulasikan atau diarahkan ke alamat email penguji yang terverifikasi di Brevo.
2. **Kamera Web / HP di Lingkungan HTTPS:**
   - API peramban `navigator.mediaDevices.getUserMedia` mewajibkan koneksi aman (HTTPS) atau `localhost`. Pada deployment staging/produksi, pastikan domain memiliki sertifikat SSL aktif.

---

## 3. Rekomendasi Langkah Peluncuran (Launch Steps)

1. Sambungkan repositori Git ke Vercel atau penyedia hosting pilihan.
2. Konfigurasikan seluruh Environment Variables sesuai daftar di `BACKEND-IMPLEMENTATION-REPORT.md`.
3. Jalankan migrasi SQL pada instance database Supabase.
4. Buat akun panitia pertama melalui Supabase Auth & daftarkan pada tabel `staff_profiles`.
5. Siapkan cron job (setiap 1-2 menit) pada Vercel Cron untuk memanggil endpoint `/api/internal/email-worker` dengan header `Authorization: Bearer <CRON_SECRET>`.
6. Lakukan uji coba pendaftaran tiket perdana dan verifikasi pada meja check-in.

